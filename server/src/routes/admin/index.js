import { Router } from 'express';
import Activity from '../../models/Activity.js';
import Media from '../../models/Media.js';
import User from '../../models/User.js';
import { contentModel } from '../../models/content.js';
import { COLLECTIONS, schemaForAdmin } from '../../content/schemas.js';
import { sourceOptions } from '../../content/bundle.js';
import { requireAuth, requirePasswordChosen } from '../../middleware/auth.js';
import { adminLimiter } from '../../middleware/security.js';
import { QUALITY } from '../../services/images.js';
import { rebuildStatus, run as runRebuild } from '../../services/rebuild.js';
import { storageKind, storageUsage } from '../../services/storage.js';
import { record } from '../../services/audit.js';
import env from '../../config/env.js';
import collections from './collections.js';
import singles from './singles.js';
import media from './media.js';
import files from './files.js';
import users from './users.js';

const router = Router();
router.use(adminLimiter, requireAuth, requirePasswordChosen);

router.get('/schema', (req, res) => {
  res.set('Cache-Control', 'private, max-age=300');
  res.json({
    ...schemaForAdmin(),
    storage: storageKind(),
    siteUrl: env.CLIENT_URL,
    quality: Object.fromEntries(Object.entries(QUALITY).map(([k, v]) => [k, v.label])),
  });
});

/** Choices that come from the content itself: every service name, the article categories. */
router.get('/sources', async (req, res) => {
  res.json(await sourceOptions());
});

router.get('/dashboard', async (req, res) => {
  const [counts, hidden, mediaAgg, recent, users, drafts, latest] = await Promise.all([
    Promise.all(COLLECTIONS.map(async (def) => [def.key, await contentModel(def.key).estimatedDocumentCount()])),
    Promise.all(COLLECTIONS.filter((d) => d.publishable).map(async (def) => [def.key, await contentModel(def.key).countDocuments({ published: false })])),
    Media.aggregate([{ $group: { _id: null, count: { $sum: 1 }, bytes: { $sum: '$bytes' }, original: { $sum: '$originalBytes' } } }]),
    Activity.find().sort({ at: -1 }).limit(12).lean(),
    User.countDocuments({ active: true }),
    contentModel('articles').find({ published: false }).sort({ updatedAt: -1 }).limit(5).select('title updatedAt').lean(),
    contentModel('articles').find({ published: { $ne: false } }).sort({ date: -1 }).limit(5).select('title date slug').lean(),
  ]);
  const certificatesWithout = await contentModel('certificates').countDocuments({ published: { $ne: false }, preview: 'none' });

  res.json({
    counts: Object.fromEntries(counts),
    hidden: Object.fromEntries(hidden),
    media: { count: mediaAgg[0]?.count || 0, bytes: mediaAgg[0]?.bytes || 0, originalBytes: mediaAgg[0]?.original || 0 },
    recent,
    users,
    drafts: drafts.map((d) => ({ id: String(d._id), title: d.title, updatedAt: d.updatedAt })),
    latest: latest.map((d) => ({ id: String(d._id), title: d.title, date: d.date, slug: d.slug })),
    certificatesWithout,
    website: rebuildStatus(),
  });
});

/** Cloudinary usage: separate because it calls an outside service and can be slow. */
router.get('/storage', async (req, res) => {
  res.json({ storage: storageKind(), usage: await storageUsage() });
});

router.get('/activity', async (req, res) => {
  const limit = 50;
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const [items, total] = await Promise.all([
    Activity.find().sort({ at: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Activity.estimatedDocumentCount(),
  ]);
  res.json({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
});

router.get('/website', (req, res) => res.json(rebuildStatus()));
router.post('/website/rebuild', async (req, res) => {
  const result = await runRebuild();
  record(req, { action: 'published the website', area: 'website', areaLabel: 'Website' });
  res.status(result.ok ? 200 : 502).json({ ...rebuildStatus(), ...(result.ok ? {} : { error: result.error || 'The publish request failed.' }) });
});

router.use('/c', collections);
router.use('/s', singles);
router.use('/media', media);
router.use('/files', files);
router.use('/users', users);

export default router;
