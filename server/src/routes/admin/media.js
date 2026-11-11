import { Router } from 'express';
import multer from 'multer';
import env from '../../config/env.js';
import Media from '../../models/Media.js';
import { contentUpdated } from '../../content/bundle.js';
import { mediaPublic, mediaUsageMap } from '../../content/helpers.js';
import { uploadLimiter } from '../../middleware/security.js';
import { record } from '../../services/audit.js';
import { QUALITY, processImage, redactImage } from '../../services/images.js';
import { putImage, readImage, removeImage, storageKind } from '../../services/storage.js';
import { badRequest, conflict, escapeRegex, isObjectId, log, notFound } from '../../utils/http.js';

const router = Router();
// Files are held in memory while processed, so keep batches small (the panel sends 4 at a time).
const MAX_FILES = 6;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.MAX_UPLOAD_MB * 1024 * 1024, files: MAX_FILES, fields: 5, parts: MAX_FILES + 5 },
});

router.get('/', async (req, res) => {
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 60, 1), 200);
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const q = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 100) : '';
  const filter = q ? { $or: [{ originalName: new RegExp(escapeRegex(q), 'i') }, { alt: new RegExp(escapeRegex(q), 'i') }] } : {};

  const [docs, total, usage] = await Promise.all([
    Media.find(filter).sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Media.countDocuments(filter),
    req.query.usage === '0' ? null : mediaUsageMap(),
  ]);
  let unused = docs.map((m) => ({ ...mediaPublic(m), usedIn: usage ? (usage.get(String(m._id)) || []).length : null }));
  if (req.query.unused === '1') unused = unused.filter((m) => m.usedIn === 0);
  res.json({ items: unused, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
});

router.get('/stats', async (req, res) => {
  const [agg] = await Media.aggregate([{ $group: { _id: null, count: { $sum: 1 }, bytes: { $sum: '$bytes' }, original: { $sum: '$originalBytes' } } }]);
  res.json({ count: agg?.count || 0, bytes: agg?.bytes || 0, originalBytes: agg?.original || 0, storage: storageKind() });
});

/** Upload one or more photos. Each is checked, straightened, cleaned, shrunk and turned into WebP. */
router.post('/', uploadLimiter, upload.array('files', MAX_FILES), async (req, res) => {
  const files = req.files || [];
  if (!files.length) throw badRequest('Please choose at least one photo.');

  const items = [];
  const failed = [];
  const quality = QUALITY[req.body?.quality] ? req.body.quality : 'balanced';
  // One at a time keeps memory low on small servers.
  for (const file of files) {
    const name = String(file.originalname || 'photo').normalize('NFC').replace(/[^\p{L}\p{N} ._()-]/gu, '').slice(0, 200) || 'photo';
    try {
      const img = await processImage(file.buffer, { quality });
      const stored = await putImage(img.buffer);
      const doc = await Media.create({
        ...stored,
        width: img.width,
        height: img.height,
        bytes: img.bytes,
        originalBytes: file.size,
        originalName: name,
        alt: typeof req.body?.alt === 'string' ? req.body.alt.trim().slice(0, 200) : '',
        lqip: img.lqip,
        color: img.color,
        hasAlpha: img.hasAlpha,
        auto: img.auto || undefined,
        quality,
        uploadedBy: req.user._id,
      });
      items.push({ ...mediaPublic(doc), usedIn: 0 });
    } catch (err) {
      if (!err.status || err.status >= 500) log.error('Upload failed:', name, err);
      failed.push({ name, error: err.status && err.status < 500 ? err.message : 'This photo could not be saved. Please try again.' });
    } finally {
      file.buffer = null;
    }
  }
  if (items.length) {
    record(req, { action: `uploaded ${items.length} photo${items.length === 1 ? '' : 's'}`, area: 'media', areaLabel: 'Photo library', itemTitle: items.map((i) => i.originalName).join(', ') });
  }
  res.status(items.length ? 201 : 400).json({
    items,
    failed,
    ...(!items.length && { error: failed[0]?.error || 'No photos could be uploaded.' }),
  });
});

