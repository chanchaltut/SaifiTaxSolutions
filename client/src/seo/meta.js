import { SITE } from '../content/site';
import { categories, parsePrice, SERVICE_META_LINE } from '../content/services';
import { guides, hub } from '../content/guides';
import {
  dueDates,
  faqs,
  faqText,
  feeSchedule,
  noticeDesk,
  process as processCopy,
  verticals,
} from '../content/home';
import { tools, toolsHub } from '../content/tools';
import { serviceFaqs } from './serviceFaqs';
import { local } from '../content/local';
import { certificates, certificatesIntro } from '../content/certificates';

const U = SITE.url;
const abs = (p) => `${U}${p}`;
const ORG_ID = `${U}/#organization`;
const SITE_ID = `${U}/#website`;

const DEFAULT_IMAGE = '/og/saifi-tax-solutions.png';

/* Share images that exist in public/og/. New services and articles fall back to a general one. */
// eslint-disable-next-line no-undef
const OG_FILES = new Set(typeof __OG_FILES__ === 'undefined' ? [] : __OG_FILES__);
const ogOr = (file, fallback = DEFAULT_IMAGE) => (OG_FILES.has(file) ? file : fallback);
const absUrl = (p) => (/^https?:\/\//.test(p) ? p : abs(p));
const DEFAULT_ALT =
  'Saifi Tax Solutions — ITR filing, GST compliance and company registration, 100% online across India from Dehradun.';

/* ------------------------------------------------------------------ */
/* Route table                                                         */
/* ------------------------------------------------------------------ */

export const ROUTES = [
  { path: '/', priority: 1.0, changefreq: 'weekly' },
  { path: '/services/', priority: 0.95, changefreq: 'monthly' },
  ...categories.map((c) => ({ path: c.path, priority: 0.9, changefreq: 'monthly' })),
  { path: '/tax-consultant-dehradun/', priority: 0.95, changefreq: 'monthly' },
  { path: '/fee-schedule/', priority: 0.85, changefreq: 'monthly' },
  { path: '/tools/', priority: 0.8, changefreq: 'monthly' },
  ...tools.map((t) => ({ path: t.path, priority: 0.8, changefreq: 'monthly' })),
  { path: '/compliance-calendar/', priority: 0.8, changefreq: 'monthly' },
  { path: '/notice-desk/', priority: 0.85, changefreq: 'monthly' },
  { path: '/knowledge-hub/', priority: 0.8, changefreq: 'weekly' },
  ...guides.map((g) => ({ path: g.path, priority: 0.8, changefreq: 'monthly' })),
  { path: '/faq/', priority: 0.7, changefreq: 'monthly' },
  { path: '/about/', priority: 0.6, changefreq: 'yearly' },
  { path: '/contact/', priority: 0.7, changefreq: 'yearly' },
];

/* ------------------------------------------------------------------ */
/* Structured data builders                                            */
/* ------------------------------------------------------------------ */

const offerFor = (item) => {
  const price = parsePrice(item.price);
  const base = { '@type': 'Offer', itemOffered: { '@type': 'Service', name: item.name } };
  if (!price) return { ...base, description: item.price };
  return {
    ...base,
    priceCurrency: 'INR',
    description: item.price,
    priceSpecification: {
      '@type': price.unit ? 'UnitPriceSpecification' : 'PriceSpecification',
      minPrice: price.amount,
      priceCurrency: 'INR',
      ...(price.unit ? { unitText: price.unit } : {}),
    },
  };
};

const catalogFor = (c) => ({
  '@type': 'OfferCatalog',
  name: c.name,
  url: abs(c.path),
  description: c.desc,
  itemListElement: c.items.map(offerFor),
});

const address = {
  '@type': 'PostalAddress',
  streetAddress: SITE.address.street,
  addressLocality: SITE.address.city,
  addressRegion: SITE.address.region,
  postalCode: SITE.address.postal,
  addressCountry: SITE.address.countryCode,
};

const allPrices = categories.flatMap((c) => c.items.map((i) => parsePrice(i.price))).filter(Boolean).map((p) => p.amount);
const priceRange = `₹${Math.min(...allPrices).toLocaleString('en-IN')} – ₹${Math.max(...allPrices).toLocaleString('en-IN')}`;

const orgCore = {
  '@type': ['AccountingService', 'ProfessionalService'],
  '@id': ORG_ID,
  name: SITE.name,
  alternateName: ['Saifi Tax', 'SaifiTaxSolutions'],
  description:
    'Expert Income Tax Return (ITR) Filing, GST Registration, GST Return Filing, MSME Registration, and Accounting Services in Dehradun and across India.',
  slogan: SITE.tagline,
  url: `${U}/`,
  telephone: SITE.phoneSchema,
  email: SITE.email,
  image: abs(DEFAULT_IMAGE),
  logo: { '@type': 'ImageObject', url: abs('/icons/icon-512.png'), width: 512, height: 512 },
  priceRange,
  currenciesAccepted: 'INR',
  address,
  geo: { '@type': 'GeoCoordinates', latitude: SITE.geo.lat, longitude: SITE.geo.lng },
  hasMap: SITE.mapUrl,
  ...(SITE.sameAs.length ? { sameAs: SITE.sameAs } : {}),
  ...(SITE.hours.length
    ? {
        openingHoursSpecification: SITE.hours.map((h) => ({
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: h.days,
          opens: h.opens,
          closes: h.closes,
        })),
      }
    : {}),
  areaServed: [
    { '@type': 'City', name: 'Dehradun' },
    /* Neighbouring towns and the district, so nearby searches resolve to this office. */
    ...['Mussoorie', 'Rishikesh', 'Haridwar', 'Roorkee', 'Vikasnagar', 'Doiwala'].map((name) => ({ '@type': 'City', name })),
    { '@type': 'AdministrativeArea', name: 'Dehradun district' },
    { '@type': 'State', name: 'Uttarakhand' },
    { '@type': 'Country', name: 'India' },
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: SITE.phoneSchema,
    email: SITE.email,
    contactType: 'customer support',
    areaServed: 'IN',
    availableLanguage: ['English', 'Hindi'],
  },
  knowsAbout: [
    'Income Tax Return filing',
    'GST registration and return filing',
    'TDS and TCS returns',
    'AIS and Form 26AS reconciliation',
    'Income tax and GST notice replies',
    'Company, LLP and partnership incorporation',
    'MCA and ROC compliance',
    'MSME and Udyam registration',
    'Trademark registration',
    'FSSAI food licensing',
    'Import Export Code registration',
    'PF and ESIC compliance',
    'Accounting and bookkeeping',
    'Presumptive taxation under Section 44AD and 44ADA',
  ],
};

const orgFull = {
  ...orgCore,
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Tax & Compliance Services',
    itemListElement: categories.map(catalogFor),
  },
};

