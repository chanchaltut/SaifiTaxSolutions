import { contentUpdatedAt, single } from './data';

/* Business details are edited in the admin panel: Settings → Business details. */
const s = single('settings');

const digits = String(s.phone || '').replace(/\D/g, '');
const phoneE164 = `+${digits.length === 10 ? `91${digits}` : digits}`;
const local10 = phoneE164.slice(-10);
const full = `${s.street}, ${s.city}, ${s.region}, India - ${s.postal}`;
const mapQuery = encodeURIComponent(`${s.street}, ${s.city}, ${s.region} ${s.postal}`).replace(/%20/g, '+');

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const daysBetween = (from, to) => {
  const a = DAYS.indexOf(from);
  const b = DAYS.indexOf(to);
  if (a < 0 || b < 0) return [];
  return a <= b ? DAYS.slice(a, b + 1) : [...DAYS.slice(a), ...DAYS.slice(0, b + 1)];
};

const updated = contentUpdatedAt ? contentUpdatedAt.slice(0, 10) : '2026-10-30';
const updatedLabel = new Date(`${updated}T12:00:00Z`).toLocaleDateString('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Asia/Kolkata',
});

export const SITE = {
  name: s.name,
  short: s.short,
  url: 'https://saifitaxsolutions.site',
  phoneDisplay: s.phone,
  phoneE164,
  phoneSchema: `+91-${local10}`,
  email: s.email,
  whatsapp: s.whatsapp,
  address: {
    short: s.addressShort,
    street: s.street,
    city: s.city,
    region: s.region,
    regionCode: 'IN-UT',
    postal: s.postal,
    country: 'India',
    countryCode: 'IN',
    full,
  },
  geo: { lat: s.lat ?? 30.3647, lng: s.lng ?? 78.0874 },
  sameAs: [s.googleBusiness, s.facebook, s.instagram, s.linkedin, s.youtube].filter(Boolean),
  hours: (s.hours || []).map((h) => ({ days: daysBetween(h.from, h.to), opens: h.opens, closes: h.closes })),
  mapEmbed: `https://www.google.com/maps?q=${mapQuery}&output=embed`,
  mapUrl: `https://www.google.com/maps/search/?api=1&query=${mapQuery}`,
  blurb: s.blurb,
  tagline: s.tagline,
  lastUpdated: updated,
  lastUpdatedLabel: updatedLabel,
  welcome: s.welcomeOn !== false,
  credit: { name: 'Code Hyphen', url: 'https://www.codehyphen.in' },
};

/** Builds a WhatsApp deep link with a prefilled message. */
export const wa = (text) =>
  text
    ? `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`
    : `https://wa.me/${SITE.whatsapp}`;

export const tel = `tel:${SITE.phoneE164}`;
export const mailto = `mailto:${SITE.email}`;