/**
 * "Hide details": cover parts of a photo for good and save the result as a new
 * photo. Boxes are in % of the photo; the original is left untouched in the library.
 */
router.post('/:id/redact', uploadLimiter, async (req, res) => {
  if (!isObjectId(req.params.id)) throw notFound();
  const src = await Media.findById(req.params.id);
  if (!src) throw notFound('This photo no longer exists.');
  const num = (v) => (typeof v === 'number' ? v : Number(v));
  const boxes = (Array.isArray(req.body?.boxes) ? req.body.boxes : []).slice(0, 40)
    .map((b) => ({ x: num(b?.x), y: num(b?.y), w: num(b?.w), h: num(b?.h) }))
    .filter((b) => [b.x, b.y, b.w, b.h].every(Number.isFinite) && b.w > 0.2 && b.h > 0.2)
    .map((b) => ({ x: Math.max(0, Math.min(100, b.x)), y: Math.max(0, Math.min(100, b.y)), w: Math.min(100, b.w), h: Math.min(100, b.h) }));
  if (!boxes.length) throw badRequest('Draw at least one box over the details to hide.');
  const style = req.body?.style === 'blur' ? 'blur' : 'solid';

  const covered = await redactImage(await readImage(src), boxes, { style });
  const img = await processImage(covered, { quality: src.quality === 'small' ? 'balanced' : src.quality || 'balanced' });
  const stored = await putImage(img.buffer);
  const base = (src.originalName || 'photo').replace(/\.(\w{2,5})$/, '').replace(/ \(details hidden\)$/, '');
  const doc = await Media.create({
    ...stored,
    width: img.width,
    height: img.height,
    bytes: img.bytes,
    originalBytes: src.originalBytes || src.bytes,
    originalName: `${base} (details hidden)`.slice(0, 200),
    alt: src.alt,
    lqip: img.lqip,
    color: img.color,
    hasAlpha: false,
    auto: img.auto || undefined,
    quality: src.quality || 'balanced',
    redactedFrom: src._id,
    uploadedBy: req.user._id,
  });
  record(req, { action: 'hid details on a photo', area: 'media', areaLabel: 'Photo library', itemId: doc._id, itemTitle: doc.originalName });
  res.status(201).json({ item: { ...mediaPublic(doc), usedIn: 0 } });
});

router.patch('/:id', async (req, res) => {
  if (!isObjectId(req.params.id)) throw notFound();
  const alt = typeof req.body?.alt === 'string' ? req.body.alt.trim() : null;
  if (alt === null) throw badRequest('Nothing to change.');
  if (alt.length > 200) throw badRequest('Please keep the description under 200 characters.', { alt: 'Too long' });
  const doc = await Media.findByIdAndUpdate(req.params.id, { $set: { alt } }, { returnDocument: 'after' }).lean();
  if (!doc) throw notFound('This photo no longer exists.');
  contentUpdated();
  res.json({ item: mediaPublic(doc) });
});

router.get('/:id/usage', async (req, res) => {
  if (!isObjectId(req.params.id)) throw notFound();
  const usage = await mediaUsageMap();
  res.json({ usedIn: usage.get(req.params.id) || [] });
});

router.delete('/:id', async (req, res) => {
  if (!isObjectId(req.params.id)) throw notFound();
  const doc = await Media.findById(req.params.id);
  if (!doc) throw notFound('This photo was already deleted.');
  const usedIn = (await mediaUsageMap()).get(req.params.id) || [];
  if (usedIn.length) {
    const where = usedIn.slice(0, 3).map((u) => `${u.label}: ${u.title}`).join('; ');
    throw conflict(`This photo is still used on the website (${where}${usedIn.length > 3 ? '…' : ''}). Replace it there first, then delete it.`, { usedIn });
  }
  await doc.deleteOne();
  await removeImage(doc);
  record(req, { action: 'deleted a photo', area: 'media', areaLabel: 'Photo library', itemId: doc._id, itemTitle: doc.originalName });
  res.json({ ok: true });
});

export default router;