const orgRef = { '@id': ORG_ID };

/* The studio that designed and built the site. */
const builder = {
  '@type': 'Organization',
  '@id': `${SITE.credit.url}/#organization`,
  name: SITE.credit.name,
  url: `${SITE.credit.url}/`,
};

const website = {
  '@type': 'WebSite',
  '@id': SITE_ID,
  url: `${U}/`,
  name: SITE.name,
  alternateName: ['Saifi Tax', 'saifitaxsolutions.site'],
  inLanguage: 'en-IN',
  publisher: orgRef,
  creator: builder,
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${U}/services/?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
};

const breadcrumb = (trail) => ({
  '@type': 'BreadcrumbList',
  itemListElement: trail.map(([name, path], i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name,
    item: abs(path),
  })),
});

const webPage = (type, path, name, description, extra = {}) => ({
  '@type': type,
  '@id': `${abs(path)}#webpage`,
  url: abs(path),
  name,
  description,
  isPartOf: { '@id': SITE_ID },
  about: orgRef,
  inLanguage: 'en-IN',
  dateModified: SITE.lastUpdated,
  primaryImageOfPage: { '@type': 'ImageObject', url: abs(DEFAULT_IMAGE) },
  speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '.answer__text', '.lede'] },
  ...extra,
});

const faqPage = (path, items) => ({
  '@type': 'FAQPage',
  '@id': `${abs(path)}#faq`,
  mainEntity: items.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: faqText(f) },
  })),
});

const howTo = (path, name, description, steps) => ({
  '@type': 'HowTo',
  '@id': `${abs(path)}#howto`,
  name,
  description,
  step: steps.map(([stepName, text], i) => ({
    '@type': 'HowToStep',
    position: i + 1,
    name: stepName,
    text,
  })),
});

const graph = (...nodes) => ({ '@context': 'https://schema.org', '@graph': nodes.filter(Boolean) });

