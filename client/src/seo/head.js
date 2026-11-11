/**
 * The same `meta` object drives both the prerendered <head> string and the
 * client-side head updates on navigation, so the two can never drift apart.
 */

import { SITE } from '../content/site';

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Keeps "</script>" out of inline JSON-LD. */
const safeJson = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

function tags(meta) {
  const names = [
    ['description', meta.description],
    ['robots', meta.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'],
    ['author', 'Saifi Tax Solutions'],
    ['geo.region', 'IN-UT'],
    ['geo.placename', 'Dehradun, Uttarakhand'],
    ['geo.position', `${SITE.geo.lat};${SITE.geo.lng}`],
    ['ICBM', `${SITE.geo.lat}, ${SITE.geo.lng}`],
    ['designer', SITE.credit.name],
    ['twitter:card', 'summary_large_image'],
    ['twitter:title', meta.title],
    ['twitter:description', meta.description],
    ['twitter:image', meta.image],
    ['twitter:image:alt', meta.imageAlt],
  ];
  const props = [
    ['og:type', meta.ogType],
    ['og:site_name', 'Saifi Tax Solutions'],
    ['og:title', meta.title],
    ['og:description', meta.description],
    ['og:url', meta.canonical],
    ['og:image', meta.image],
    ['og:image:type', /\.jpe?g($|\?)|f_jpg/.test(meta.image) ? 'image/jpeg' : 'image/png'],
    ['og:image:width', '1200'],
    ['og:image:height', '630'],
    ['og:image:alt', meta.imageAlt],
    ['og:locale', 'en_IN'],
  ];
  if (meta.modified) props.push(['article:modified_time', meta.modified]);
  return { names, props };
}

export function renderHead(meta) {
  const { names, props } = tags(meta);
  return [
    `<title>${esc(meta.title)}</title>`,
    ...names.map(([k, v]) => `<meta name="${k}" content="${esc(v)}" data-seo />`),
    ...props.map(([k, v]) => `<meta property="${k}" content="${esc(v)}" data-seo />`),
    `<link rel="canonical" href="${esc(meta.canonical)}" data-seo />`,
    `<link rel="alternate" hreflang="en-IN" href="${esc(meta.canonical)}" data-seo />`,
    `<link rel="alternate" hreflang="x-default" href="${esc(meta.canonical)}" data-seo />`,
    `<script type="application/ld+json" data-seo>${safeJson(meta.jsonLd)}</script>`,
  ].join('\n    ');
}

/** Applied on client-side route changes. */
export function syncHead(meta) {
  document.title = meta.title;
  document.querySelectorAll('[data-seo]').forEach((n) => n.remove());
  const { names, props } = tags(meta);
  const add = (tag, attrs, text) => {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    el.setAttribute('data-seo', '');
    if (text) el.textContent = text;
    document.head.appendChild(el);
  };
  names.forEach(([name, content]) => add('meta', { name, content }));
  props.forEach(([property, content]) => add('meta', { property, content }));
  add('link', { rel: 'canonical', href: meta.canonical });
  add('link', { rel: 'alternate', hreflang: 'en-IN', href: meta.canonical });
  add('link', { rel: 'alternate', hreflang: 'x-default', href: meta.canonical });
  add('script', { type: 'application/ld+json' }, JSON.stringify(meta.jsonLd));
}
