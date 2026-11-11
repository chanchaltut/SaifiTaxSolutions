/**
 * Photos used behind cards, as lightweight WebP files in src/assets/cards/.
 * Every photo is CC0 or public domain (free for commercial use); sources are
 * listed in src/assets/cards/CREDITS.md. A missing file simply renders no photo.
 */
const FILES = import.meta.glob('../assets/cards/*.webp', { eager: true, import: 'default' });

export const cardImage = (name) => (name ? FILES[`../assets/cards/${name}.webp`] || null : null);

/* Which photo each card uses. Keys are photo file names in src/assets/cards/. */
export const IMG = {
  category: { gst: 'gst', itr: 'itr', tds: 'payroll', legal: 'legal', pf: 'team', tm: 'brand', inc: 'company', mca: 'office', ie: 'shipping', acc: 'accounting', msme: 'shop', fssai: 'food' },
  vertical: { itr: 'itr', gst: 'gst', inc: 'company' },
  plan: { salaried: 'laptop', business: 'freelancer', 'gst-msme': 'shop', 'gst-returns': 'accounting' },
  step: ['phone', 'audit', 'calculator', 'handshake'],
  notice: { s139: 'documents', s143: 'notice', ais: 'stocks', gst: 'gst' },
  due: { tds: 'payroll', gstr1: 'gst', gstr3b: 'calculator', itr: 'itr' },
  radar: { gstr1: 'gst', gstr3b: 'calculator', tds: 'payroll', advance: 'charts' },
  licence: { fssai: 'food', trademark: 'brand', iec: 'shipping', dsc: 'signature', reports: 'charts', company: 'company' },
  guide: { 'itr-basics': 'itr', 'itr-forms': 'documents', 'itr-documents': 'audit', 'itr-comparison': 'stocks' },
  tool: { gst: 'gst', emi: 'house', estimator: 'freelancer', checker: 'itr', soon: 'documents' },
  contact: ['phone', 'handshake', 'laptop', 'office'],
};