const page = (path, { title, description, image, imageAlt, ogType = 'website', jsonLd, modified, noindex }) => ({
  path,
  title,
  description,
  canonical: abs(path),
  ogType,
  image: absUrl(image || DEFAULT_IMAGE),
  imageAlt: imageAlt || DEFAULT_ALT,
  modified,
  noindex,
  jsonLd,
});

/* ------------------------------------------------------------------ */
/* Page definitions                                                    */
/* ------------------------------------------------------------------ */

const PAGES = {};

/* What each registration delivers, so answer engines can say who issues it and how long it lasts. */
const certificateList = {
  '@type': 'ItemList',
  '@id': `${U}/#certificates`,
  name: `${certificatesIntro.titleA} ${certificatesIntro.titleB}`,
  description: certificatesIntro.body,
  numberOfItems: certificates.length,
  itemListElement: certificates.map((c, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    item: {
      '@type': 'Service',
      name: c.service,
      serviceOutput: c.name,
      description: `${c.name}, issued by ${c.issuer}. ${c.validity}. Used to ${c.usedFor.map((u) => u.charAt(0).toLowerCase() + u.slice(1)).join('; ')}.`,
      provider: orgRef,
      areaServed: { '@type': 'Country', name: 'India' },
      ...(c.price ? { offers: offerFor({ name: c.service, price: c.price }) } : {}),
    },
  })),
};

{
  const path = '/';
  const title = 'Saifi Tax Solutions | ITR, GST & Company Registration, Dehradun';
  const description =
    'Expert ITR filing, GST registration & returns, TDS, company and MSME registration from Dehradun, delivered 100% online across India. Fees from ₹299.';
  PAGES[path] = page(path, {
    title,
    description,
    jsonLd: graph(
      orgFull,
      website,
      webPage('WebPage', path, title, description),
      faqPage(path, faqs),
      certificateList,
      howTo(
        path,
        processCopy.title,
        processCopy.body,
        processCopy.steps.map((s) => [s.title, s.body]),
      ),
    ),
  });
}

{
  const path = '/services/';
  const title = 'All Tax & Compliance Services and Fees | Saifi Tax Solutions';
  const description = `${SERVICE_META_LINE}. GST, ITR, TDS, company registration, MCA, trademark, PF/ESIC, FSSAI, IEC, MSME and accounting with every fee listed.`;
  PAGES[path] = page(path, {
    title,
    description,
    jsonLd: graph(
      orgFull,
      website,
      webPage('CollectionPage', path, title, description, {
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: categories.length,
          itemListElement: categories.map((c, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: c.name,
            url: abs(c.path),
          })),
        },
      }),
      breadcrumb([['Home', '/'], ['Services', path]]),
    ),
  });
}

categories.forEach((c) => {
  const path = c.path;
  const title = `${c.seoTitle} | Saifi Tax`;
  const description = `${c.desc} ${c.from}. Delivered 100% online from Dehradun across India, with every fee listed.`;
  const vertical = verticals.find((v) => v.id === c.cat);
  PAGES[path] = page(path, {
    title,
    description,
    image: ogOr(`/og/services-${c.slug}.png`),
    imageAlt: `${c.name} at Saifi Tax Solutions, ${c.from.toLowerCase()}.`,
    jsonLd: graph(
      orgCore,
      website,
      webPage('WebPage', path, title, description, { mainEntity: { '@id': `${abs(path)}#service` } }),
      {
        '@type': 'Service',
        '@id': `${abs(path)}#service`,
        name: c.name,
        serviceType: c.keyword,
        description: vertical ? `${vertical.body} ${c.desc}` : c.desc,
        url: abs(path),
        provider: orgRef,
        areaServed: [
          { '@type': 'City', name: 'Dehradun' },
          { '@type': 'Country', name: 'India' },
        ],
        availableChannel: {
          '@type': 'ServiceChannel',
          serviceUrl: abs(path),
          servicePhone: SITE.phoneSchema,
          availableLanguage: ['English', 'Hindi'],
        },
        hasOfferCatalog: catalogFor(c),
      },
      faqPage(path, serviceFaqs(c)),
      breadcrumb([['Home', '/'], ['Services', '/services/'], [c.name, path]]),
    ),
  });
});

