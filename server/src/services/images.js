// ─────────────────────────────────────────────────────────────
// Photo processing: every upload goes through here before storage.
//
//  1. Reject anything that is not really an image (checked from the
//     file's contents, not its name) and "decompression bombs".
//  2. Turn it the right way up (phone photos store rotation in EXIF).
//  3. Remove hidden data (EXIF/GPS location, camera serials).
//  4. Shrink it to the chosen size, never enlarging small photos.
//  5. Save as WebP at the chosen compression, with full-resolution
//     colour: visually the same as the original at a fraction of the size.
//  6. Make a tiny blurred preview and the main colour (shown while the
//     real photo loads), and find the most interesting spot, which is
//     offered as the automatic focus point.
// ─────────────────────────────────────────────────────────────

import sharp from 'sharp';
import { badRequest } from '../utils/http.js';

sharp.cache(false);
sharp.concurrency(2);

const ACCEPTED = new Set(['jpeg', 'png', 'webp', 'avif', 'heif', 'gif', 'tiff']);
export const MAX_EDGE = 2560;

/** Compression choices offered in the admin when uploading. */
export const QUALITY = {
  high: { label: 'High quality', quality: 90, edge: 3200 },
  balanced: { label: 'Balanced (recommended)', quality: 82, edge: 2560 },
  small: { label: 'Smallest file', quality: 70, edge: 1920 },
};
const MAX_INPUT_PIXELS = 120_000_000; // ~ a 12000 × 10000 photo

export const ACCEPT_HINT = 'JPG, PNG, WebP, AVIF, GIF or TIFF';

export async function processImage(buffer, { quality = 'balanced' } = {}) {
  const q = QUALITY[quality] || QUALITY.balanced;
  if (!buffer?.length) throw badRequest('The file is empty.');

  let meta;
  try {
    meta = await sharp(buffer, { limitInputPixels: MAX_INPUT_PIXELS }).metadata();
  } catch {
    throw badRequest(`This file is not a photo we can read. Please use ${ACCEPT_HINT}.`);
  }
  if (!ACCEPTED.has(meta.format)) {
    throw badRequest(meta.format === 'svg'
      ? 'SVG drawings are not accepted for safety reasons. Please export it as PNG.'
      : `This file type (${meta.format || 'unknown'}) is not supported. Please use ${ACCEPT_HINT}.`);
  }
  if ((meta.width || 0) < 40 || (meta.height || 0) < 40) throw badRequest('This picture is too small to use (under 40 pixels).');

  const base = () => sharp(buffer, { limitInputPixels: MAX_INPUT_PIXELS, failOn: 'error' })
    .rotate()
    .resize({ width: q.edge, height: q.edge, fit: 'inside', withoutEnlargement: true });

  const hasAlpha = Boolean(meta.hasAlpha);
  let out;
  try {
    out = await base()
      .webp(hasAlpha
        ? { quality: Math.min(95, q.quality + 4), alphaQuality: 100, effort: 5, smartSubsample: true }
        : { quality: q.quality, effort: 5, smartSubsample: true })
      .toBuffer({ resolveWithObject: true });
  } catch (err) {
    if (/HEIF|heic|compression format/i.test(err.message)) {
      throw badRequest('This looks like an iPhone HEIC photo that can’t be read here. On the iPhone choose Settings → Camera → Formats → “Most Compatible”, or share the photo as JPG.');
    }
    throw badRequest('This photo seems damaged and could not be read. Please try another copy of it.');
  }

  const [lqip, stats, auto] = await Promise.all([
    base().resize({ width: 24, height: 24, fit: 'inside' }).webp({ quality: 40 }).toBuffer(),
    sharp(out.data).stats(),
    autoFocus(out.data, out.info.width, out.info.height).catch(() => null),
  ]);
  const { r, g, b } = stats.dominant;
  const hex = (n) => n.toString(16).padStart(2, '0');

  return {
    buffer: out.data,
    width: out.info.width,
    height: out.info.height,
    bytes: out.info.size,
    format: 'webp',
    hasAlpha,
    lqip: `data:image/webp;base64,${lqip.toString('base64')}`,
    color: `#${hex(r)}${hex(g)}${hex(b)}`,
    auto,
  };
}

/**
 * The most interesting spot of a photo (faces, detail, strong colour), in % of
 * width and height. Found with sharp's "attention" crop on a small copy: a tall
 * thin strip finds the best column, a wide thin strip the best row.
 */
export async function autoFocus(buffer, width, height) {
  const small = await sharp(buffer).resize({ width: 400, height: 400, fit: 'inside' }).toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = small.info;
  const strip = async (sw, sh) => sharp(small.data)
    .resize({ width: sw, height: sh, fit: 'cover', position: sharp.strategy.attention })
    .toBuffer({ resolveWithObject: true });
  const col = Math.max(8, Math.round(w * 0.3));
  const row = Math.max(8, Math.round(h * 0.3));
  const [x, y] = await Promise.all([strip(col, h), strip(w, row)]);
  // cropOffsetLeft/Top are negative offsets of the kept area.
  const left = Math.abs(x.info.cropOffsetLeft ?? (w - col) / 2);
  const top = Math.abs(y.info.cropOffsetTop ?? (h - row) / 2);
  const fx = ((left + col / 2) / w) * 100;
  const fy = ((top + row / 2) / h) * 100;
  if (!Number.isFinite(fx) || !Number.isFinite(fy) || !width || !height) return null;
  return { x: Math.round(Math.min(100, Math.max(0, fx))), y: Math.round(Math.min(100, Math.max(0, fy))) };
}

/**
 * Cover parts of a photo for good (a client's name, PAN, GSTIN, QR code…).
 * Boxes are in % of the photo. The covered copy is a new file: nothing of
 * what was underneath can be recovered from it.
 */
export async function redactImage(buffer, boxes, { style = 'solid' } = {}) {
  const img = sharp(buffer, { limitInputPixels: MAX_INPUT_PIXELS }).rotate();
  const meta = await sharp(await img.clone().toBuffer()).metadata();
  const W = meta.width; const H = meta.height;
  const flat = await img.flatten({ background: '#ffffff' }).toBuffer();
  const layers = await Promise.all(boxes.map(async (b) => {
    const left = Math.max(0, Math.floor((b.x / 100) * W));
    const top = Math.max(0, Math.floor((b.y / 100) * H));
    const width = Math.max(1, Math.min(W - left, Math.ceil((b.w / 100) * W)));
    const height = Math.max(1, Math.min(H - top, Math.ceil((b.h / 100) * H)));
    if (style === 'blur') {
      // Shrink to a few pixels and blow back up: unreadable, and unlike a light blur it can't be undone.
      const tiny = await sharp(flat).extract({ left, top, width, height })
        .resize({ width: Math.max(1, Math.round(width / 24)), height: Math.max(1, Math.round(height / 24)), fit: 'fill' })
        .toBuffer();
      const input = await sharp(tiny).resize({ width, height, fit: 'fill', kernel: 'nearest' }).blur(Math.max(0.3, Math.min(width, height) / 20)).toBuffer();
      return { input, left, top };
    }
    const input = await sharp({ create: { width, height, channels: 3, background: '#1f2937' } }).png().toBuffer();
    return { input, left, top };
  }));
  return sharp(flat).composite(layers).png().toBuffer();
}
