import defaults from './defaults.json';

/**
 * Where the website's words, prices and photos come from.
 *
 * Before each build, `scripts/fetch-content.mjs` saves what the client has
 * published in the admin panel to src/generated/content.json. Without it
 * (local development, or before the admin is set up) the built-in content in
 * src/content/defaults.json is used, which is the same content the database is
 * seeded with.
 */
const found = import.meta.glob('../generated/content.json', { eager: true, import: 'default' });
const live = Object.values(found)[0];

export const LIVE = Boolean(live && live.lists && live.singles);
const D = LIVE ? live : defaults;

/** One settings page. A page never saved in the admin keeps its built-in content. */
export const single = (key) => D.singles?.[key] || defaults.singles[key] || {};

/** Every published item of a list, in the order chosen in the admin. */
export const list = (key) => (D.lists?.[key] ?? defaults.lists[key] ?? []).filter((x) => x.published !== false);

/** When the content was last changed (ISO date), or null for the built-in content. */
export const contentUpdatedAt = LIVE ? live.updatedAt : null;

/** A short id for an item: its built-in key, or one made from its title. */
export const keyOf = (item, title = '') =>
  item.key ||
  String(title || item.title || item.name || item.id || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

/** "Text with **bold** words" → [[text], [bold, true], …] as the FAQ list draws it. */
export const boldSegments = (s) =>
  String(s || '')
    .split(/(\*\*[^*]+\*\*)/)
    .filter(Boolean)
    .map((part) => (/^\*\*[^*]+\*\*$/.test(part) ? [part.slice(2, -2), true] : [part]));

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

/** "Mar, Jun, Sep, Dec" → [2, 5, 8, 11] (months counted from 0, as JavaScript does). */
export const monthList = (s) => {
  const out = String(s || '')
    .split(/[\s,]+/)
    .map((m) => MONTHS.indexOf(m.slice(0, 3).toLowerCase()))
    .filter((i) => i >= 0);
  return out.length ? out : undefined;
};