{
  const path = '/fee-schedule/';
  const title = 'Master Fee Schedule: ITR, GST, Company & Accounting Fees | Saifi Tax';
  const description =
    'Transparent service economics. ITR from ₹499, GST registration from ₹1,499, Pvt Ltd + GST at ₹11,999, LLP + GST at ₹10,999, bookkeeping at ₹7,999. Zero hidden retainers.';
  PAGES[path] = page(path, {
    title,
    description,
    image: '/og/fee-schedule.png',
    imageAlt: 'Saifi Tax Solutions Master Fee Schedule.',
    jsonLd: graph(
      orgCore,
      website,
      webPage('WebPage', path, title, description),
      {
        '@type': 'OfferCatalog',
        '@id': `${abs(path)}#catalog`,
        name: feeSchedule.title,
        itemListElement: feeSchedule.groups.map((g) => ({
          '@type': 'OfferCatalog',
          name: g.title,
          itemListElement: g.rows.map(([name, price]) => offerFor({ name, price })),
        })),
      },
      breadcrumb([['Home', '/'], [feeSchedule.title, path]]),
    ),
  });
}

{
  const path = '/tools/';
  const title = 'Free GST, EMI & Presumptive Tax Calculators | Saifi Tools Hub';
  const description =
    'Free tax tools from Saifi Tax Solutions: GST calculator, business loan EMI calculator, Section 44AD/44ADA presumptive income estimator and a 1-minute ITR form checker.';
  PAGES[path] = page(path, {
    title,
    description,
    image: '/og/tools.png',
    imageAlt: 'Saifi Tools Hub: free tax calculators.',
    jsonLd: graph(
      orgCore,
      website,
      webPage('CollectionPage', path, title, description, {
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: tools.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.title, url: abs(t.path) })),
        },
      }),
      breadcrumb([['Home', '/'], [toolsHub.label, path]]),
    ),
  });
}

tools.forEach((t) => {
  const path = t.path;
  const title = `${t.metaTitle} | Saifi Tax`;
  PAGES[path] = page(path, {
    title,
    description: t.metaDescription,
    image: `/og/tool-${t.id}.png`,
    imageAlt: `${t.title} by Saifi Tax Solutions.`,
    jsonLd: graph(
      orgCore,
      website,
      webPage('WebPage', path, title, t.metaDescription),
      {
        '@type': 'WebApplication',
        '@id': `${abs(path)}#app`,
        name: t.title,
        url: abs(path),
        description: t.metaDescription,
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
        provider: orgRef,
      },
      breadcrumb([['Home', '/'], [toolsHub.label, '/tools/'], [t.nav, path]]),
    ),
  });
});

{
  const path = '/compliance-calendar/';
  const title = 'Tax Due Dates: GST, TDS & Income Tax Compliance Calendar | Saifi Tax';
  const description =
    'Monthly statutory due dates for Indian businesses: TDS deposit on the 7th, GSTR-1 on the 11th, GSTR-3B on the 20th, plus quarterly advance tax on the 15th.';
  PAGES[path] = page(path, {
    title,
    description,
    image: '/og/compliance-calendar.png',
    imageAlt: 'Saifi Tax Solutions Statutory Compliance Calendar.',
    jsonLd: graph(
      orgCore,
      website,
      webPage('WebPage', path, title, description),
      {
        '@type': 'ItemList',
        '@id': `${abs(path)}#dates`,
        name: dueDates.eyebrow,
        itemListElement: dueDates.items.map((d, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: `${d.title} (${d.date})`,
          description: d.body,
        })),
      },
      breadcrumb([['Home', '/'], ['Due Dates', path]]),
    ),
  });
}

{
  const path = '/notice-desk/';
  const title = 'Income Tax & GST Notice Reply: 139(9), 143(1), DRC-01 | Saifi Tax';
  const description = `Received an Income Tax or GST Notice? Send a photo or PDF of your notice for a confidential expert assessment. Replies for 139(9), 143(1), AIS mismatch and GST SCN.`;
  PAGES[path] = page(path, {
    title,
    description,
    image: '/og/notice-desk.png',
    imageAlt: 'Received an Income Tax or GST Notice? Saifi Tax Solutions Notice Desk.',
    jsonLd: graph(
      orgCore,
      website,
      webPage('WebPage', path, title, description),
      {
        '@type': 'Service',
        '@id': `${abs(path)}#service`,
        name: 'Income Tax & GST Notice Representation',
        serviceType: 'Tax notice reply',
        description: noticeDesk.body,
        url: abs(path),
        provider: orgRef,
        areaServed: { '@type': 'Country', name: 'India' },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Notice types handled',
          itemListElement: noticeDesk.items.map((n) => ({
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: `${n.title} (${n.section})`, description: n.body },
          })),
        },
      },
      faqPage(path, faqs.filter((f) => ['notice', 'reconcile'].includes(f.id))),
      breadcrumb([['Home', '/'], ['Notice Desk', path]]),
    ),
  });
}

