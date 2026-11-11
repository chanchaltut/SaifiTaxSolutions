import { keyOf, list, single } from './data';

/*
 * The service categories, every service in them and its fee. Edited in the
 * admin panel: Services → Services & fees. This file adds what is not
 * edited there: which guides, due dates, notices, licence card and plans
 * each built-in category's page links to.
 */
const LINKS = {
  gst: {
    related: { licence: null, guides: [], dueDates: ['gstr1', 'gstr3b'], notices: ['gst'] },
    plans: ['gst-msme', 'gst-returns'],
  },
  itr: {
    related: {
      licence: null,
      guides: ['itr-basics', 'itr-forms', 'itr-documents', 'itr-comparison'],
      dueDates: ['itr'],
      notices: ['s139', 's143', 'ais'],
    },
    plans: ['salaried', 'business'],
  },
  tds: {
    related: { licence: null, guides: ['itr-comparison'], dueDates: ['tds'], notices: [] },
    plans: [],
  },
  legal: {
    related: { licence: null, guides: [], dueDates: [], notices: ['s139', 's143', 'ais', 'gst'] },
    plans: [],
  },
  pf: {
    related: { licence: null, guides: [], dueDates: [], notices: [] },
    plans: [],
  },
  tm: {
    related: { licence: 'trademark', guides: [], dueDates: [], notices: [] },
    plans: [],
  },
  inc: {
    related: { licence: 'company', guides: [], dueDates: [], notices: [] },
    plans: [],
  },
  mca: {
    related: { licence: 'company', guides: [], dueDates: [], notices: [] },
    plans: [],
  },
  ie: {
    related: { licence: 'iec', guides: [], dueDates: [], notices: [] },
    plans: [],
  },
  acc: {
    related: { licence: 'reports', guides: [], dueDates: [], notices: [] },
    plans: [],
  },
  msme: {
    related: { licence: null, guides: [], dueDates: [], notices: [] },
    plans: ['gst-msme'],
  },
  fssai: {
    related: { licence: 'fssai', guides: [], dueDates: [], notices: [] },
    plans: [],
  },
};

const NO_LINKS = { related: { licence: null, guides: [], dueDates: [], notices: [] }, plans: [] };

const sections = single('sections');

export const SERVICE_NOTE = sections.servicesNote;
export const SERVICE_META_LINE = sections.servicesLine;

export const categories = list('services').map((c) => {
  const cat = keyOf(c, c.slug);
  return {
    cat,
    keywords: c.keywords || c.name,
    name: c.name,
    from: c.from,
    desc: c.desc,
    items: (c.items || []).map((i) => ({ name: i.name, price: i.price })),
    slug: c.slug,
    code: c.code,
    tab: c.tab,
    seoTitle: c.seoTitle,
    keyword: c.keyword || c.name,
    ...(LINKS[cat] || NO_LINKS),
    photo: c.photo || null,
    path: `/services/${c.slug}/`,
    price: c.from.replace('Starting from ', ''),
  };
});

export const totalServices = categories.reduce((n, c) => n + c.items.length, 0);

export const categoryByCat = (cat) => categories.find((c) => c.cat === cat);

export const itemEnquiry = (name) =>
  `Hi Saifi Tax, I want to enquire about: ${name}. Please share the process, documents and fee.`;
export const categoryEnquiry = (name) =>
  `Hi Saifi Tax Solutions, I need help with ${name}. Please share the details.`;
export const notFoundEnquiry =
  'Hi Saifi Tax Solutions, I could not find my service on your website. Please help me.';

/**
 * Parses "Starting from ₹1,999/month" style labels for structured data.
 * Returns null for on-consultation entries.
 */
export const parsePrice = (label) => {
  const match = label && label.match(/₹([\d,]+)/);
  if (!match) return null;
  return {
    amount: Number(match[1].replace(/,/g, '')),
    unit: /\/quarter/.test(label) ? 'quarter' : /\/month/.test(label) ? 'month' : null,
    plusGovtFee: /Govt Fee/.test(label),
  };
};

/** Trims the "Starting from" prefix for compact ledger display. */
export const priceParts = (label) => {
  if (!label) return { prefix: '', value: '' };
  if (label.startsWith('Starting from ')) {
    return { prefix: 'Starting from', value: label.replace('Starting from ', '') };
  }
  return { prefix: '', value: label };
};
