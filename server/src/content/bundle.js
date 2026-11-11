// ─────────────────────────────────────────────────────────────
// The public "content bundle": everything the website shows, in one
// JSON file. The website build reads it and turns it into finished
// pages, so visitors and Google never wait on this server.
//
// It is built from schemas.js alone: every field is sent in the shape
// it is stored, with photos, PDFs and articles made ready to show.
// Kept in memory until something changes.
// ─────────────────────────────────────────────────────────────

import { createHash } from 'node:crypto';
import FileAsset from '../models/FileAsset.js';
import Media from '../models/Media.js';
import Single from '../models/Single.js';
import { contentModel } from '../models/content.js';
import { COLLECTIONS, SINGLES } from './schemas.js';
import { fileIdsIn, mediaIdsIn } from './validate.js';
import { renderRichText } from './richtext.js';
import { cropPixels, fileUrls, shareImageUrl, urlPattern } from '../services/storage.js';
import { contentChanged } from '../services/rebuild.js';

export function sortFor(def) {
  if (def.sort) return { ...def.sort, _id: 1 };
  if (def.orderable) return { order: 1, createdAt: 1, _id: 1 };
  return { createdAt: 1, _id: 1 };
}

const iso = (d) => (d ? new Date(d).toISOString() : null);
const compact = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== ''));

/** Load every published item and the photos and files they use. */
export async function loadAll({ includeHidden = false } = {}) {
  const lists = {};
  await Promise.all(COLLECTIONS.map(async (def) => {
    const filter = def.publishable && !includeHidden ? { published: { $ne: false } } : {};
    lists[def.key] = await contentModel(def.key).find(filter).sort(sortFor(def)).lean();
  }));
  const singleDocs = await Single.find().lean();
  const singles = Object.fromEntries(singleDocs.map((s) => [s.key, s.data || {}]));

  const ids = mediaIdsIn([...Object.values(lists), ...Object.values(singles)]);
  const fileIds = fileIdsIn([...Object.values(lists), ...Object.values(singles)]);
  const [media, files] = await Promise.all([
    ids.size ? Media.find({ _id: { $in: [...ids] } }).lean() : [],
    fileIds.size ? FileAsset.find({ _id: { $in: [...fileIds] } }).lean() : [],
  ]);
  const mediaMap = new Map(media.map((m) => [String(m._id), m]));
  const fileMap = new Map(files.map((f) => [String(f._id), f]));
  const updatedAt = [...singleDocs, ...Object.values(lists).flat()]
    .reduce((max, d) => (d.updatedAt && d.updatedAt > max ? d.updatedAt : max), new Date(0));
  return { lists, singles, singleDocs, mediaMap, fileMap, updatedAt };
}

/** Stored image value → what the website's <Img> needs. */
export function makeImage(mediaMap) {
  return (v, { share = false } = {}) => {
    if (!v) return null;
    const pos = v.focal ? `${v.focal.x}% ${v.focal.y}%` : undefined;
    if (v.media) {
      const m = mediaMap.get(String(v.media));
      if (!m) return null;
      const px = cropPixels(m, v.crop);
      return compact({
        url: urlPattern(m, v.crop),
        w: px ? px.w : m.width,
        h: px ? px.h : m.height,
        pos,
        alt: v.alt || m.alt || undefined,
        color: m.color || undefined,
        // The blurred preview shows the whole photo, so it's skipped for cropped ones.
        lqip: v.crop ? undefined : m.lqip || undefined,
        share: share ? shareImageUrl(m, v.crop) || undefined : undefined,
      });
    }
    if (v.src) return compact({ url: v.src, pos, alt: v.alt || undefined });
    return null;
  };
}

/** Stored file value → what the website needs to show, open and download a PDF. */
function makeFile(fileMap) {
  return (v) => {
    const f = v?.file && fileMap.get(String(v.file));
    if (!f) return null;
    const u = fileUrls(f);
    return compact({
      url: u.url,
      download: u.download,
      thumb: u.thumb && f.width ? { url: u.thumb, w: f.width, h: f.height } : undefined,
      pages: f.pages || undefined,
      bytes: f.bytes,
      name: f.originalName || undefined,
    });
  };
}

/** One stored item → its public shape, following the field definitions. */
function shaper(mediaMap, fileMap) {
  const img = makeImage(mediaMap);
  const file = makeFile(fileMap);
  const shape = (fields, data) => {
    const out = {};
    for (const f of fields) {
      if (f.type === 'heading' || f.hidden) continue;
      const v = data?.[f.name];
      if (v === undefined || v === null || v === '') continue;
      switch (f.type) {
        case 'image': out[f.name] = img(v, { share: f.share }); break;
        case 'file': out[f.name] = file(v); break;
        case 'richtext': out[f.name] = renderRichText(v, mediaMap); break;
        case 'datetime': out[f.name] = iso(v); break;
        case 'list':
          out[f.name] = f.of === 'text' ? [...v] : (Array.isArray(v) ? v.map((item) => shape(f.fields, item)) : []);
          break;
        default: out[f.name] = v;
      }
      if (out[f.name] === null) delete out[f.name];
    }
    return out;
  };
  return shape;
}

export async function buildBundle() {
  const { lists, singles, singleDocs, mediaMap, fileMap, updatedAt } = await loadAll();
  const shape = shaper(mediaMap, fileMap);

  const bundle = {
    singles: Object.fromEntries(SINGLES.filter((s) => singles[s.key]).map((s) => [s.key, shape(s.fields, singles[s.key])])),
    lists: Object.fromEntries(COLLECTIONS.map((def) => [def.key, lists[def.key].map((doc) => ({
      id: String(doc._id),
      ...shape(def.fields, doc),
      updatedAt: iso(doc.updatedAt),
    }))])),
    updatedAt: iso(updatedAt),
    singlesUpdatedAt: Object.fromEntries(singleDocs.map((s) => [s.key, iso(s.updatedAt)])),
  };
  bundle.version = createHash('sha1').update(JSON.stringify(bundle)).digest('hex').slice(0, 16);
  return bundle;
}

// ─── Cache ────────────────────────────────────────────────────
let cached = null;
let building = null;

export async function getBundle() {
  if (cached) return cached;
  if (!building) {
    building = buildBundle()
      .then((b) => { cached = b; return b; })
      .finally(() => { building = null; });
  }
  return building;
}

/** Call after any change to content, settings or photos. */
export function contentUpdated() {
  cached = null;
  contentChanged();
}

/** Options that come from the content itself (offered in some admin fields). */
export async function loadSources() {
  const [services, hub] = await Promise.all([
    contentModel('services').find().sort({ order: 1 }).select('name items').lean(),
    Single.findOne({ key: 'hub' }).lean(),
  ]);
  return {
    serviceItems: [...new Set(services.flatMap((s) => (s.items || []).map((i) => i.name)))],
    hubCategories: (hub?.data?.categories || []).map((c) => c.key).filter(Boolean),
  };
}

/** The same options with their labels, for the admin panel's drop-downs. */
export async function sourceOptions() {
  const [services, hub] = await Promise.all([
    contentModel('services').find().sort({ order: 1 }).select('name items').lean(),
    Single.findOne({ key: 'hub' }).lean(),
  ]);
  return {
    serviceItems: services.flatMap((s) => (s.items || []).map((i) => ({ value: i.name, label: `${i.name} — ${i.price}`, group: s.name }))),
    hubCategories: (hub?.data?.categories || []).filter((c) => c.key).map((c) => ({ value: c.key, label: c.label })),
  };
}