{
  const path = '/knowledge-hub/';
  const title = 'Income Tax Guides: ITR Forms, Documents, AIS & 26AS | Saifi Tax';
  const description = `${hub.body} Practical guides on ITR forms, document checklists and AIS vs Form 26AS vs Form 16.`;
  PAGES[path] = page(path, {
    title,
    description,
    image: '/og/knowledge-hub.png',
    imageAlt: 'Saifi Knowledge Hub: tax and compliance library.',
    jsonLd: graph(
      orgCore,
      website,
      webPage('CollectionPage', path, title, description, {
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: guides.map((g, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: g.headline,
            url: abs(g.path),
          })),
        },
      }),
      breadcrumb([['Home', '/'], [hub.label, path]]),
    ),
  });
}

guides.forEach((g) => {
  const path = g.path;
  const image = g.photo?.share || ogOr(`/og/guide-${g.slug}.png`, '/og/knowledge-hub.png');
  const modified = g.dateModified ? g.dateModified.slice(0, 10) : SITE.lastUpdated;
  PAGES[path] = page(path, {
    title: g.metaTitle,
    description: g.metaDescription,
    ogType: 'article',
    image,
    imageAlt: g.headline,
    modified,
    jsonLd: graph(
      orgCore,
      website,
      {
        '@type': 'Article',
        '@id': `${abs(path)}#article`,
        headline: g.headline,
        description: g.metaDescription,
        image: absUrl(image),
        url: abs(path),
        mainEntityOfPage: { '@id': `${abs(path)}#webpage` },
        inLanguage: 'en-IN',
        ...(g.datePublished && { datePublished: g.datePublished.slice(0, 10) }),
        dateModified: modified,
        timeRequired: `PT${g.minutes}M`,
        author: { '@type': 'Organization', '@id': ORG_ID, name: SITE.name, url: `${U}/` },
        publisher: orgRef,
        reviewedBy: { '@type': 'Organization', '@id': ORG_ID, name: 'Saifi Tax Compliance Team' },
        about: g.toc.map(([, name]) => ({ '@type': 'Thing', name })),
        ...(g.answer && { abstract: g.answer }),
        speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '.answer__text', '.gsec h2', '.gprose h2'] },
      },
      webPage('WebPage', path, g.metaTitle, g.metaDescription, {
        mainEntity: { '@id': `${abs(path)}#article` },
      }),
      g.faqs.length ? faqPage(path, g.faqs) : null,
      g.howTo
        ? howTo(path, g.howTo.name, 'Follow these steps when your AIS does not match your actual income.', g.howTo.steps)
        : null,
      breadcrumb([['Home', '/'], [hub.label, '/knowledge-hub/'], [g.headline, path]]),
    ),
  });
});

{
  const path = '/faq/';
  const title = 'Tax & Compliance FAQs: Online ITR, AIS, GST Timelines | Saifi Tax';
  const description =
    'Answers on online filing, AIS and Form 26AS reconciliation, ITR and GST turnaround time, data confidentiality and replying to tax notices.';
  const all = [...faqs, ...guides.flatMap((g) => g.faqs)];
  PAGES[path] = page(path, {
    title,
    description,
    jsonLd: graph(
      orgCore,
      website,
      webPage('WebPage', path, title, description),
      faqPage(path, all),
      breadcrumb([['Home', '/'], ['FAQ', path]]),
    ),
  });
}

{
  const path = '/about/';
  const title = 'About Saifi Tax Solutions: Tax & Compliance Firm in Dehradun';
  const description = `${SITE.blurb} ${SITE.address.full}.`;
  PAGES[path] = page(path, {
    title,
    description,
    jsonLd: graph(
      orgFull,
      website,
      webPage('AboutPage', path, title, description, { mainEntity: orgRef }),
      breadcrumb([['Home', '/'], ['About', path]]),
    ),
  });
}

