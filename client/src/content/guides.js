import { list, single } from './data';
import { wa } from './site';

/**
 * Knowledge Hub articles, written in the admin panel: Blog → Articles & guides.
 *
 * The four original guides are "built-in": their body is a designed layout in
 * pages/guideBodies.jsx (tables, checklists, steps), while their title, summary,
 * questions and buttons are edited in the admin. If the client writes their own
 * text for a built-in guide, that text replaces the designed layout.
 */

const h = single('hub');

export const hub = {
  label: 'Knowledge Hub',
  eyebrow: h.eyebrow,
  title: h.title,
  body: h.body,
  searchPlaceholder: h.searchPlaceholder,
  filters: [{ id: 'all', label: h.allLabel || 'All Guides' }, ...(h.categories || []).map((c) => ({ id: c.key, label: c.label }))],
  empty: {
    title: h.emptyTitle,
    body: h.emptyBody,
    cta: h.emptyCta,
    message: (term) => `Hi Saifi Tax, I was searching your Knowledge Hub for '${term}' and need expert help.`,
  },
};

export const reviewedBy = {
  initials: h.reviewedInitials,
  title: h.reviewedTitle,
  badge: h.reviewedBadge,
  bodyA: h.reviewedBodyA,
  bodyStrong: h.reviewedStrong,
  bodyB: h.reviewedBodyB,
};

/* What the designed layouts of the built-in guides need besides their text. */
const BUILTIN = {
  'itr-basics': {
    legacy: '/itr-basics.html',
    toc: [
      ['who-should-file', 'Who Should File an ITR?'],
      ['documents-required', 'Crucial Documents Required'],
      ['common-mistakes', 'Common Mistakes to Avoid'],
    ],
  },
  'itr-forms': {
    legacy: '/itr-forms.html',
    toc: [['form-matrix', 'The Form Selection Matrix']],
  },
  'itr-documents': {
    legacy: '/itr-documents.html',
    toc: [
      ['base-kyc', 'The Non-Negotiables (Base KYC)'],
      ['profile-checklists', 'Profile-Specific Checklists'],
      ['other-income', "Other Income Sources (Don't Miss These!)"],
    ],
  },
  'itr-comparison': {
    legacy: '/itr-comparison.html',
    toc: [
      ['three-pillars', 'The 3 Tax Pillars Explained'],
      ['at-a-glance', 'The Difference at a Glance'],
      ['mismatch', 'What If There is a Mismatch?'],
      ['pre-filing', 'The Pre-Filing Review Checklist'],
      ['faq', 'Frequently Asked Questions'],
    ],
    howTo: {
      name: 'What if AIS does not match your actual income?',
      steps: [
        ['Identify the Source', 'Check where the information came from (which bank or broker) and what transaction has been reported.'],
        ['Check Your Records', 'Compare it with relevant documents like Bank statements, Interest certificates, and Broker statements.'],
        ['Understand the Difference', 'It could be a reporting difference, duplicate entry, or incorrect PAN mapping by the bank.'],
        ['Take Action', 'If incorrect, AIS provides a facility to submit feedback online. For complex errors, seek professional help.'],
      ],
    },
  },
};

const categoryLabel = (id) => hub.filters.find((f) => f.id === id)?.label || '';

/** Headline + "words to highlight" → the two halves the page draws. */
function splitTitle(title, highlight) {
  const hl = (highlight || '').trim();
  if (hl && title.endsWith(hl) && hl !== title) return [title.slice(0, -hl.length).trim(), hl];
  if (hl && title.includes(hl)) {
    const i = title.indexOf(hl);
    return [title.slice(0, i).trim(), title.slice(i).trim()];
  }
  return [title, ''];
}

const minutesOf = (a, words) => {
  const typed = /(\d+)/.exec(a.readTime || '');
  if (typed) return Number(typed[1]);
  return Math.max(1, Math.round((words || 0) / 200));
};

function toGuide(a) {
  const builtin = a.builtin && BUILTIN[a.builtin] ? BUILTIN[a.builtin] : null;
  /* A written body always wins; built-in guides without one use their designed layout. */
  const rich = a.body && a.body.html ? a.body : null;
  const [titleA, titleB] = splitTitle(a.title, a.highlight);
  const tag = a.tag || categoryLabel(a.category);
  const minutes = minutesOf(a, rich?.words);
  const cardTitle = a.cardTitle || a.title;
  return {
    slug: a.slug,
    builtin: builtin && !rich ? a.builtin : null,
    legacy: builtin?.legacy || null,
    path: `/knowledge-hub/${a.slug}/`,
    tag,
    filter: a.category,
    readTime: a.readTime || `${minutes} Min Read`,
    minutes,
    badge: a.badge || (tag || 'Guide').toUpperCase(),
    cover: a.coverText || '',
    photo: a.cover || null,
    titleA,
    titleB,
    cardTitle,
    cardBody: a.excerpt,
    cardCta: a.cardCta || 'Read Full Guide',
    relatedTag: a.relatedTag || tag,
    relatedTitle: a.relatedTitle || cardTitle,
    metaTitle: a.metaTitle || `${a.title} | Saifi Tax Solutions`,
    metaDescription: a.metaDescription || a.excerpt,
    headline: a.title,
    intro: a.intro || a.excerpt,
    answer: a.answer || '',
    floatMessage: a.floatMessage || `Hi Saifi Tax, I was reading your '${cardTitle}' article and need help.`,
    cta: {
      kicker: a.ctaKicker || 'Consult Saifi Tax Experts',
      title: a.ctaTitle || 'Need help with this?',
      body: a.ctaBody || 'Share your details with us on WhatsApp and our experts will guide you.',
      label: a.ctaLabel || 'Discuss on WhatsApp',
      href: wa(a.ctaMessage || `Hi Saifi Tax, I read your article '${cardTitle}' and need help.`),
    },
    ...(a.disclaimer && { disclaimer: a.disclaimer }),
    html: rich ? rich.html : null,
    toc: rich ? rich.toc.map((t) => [t.id, t.text]) : builtin?.toc || [],
    howTo: !rich && builtin?.howTo ? builtin.howTo : null,
    faqs: (a.faqs || []).map((f) => ({ q: f.q, a: f.a })),
    datePublished: a.date || null,
    dateModified: a.updatedAt || null,
  };
}

export const guides = list('articles').map(toGuide);

export const guideBySlug = (slug) => guides.find((g) => g.slug === slug);
