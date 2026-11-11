import { categories } from './services';
import { keyOf, list, single } from './data';
import { wa } from './site';

/**
 * Certificate previews on the home page, edited in the admin panel:
 * Services → Certificate previews. Each shows a real certificate the firm
 * has delivered (a photo, scan or PDF, with the client's details hidden).
 * Until one has a preview, its card shows a topic photo and offers a real,
 * redacted sample on WhatsApp instead.
 *
 * `service` names a service in the fee list, so the fee shown always
 * follows the fee schedule.
 */

/* The topic photo (src/assets/cards/) behind each built-in certificate without a preview. */
const TOPIC = { gst: 'gst', udyam: 'shop', itr: 'itr', coi: 'company', fssai: 'food', tm: 'brand', iec: 'shipping', deed: 'handshake' };

const sec = single('sections');

export const certificatesIntro = {
  badge: sec.certBadge,
  titleA: sec.certTitleA,
  titleB: sec.certTitleB,
  body: sec.certBody,
  note: sec.certNote,
  sampleNote: sec.certSampleNote,
  sampleLabel: sec.certSampleLabel,
  sampleCta: sec.certSampleCta,
  delivered: sec.certDelivered,
};

const priceOf = (serviceName) => {
  if (!serviceName) return null;
  for (const c of categories) {
    const item = c.items.find((i) => i.name === serviceName);
    if (item) return item.price;
  }
  return null;
};

/**
 * The picture shown for a certificate: an uploaded photo or the first page of
 * an uploaded PDF. Photos are { url: "…{w}…", w, h } so each screen loads the size it needs.
 */
function previewOf(c) {
  if (c.preview === 'image' && c.image) return { image: c.image, full: c.image.url.replace('{w}', '2000') };
  if (c.preview === 'pdf' && c.pdf) {
    return {
      image: c.pdf.thumb ? { url: c.pdf.thumb.url, w: c.pdf.thumb.w, h: c.pdf.thumb.h } : null,
      full: c.pdf.url,
      pdf: c.pdf,
    };
  }
  return { image: null, full: null };
}

export const certificates = list('certificates').map((c) => {
  const id = keyOf(c, c.name);
  const preview = previewOf(c);
  return {
    id,
    photo: TOPIC[id] || 'documents',
    name: c.name,
    form: c.form,
    tone: c.tone || 'sky',
    service: c.service,
    issuer: c.issuer,
    validity: c.validity,
    usedFor: c.usedFor || [],
    cta: c.cta,
    image: preview.image,
    full: preview.full,
    pdf: preview.pdf || null,
    /* A PDF without a first-page picture still counts as a real preview. */
    hasPreview: Boolean(preview.image || preview.pdf),
    price: priceOf(c.service),
    href: wa(`Hi Saifi Tax, I saw the ${c.name} preview on your website. I want to apply. Please share the process, documents and fee.`),
    sampleHref: wa(`Hi Saifi Tax, before I apply, can you share a real sample of the ${c.name} you deliver (with personal details hidden)?`),
  };
});