{
  const path = '/contact/';
  const title = 'Contact Saifi Tax Solutions: WhatsApp, Phone & Dehradun Office';
  const description = `Talk to a tax expert on WhatsApp or call ${SITE.phoneDisplay}. Email ${SITE.email}. Office: ${SITE.address.full}.`;
  PAGES[path] = page(path, {
    title,
    description,
    jsonLd: graph(
      orgCore,
      website,
      webPage('ContactPage', path, title, description, { mainEntity: orgRef }),
      breadcrumb([['Home', '/'], ['Contact', path]]),
    ),
  });
}

{
  const path = local.path;
  PAGES[path] = page(path, {
    title: local.metaTitle,
    description: local.metaDescription,
    image: '/og/tax-consultant-dehradun.png',
    imageAlt: 'Saifi Tax Solutions, tax consultant at IT Park, Sahastradhara Road, Dehradun.',
    jsonLd: graph(
      orgFull,
      website,
      webPage('WebPage', path, local.metaTitle, local.metaDescription, {
        about: orgRef,
        mainEntity: orgRef,
        contentLocation: { '@type': 'City', name: 'Dehradun' },
      }),
      faqPage(path, local.faqs),
      breadcrumb([['Home', '/'], [local.crumb, path]]),
    ),
  });
}

const NOT_FOUND = page('/404/', {
  title: 'Page not found | Saifi Tax Solutions',
  description: 'This page has moved. Find every service, fee and guide from Saifi Tax Solutions.',
  noindex: true,
  jsonLd: graph(website),
});

export function getMeta(pathname) {
  const clean = pathname.endsWith('/') ? pathname : `${pathname}/`;
  return PAGES[clean] || NOT_FOUND;
}

/* ------------------------------------------------------------------ */
/* llms.txt: a plain summary for AI crawlers and answer engines        */
/* ------------------------------------------------------------------ */

export function buildLlms() {
  const lines = [
    `# ${SITE.name}`,
    '',
    `> ${SITE.blurb} GST, ITR & TDS filing, Company & MSME registrations and Comprehensive Tax Advisory, delivered 100% online with accuracy and transparency.`,
    '',
    '## Key facts',
    '',
    `- Business: ${SITE.name} (tax and compliance consultancy)`,
    `- Office: ${SITE.address.full}`,
    `- Phone and WhatsApp: ${SITE.phoneDisplay}`,
    `- Email: ${SITE.email}`,
    `- Service area: Dehradun, Uttarakhand and all of India, 100% online`,
    `- Scope: ${SERVICE_META_LINE}`,
    `- Pricing: all prices are "Starting from"; government and third-party fees are charged separately at actuals`,
    `- ITR turnaround: typically 4 to 24 hours of receiving complete documents`,
    `- New GST registration: filed within 24 hours; GSTIN allotment generally 3 to 5 working days`,
    '',
    '## Local',
    '',
    `- [Tax Consultant in Dehradun](${abs(local.path)}): ${local.metaDescription}`,
    '',
    '## Services and starting fees',
    '',
    ...categories.map((c) => `- [${c.name}](${abs(c.path)}): ${c.desc} ${c.from}.`),
    '',
    '## Certificates delivered',
    '',
    ...certificates.map((c) => `- ${c.name} (${c.form}): issued by ${c.issuer}. ${c.validity}.${c.price ? ` Fee ${c.price}.` : ''} Delivered as ${certificatesIntro.delivered}.`),
    '',
    '## Guides',
    '',
    ...guides.map((g) => `- [${g.headline}](${abs(g.path)}): ${g.metaDescription}`),
    '',
    '## Tools',
    '',
    ...tools.map((t) => `- [${t.title}](${abs(t.path)}): ${t.blurb}`),
    '',
    '## Reference pages',
    '',
    `- [Master Fee Schedule](${abs('/fee-schedule/')}): ${feeSchedule.body}`,
    `- [Statutory Compliance Calendar](${abs('/compliance-calendar/')}): Monthly GST, TDS and income tax due dates.`,
    `- [Notice Desk](${abs('/notice-desk/')}): ${noticeDesk.body}`,
    `- [FAQ](${abs('/faq/')}): Online filing, AIS reconciliation, timelines and confidentiality.`,
    `- [Contact](${abs('/contact/')}): WhatsApp, phone, email and office address.`,
    '',
    '## About this site',
    '',
    `- Designed and built by [${SITE.credit.name}](${SITE.credit.url}/), a web design and development studio.`,
    '',
    '## Optional',
    '',
    `- [Full site text](${abs('/llms-full.txt')}): Every page as plain Markdown.`,
    '',
  ];
  return lines.join('\n');
}
