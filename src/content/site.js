export const SITE = {
  name: 'Saifi Tax Solutions',
  short: 'Saifi Tax',
  url: 'https://saifitaxsolutions.site',
  phoneDisplay: '+91 9548932631',
  phoneE164: '+919548932631',
  phoneSchema: '+91-9548932631',
  email: 'taxmateassociates06@gmail.com',
  whatsapp: '919548932631',
  address: {
    short: 'IT Park, Dehradun',
    street: 'IT Park, Sahastradhara Road',
    city: 'Dehradun',
    region: 'Uttarakhand',
    regionCode: 'IN-UT',
    postal: '248001',
    country: 'India',
    countryCode: 'IN',
    full: 'IT Park, Sahastradhara Road, Dehradun, Uttarakhand, India - 248001',
  },
  mapUrl:
    'https://www.google.com/maps/search/?api=1&query=IT+Park%2C+Sahastradhara+Road%2C+Dehradun%2C+Uttarakhand+248001',
  blurb:
    'Statutory tax, GST, and corporate legal consulting designed for modern Indian enterprises. Built in Dehradun, serving across India.',
  tagline: 'Fast. Accurate. 100% Digital.',
  lastUpdated: '2026-10-30',
  lastUpdatedLabel: '30 October 2026',
  credit: { name: 'Code Hyphen', url: 'https://www.codehyphen.in' },
};

/** Builds a WhatsApp deep link with a prefilled message. */
export const wa = (text) =>
  text
    ? `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`
    : `https://wa.me/${SITE.whatsapp}`;

export const tel = `tel:${SITE.phoneE164}`;
export const mailto = `mailto:${SITE.email}`;
