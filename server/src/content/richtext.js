// ─────────────────────────────────────────────────────────────
// Articles written in the admin's editor.
//
// Saving: the HTML from the editor is cleaned down to a short list of
// safe tags (headings, lists, links, tables, quotes, photos). Scripts,
// styles, event handlers and pasted pictures from other websites are
// removed, so nothing typed or pasted can break or attack the site.
//
// Publishing: each photo is given the right sizes for every screen from
// the photo library, headings get anchors for the "On this page" list,
// and tables can scroll sideways on phones.
// ─────────────────────────────────────────────────────────────

import sanitizeHtml from 'sanitize-html';
import { cropPixels, urlPattern } from '../services/storage.js';
import { slugify } from '../utils/http.js';

const SIZES = ['full', 'medium', 'small'];

const OPTIONS = {
  allowedTags: ['p', 'br', 'h2', 'h3', 'h4', 'strong', 'em', 'u', 's', 'a', 'ul', 'ol', 'li', 'blockquote', 'hr', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    img: ['src', 'alt', 'width', 'height', 'data-media', 'data-crop', 'data-size'],
    th: ['colspan', 'rowspan'],
    td: ['colspan', 'rowspan'],
    ol: ['start'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['http', 'https'] },
  allowProtocolRelative: false,
  disallowedTagsMode: 'discard',
  // Text inside removed wrappers (div, span, font…) is kept; their tags are not.
  nonTextTags: ['style', 'script', 'textarea', 'option', 'noscript', 'title'],
  // Only photos from the photo library: pasted pictures from other sites break when they move.
  exclusiveFilter: (frame) => frame.tag === 'img' && !/^[a-f0-9]{24}$/.test(frame.attribs['data-media'] || ''),
  transformTags: {
    h1: 'h2',
    h5: 'h4',
    h6: 'h4',
    b: 'strong',
    i: 'em',
    strike: 's',
    del: 's',
    a: (tag, attribs) => {
      const href = (attribs.href || '').trim();
      const external = /^https?:\/\//i.test(href);
      return {
        tagName: 'a',
        attribs: {
          href,
          ...(external && { target: '_blank', rel: 'noopener' }),
        },
      };
    },
    img: (tag, attribs) => {
      const crop = /^\d+(\.\d+)?(,\d+(\.\d+)?){3}$/.test(attribs['data-crop'] || '') ? attribs['data-crop'] : undefined;
      return {
        tagName: 'img',
        attribs: {
          src: attribs.src || '',
          alt: String(attribs.alt || '').slice(0, 200),
          'data-media': attribs['data-media'] || '',
          ...(crop && { 'data-crop': crop }),
          'data-size': SIZES.includes(attribs['data-size']) ? attribs['data-size'] : 'full',
        },
      };
    },
  },
};

export function sanitizeRichText(html) {
  const clean = sanitizeHtml(String(html || ''), OPTIONS)
    // Links must go somewhere safe; empty or odd links lose their tag, the words stay.
    .replace(/<a href="(?!https?:\/\/|mailto:|tel:|\/|#)[^"]*"[^>]*>([\s\S]*?)<\/a>/g, '$1')
    .replace(/<p>\s*<\/p>/g, '')
    .trim();
  return clean;
}

const stripTags = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();

/** Number of words in an article (0 for an empty editor). */
export const textLength = (html) => {
  const t = stripTags(String(html || ''));
  return t ? t.split(' ').length : 0;
};

const attrsOf = (s) => Object.fromEntries([...s.matchAll(/([\w-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function photo(attrs, mediaMap) {
  const m = mediaMap.get(attrs['data-media']);
  if (!m) return '';
  const c = attrs['data-crop'] ? attrs['data-crop'].split(',').map(Number) : null;
  const crop = c ? { x: c[0], y: c[1], w: c[2], h: c[3] } : null;
  const px = cropPixels(m, crop);
  const w = px ? px.w : m.width;
  const h = px ? px.h : m.height;
  const pattern = urlPattern(m, crop);
  const widths = [480, 800, 1200, 1600].filter((x) => x <= w);
  if (!widths.length || widths[widths.length - 1] < w) widths.push(Math.min(w, 1600));
  const size = SIZES.includes(attrs['data-size']) ? attrs['data-size'] : 'full';
  const sizes = size === 'small' ? '(max-width: 760px) 60vw, 320px' : size === 'medium' ? '(max-width: 760px) 100vw, 480px' : '(max-width: 760px) 100vw, 760px';
  const alt = attrs.alt || m.alt || '';
  const img = `<img src="${esc(pattern.replace('{w}', String(Math.min(1200, w))))}" srcset="${esc([...new Set(widths)].map((x) => `${pattern.replace('{w}', String(x))} ${x}w`).join(', '))}" sizes="${sizes}" width="${w}" height="${h}" alt="${esc(alt)}" loading="lazy" decoding="async">`;
  return `<figure class="gfig gfig--${size}">${img}</figure>`;
}

/**
 * Stored article HTML → what the website shows.
 * @returns {{ html: string, toc: {id: string, text: string}[], words: number }}
 */
export function renderRichText(html, mediaMap) {
  if (!html) return null;
  const used = new Set();
  const toc = [];
  let out = String(html)
    .replace(/<img\b([^>]*)>/g, (_, a) => photo(attrsOf(a), mediaMap))
    .replace(/<h2>([\s\S]*?)<\/h2>/g, (_, inner) => {
      const text = stripTags(inner);
      let id = slugify(text) || 'section';
      for (let i = 2; used.has(id); i++) id = `${slugify(text) || 'section'}-${i}`;
      used.add(id);
      toc.push({ id, text });
      return `<h2 id="${id}">${inner}</h2>`;
    })
    .replace(/<table>/g, '<div class="gtable"><table>')
    .replace(/<\/table>/g, '</table></div>');
  // A photo on its own line sits in a paragraph in the editor; a figure can't live inside a <p>.
  out = out.replace(/<p>\s*(<figure[\s\S]*?<\/figure>)\s*<\/p>/g, '$1');
  return { html: out, toc, words: textLength(html) };
}
