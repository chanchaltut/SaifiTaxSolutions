import { boldSegments, keyOf, list, monthList, single } from './data';
import { wa } from './site';

/*
 * Home page copy. Everything here is edited in the admin panel; this file
 * only puts it in the shape the components draw. The names in brackets are
 * the admin screens.
 */

const settings = single('settings');
const heroData = single('hero');
const deadlines = single('deadlines');
const sec = single('sections');

/* ------------------------------------------------------------------ */
/* Hero and global strips  [Top banner & numbers, Business details]    */
/* ------------------------------------------------------------------ */

export const hero = {
  eyebrow: heroData.eyebrow,
  titleA: heroData.titleA,
  titleB: heroData.titleB,
  body: heroData.body,
  primary: { label: heroData.primaryLabel, href: wa(heroData.primaryMessage) },
  secondary: { label: heroData.secondaryLabel, to: '/tools/' },
};

export const statutoryAlert = settings.alertOn === false ? '' : settings.alert || '';

export const talkToExpert = { label: settings.talkLabel, href: wa(settings.talkMessage) };

export const ticker = settings.ticker || [];

export const stats = (heroData.stats || []).map((s) => ({ value: s.value, label: s.label }));

/* ------------------------------------------------------------------ */
/* Compliance Radar and statutory calendar  [Deadlines & due dates]    */
/* ------------------------------------------------------------------ */

export const radar = {
  title: deadlines.radarTitle,
  sub: deadlines.radarSub,
  by: deadlines.radarBy,
  items: (deadlines.radar || []).map((r) => ({
    id: keyOf(r),
    kicker: r.kicker,
    title: r.title,
    when: r.when,
    status: r.status,
    day: r.day,
    months: monthList(r.months),
  })),
};

export const dueDates = {
  eyebrow: deadlines.dueEyebrow,
  titleA: deadlines.dueTitleA,
  titleB: deadlines.dueTitleB,
  fallbackMonth: deadlines.dueFallback || 'Monthly',
  body: deadlines.dueBody,
  items: (deadlines.due || []).map((d) => ({
    id: keyOf(d),
    tag: d.tag,
    date: d.date,
    title: d.title,
    body: d.body,
    cta: d.cta,
    href: wa(d.message),
  })),
};

/* ------------------------------------------------------------------ */
/* Practice verticals  [Governance cards, Section headings]            */
/* ------------------------------------------------------------------ */

export const verticalsIntro = {
  eyebrow: sec.verticalsEyebrow,
  title: sec.verticalsTitle,
  body: sec.verticalsBody,
};

export const verticals = list('verticals').map((v) => ({
  id: keyOf(v),
  code: v.code,
  to: v.link,
  title: v.title,
  body: v.body,
  detailTitle: v.detailTitle,
  documents: (v.documents || []).map((d) => [d.title, d.text]),
  benefits: (v.benefits || []).map((b) => [b.title, b.text]),
  cta: v.cta,
  href: wa(v.message),
}));

/* ------------------------------------------------------------------ */
/* Process  [How it works]                                             */
/* ------------------------------------------------------------------ */

const processData = single('process');
export const process = {
  eyebrow: processData.eyebrow,
  title: `${processData.titleA} ${processData.titleB}`,
  titleA: processData.titleA,
  titleB: processData.titleB,
  body: processData.body,
  steps: (processData.steps || []).map((s) => ({ n: s.n, title: s.title, body: s.body })),
};

/* ------------------------------------------------------------------ */
/* Compliance plans  [Compliance plans, Section headings]              */
/* ------------------------------------------------------------------ */

export const plansIntro = {
  eyebrow: sec.plansEyebrow,
  titleA: sec.plansTitleA,
  titleB: sec.plansTitleB,
  body: sec.plansBody,
};

export const plans = list('plans').map((p) => ({
  id: keyOf(p),
  kicker: p.kicker,
  title: p.title,
  body: p.body,
  list: p.list || [],
  cta: p.cta,
  ...(p.featured && { featured: p.featured }),
  href: wa(p.message),
  photo: p.photo || null,
}));

/* ------------------------------------------------------------------ */
/* Reviews  [Client reviews, Section headings]                         */
/* ------------------------------------------------------------------ */

export const reviewsIntro = {
  eyebrow: sec.reviewsEyebrow,
  titleA: sec.reviewsTitleA,
  titleB: sec.reviewsTitleB,
  body: sec.reviewsBody,
};

const initialsOf = (name) =>
  String(name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

export const reviews = list('reviews').map((r) => ({
  quote: r.quote,
  initials: r.initials || initialsOf(r.name),
  name: r.name,
  role: r.role,
}));

/* ------------------------------------------------------------------ */
/* Notice defence desk  [Notice desk]                                  */
/* ------------------------------------------------------------------ */

const nd = single('noticeDesk');
export const noticeDesk = {
  eyebrow: nd.eyebrow,
  titleA: nd.titleA,
  titleB: nd.titleB,
  body: nd.body,
  cta: nd.cta,
  href: wa(nd.message),
  items: (nd.items || []).map((n) => ({
    id: keyOf(n),
    section: n.section,
    title: n.title,
    body: n.body,
    cta: n.cta,
    href: wa(n.message),
  })),
};

/* ------------------------------------------------------------------ */
/* Business licences  [Registrations & licences]                       */
/* ------------------------------------------------------------------ */

const lic = single('licences');
export const licencesIntro = {
  eyebrow: lic.eyebrow,
  titleA: lic.titleA,
  titleB: lic.titleB,
  body: lic.body,
  cta: lic.cta,
};

export const licences = (lic.items || []).map((l) => ({
  id: keyOf(l),
  to: l.link,
  title: l.title,
  body: l.body,
  href: wa(l.message),
}));

/* ------------------------------------------------------------------ */
/* Master fee schedule  [Fee schedule page]                            */
/* ------------------------------------------------------------------ */

const fee = single('feeSchedule');
export const feeSchedule = {
  title: fee.title,
  heading: fee.heading,
  body: fee.body,
  cta: fee.cta,
  groups: (fee.groups || []).map((g) => ({ title: g.title, rows: (g.rows || []).map((r) => [r.label, r.price]) })),
};

/* ------------------------------------------------------------------ */
/* FAQs  [Questions & answers, Section headings]                       */
/* ------------------------------------------------------------------ */

export const faqIntro = {
  eyebrow: sec.faqEyebrow,
  titleA: sec.faqTitleA,
  titleB: sec.faqTitleB,
  body: sec.faqBody,
};

/**
 * `a` is the visible rich answer as [text, bold] segments.
 * The plain text form feeds structured data, so both always match.
 */
const faqItem = (f) => ({
  id: keyOf(f, f.q),
  q: f.q,
  /* Plain answers on the Dehradun page stay plain text, as they always were. */
  a: f.page === 'local' && !String(f.a).includes('**') ? f.a : boldSegments(f.a),
});

export const faqs = list('faqs').filter((f) => f.page !== 'local').map(faqItem);
export const localFaqs = list('faqs').filter((f) => f.page === 'local').map(faqItem);

export const faqText = (faq) =>
  typeof faq.a === 'string' ? faq.a : faq.a.map(([t]) => t).join('');

/** A built-in FAQ by its id, or the first one, so pages that quote one never break. */
export const faqById = (id) => faqs.find((f) => f.id === id) || faqs[0] || { id, q: '', a: [] };

/* ------------------------------------------------------------------ */
/* Closing call to action  [Section headings]                          */
/* ------------------------------------------------------------------ */

export const finalCta = {
  body: sec.finalBody,
  href: wa(sec.finalMessage),
  label: sec.finalLabel,
};
