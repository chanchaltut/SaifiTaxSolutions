import raw from './services.raw.json';

/**
 * Extra routing, labelling and search-intent metadata for the 12 service
 * categories. Names, descriptions and every fee come from services.raw.json.
 */
const META = {
  gst: {
    slug: 'gst',
    code: 'GST',
    tab: 'GST',
    seoTitle: 'GST Registration, Return Filing & Notice Reply',
    keyword: 'GST registration and return filing',
    related: { licence: null, guides: [], dueDates: ['gstr1', 'gstr3b'], notices: ['gst'] },
    plans: ['gst-msme', 'gst-returns'],
  },
  itr: {
    slug: 'income-tax-return',
    code: 'ITR',
    tab: 'ITR',
    seoTitle: 'ITR Filing Online: Salaried, Business & NRI Returns',
    keyword: 'income tax return filing',
    related: {
      licence: null,
      guides: ['itr-basics', 'itr-forms', 'itr-documents', 'itr-comparison'],
      dueDates: ['itr'],
      notices: ['s139', 's143', 'ais'],
    },
    plans: ['salaried', 'business'],
  },
  tds: {
    slug: 'tds',
    code: 'TDS',
    tab: 'TDS',
    seoTitle: 'TDS & TCS Return Filing, Form 16 and TAN Registration',
    keyword: 'TDS return filing',
    related: { licence: null, guides: ['itr-comparison'], dueDates: ['tds'], notices: [] },
    plans: [],
  },
  legal: {
    slug: 'legal',
    code: 'LGL',
    tab: 'Legal',
    seoTitle: 'Tax Litigation, GST Appeals & Demand Notice Reply Services',
    keyword: 'tax appeal and demand notice reply',
    related: { licence: null, guides: [], dueDates: [], notices: ['s139', 's143', 'ais', 'gst'] },
    plans: [],
  },
  pf: {
    slug: 'pf-esic',
    code: 'PF',
    tab: 'PF / ESIC',
    seoTitle: 'PF & ESIC Registration, Monthly Challans and Returns',
    keyword: 'PF and ESIC compliance',
    related: { licence: null, guides: [], dueDates: [], notices: [] },
    plans: [],
  },
  tm: {
    slug: 'trademark',
    code: 'TM',
    tab: 'Trade Mark',
    seoTitle: 'Trademark Registration, Objection Reply & Copyright',
    keyword: 'trademark registration',
    related: { licence: 'trademark', guides: [], dueDates: [], notices: [] },
    plans: [],
  },
  inc: {
    slug: 'incorporation',
    code: 'INC',
    tab: 'Incorporation',
    seoTitle: 'Company, LLP, OPC & Partnership Registration Online',
    keyword: 'company and LLP registration',
    related: { licence: 'company', guides: [], dueDates: [], notices: [] },
    plans: [],
  },
  mca: {
    slug: 'mca-roc',
    code: 'MCA',
    tab: 'MCA',
    seoTitle: 'MCA / ROC Compliance: AOC-4, MGT-7, LLP Form 8 & 11',
    keyword: 'MCA and ROC annual filing',
    related: { licence: 'company', guides: [], dueDates: [], notices: [] },
    plans: [],
  },
  ie: {
    slug: 'import-export',
    code: 'IEC',
    tab: 'Import / Export',
    seoTitle: 'IEC Registration, RCMC & Export Benefit Claims',
    keyword: 'IEC registration',
    related: { licence: 'iec', guides: [], dueDates: [], notices: [] },
    plans: [],
  },
  acc: {
    slug: 'accounting',
    code: 'ACC',
    tab: 'Accounting',
    seoTitle: 'Accounting, Bookkeeping, Payroll & Project Report Services',
    keyword: 'accounting and bookkeeping',
    related: { licence: 'reports', guides: [], dueDates: [], notices: [] },
    plans: [],
  },
  msme: {
    slug: 'msme-udyam',
    code: 'MSME',
    tab: 'MSME',
    seoTitle: 'MSME / Udyam Registration, GeM, NSIC & Mudra Loan Support',
    keyword: 'MSME and Udyam registration',
    related: { licence: null, guides: [], dueDates: [], notices: [] },
    plans: ['gst-msme'],
  },
  fssai: {
    slug: 'fssai',
    code: 'FSSAI',
    tab: 'FSSAI',
    seoTitle: 'FSSAI Food Licence: Basic, State & Central Registration',
    keyword: 'FSSAI food licence',
    related: { licence: 'fssai', guides: [], dueDates: [], notices: [] },
    plans: [],
  },
};

export const SERVICE_NOTE =
  '* All prices are “Starting from”. Government fees and other third-party charges, where applicable, are charged separately at actuals.';
export const SERVICE_META_LINE = '12 categories · 120+ services · 100% online across India';

export const categories = raw.map((c) => ({
  ...c,
  ...META[c.cat],
  path: `/services/${META[c.cat].slug}/`,
  price: c.from.replace('Starting from ', ''),
}));

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
