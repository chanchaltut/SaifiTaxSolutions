import { categories } from './services';
import { wa } from './site';

/**
 * Certificate previews on the home page. Each card shows a real certificate the
 * firm has delivered, with the client's personal details hidden.
 *
 * To add one, put its image in src/assets/certificates/ named after its id
 * (gst.jpg, udyam.png, itr.webp ...). Until a certificate has an image, its card
 * shows a topic photo and offers a real, redacted sample on WhatsApp instead.
 * `photo` names the topic photo in src/assets/cards/.
 *
 * `service` must match a service name in services.raw.json, so the fee shown
 * always follows the fee schedule.
 */

const IMAGES = import.meta.glob('../assets/certificates/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
});

const imageFor = (id) => {
  const key = Object.keys(IMAGES).find((k) => k.split('/').pop().replace(/\.[a-z]+$/, '') === id);
  return key ? IMAGES[key] : null;
};

export const certificatesIntro = {
  badge: 'Certificate Preview',
  titleA: 'Preview Your',
  titleB: 'Official Certificates',
  body: 'Every registration ends with an official document. See what each certificate is, who issues it and what it unlocks, and ask us for a real sample before you pay.',
  note: 'Real certificates delivered to our clients. Personal details are hidden to protect their privacy.',
  sampleNote: 'Ask on WhatsApp and we will share a real certificate we have delivered, with the client’s personal details hidden.',
  sampleLabel: 'Real sample on request',
  sampleCta: 'Ask for a Real Sample',
  delivered: 'PDF on WhatsApp & Email',
};

const raw = [
  {
    id: 'gst',
    photo: 'gst',
    name: 'GST Registration Certificate',
    form: 'Form GST REG-06',
    tone: 'sky',
    service: 'New GST Registration — Individual',
    issuer: 'Goods and Services Tax Network (GST portal)',
    validity: 'Valid until cancelled or surrendered',
    usedFor: [
      'Collect GST and claim input tax credit',
      'Sell across states and on e-commerce marketplaces',
      'Open a current account in the business name',
    ],
    cta: 'Apply for GST Registration',
  },
  {
    id: 'udyam',
    photo: 'shop',
    name: 'Udyam (MSME) Registration Certificate',
    form: 'Udyam Registration',
    tone: 'emerald',
    service: 'New Udyam Registration',
    issuer: 'Ministry of MSME (Udyam Registration portal)',
    validity: 'Permanent, no renewal needed',
    usedFor: [
      'Priority-sector and collateral-free bank loans',
      'Benefits in government tenders',
      'Protection against delayed payments from buyers',
    ],
    cta: 'Apply for Udyam Registration',
  },
  {
    id: 'itr',
    photo: 'itr',
    name: 'ITR Acknowledgement (ITR-V)',
    form: 'Assessment Year 2026-27',
    tone: 'indigo',
    service: 'ITR-1 — Salaried / Pension',
    issuer: 'Income Tax Department (e-Filing portal)',
    validity: 'Issued for every assessment year you file',
    usedFor: [
      'Income proof for home, car and business loans',
      'Visa applications and credit card limits',
      'Claim refunds and carry forward losses',
    ],
    cta: 'File My ITR',
  },
  {
    id: 'coi',
    photo: 'company',
    name: 'Certificate of Incorporation',
    form: 'Private Limited Company',
    tone: 'amber',
    service: 'Private Limited Company (Pvt Ltd) + GST',
    issuer: 'Registrar of Companies, Ministry of Corporate Affairs',
    validity: 'Permanent, with yearly ROC filings',
    usedFor: [
      'A separate legal identity with limited liability',
      'Raise funding and issue shares',
      'Open bank accounts and sign contracts as a company',
    ],
    cta: 'Register My Company',
  },
  {
    id: 'fssai',
    photo: 'food',
    name: 'FSSAI Food Registration',
    form: 'FSSAI Registration',
    tone: 'emerald',
    service: 'FSSAI Basic Registration (Petty Operator)',
    issuer: 'Food Safety and Standards Authority of India (FoSCoS)',
    validity: '1 to 5 years, renewable',
    usedFor: [
      'Legally run a restaurant, cloud kitchen or food shop',
      'List on food delivery and grocery apps',
      'Print the FSSAI number on your packaging',
    ],
    cta: 'Apply for FSSAI',
  },
  {
    id: 'tm',
    photo: 'brand',
    name: 'Trademark Registration Certificate',
    form: 'Trade Marks Act, 1999',
    tone: 'rose',
    service: 'Trademark Registration (1 Class)',
    issuer: 'Trade Marks Registry, Government of India',
    validity: '10 years, renewable',
    usedFor: [
      'Exclusive rights to your brand name and logo',
      'Use the ® symbol and act against copycats',
      'Brand registry on online marketplaces',
    ],
    cta: 'Protect My Brand',
  },
  {
    id: 'iec',
    photo: 'shipping',
    name: 'Import Export Code (IEC)',
    form: 'DGFT IEC Certificate',
    tone: 'sky',
    service: 'IEC Registration (Import Export Code)',
    issuer: 'Directorate General of Foreign Trade',
    validity: 'Lifetime, with an update every April to June',
    usedFor: [
      'Import and export goods or services',
      'Receive foreign payments and export benefits',
      'Sell abroad through global marketplace programmes',
    ],
    cta: 'Apply for IEC',
  },
  {
    id: 'deed',
    photo: 'handshake',
    name: 'Partnership Deed',
    form: 'Partnership Firm',
    tone: 'indigo',
    service: 'Partnership Firm — Partnership Deed',
    issuer: 'Drafted by Saifi Tax Solutions, executed on stamp paper',
    validity: 'For the life of the firm, amended when partners change',
    usedFor: [
      'Apply for the firm’s PAN, GST and bank account',
      'Records capital, profit share and partner duties',
      'Prevents disputes between partners',
    ],
    cta: 'Draft My Partnership Deed',
  },
];

const priceOf = (serviceName) => {
  for (const c of categories) {
    const item = c.items.find((i) => i.name === serviceName);
    if (item) return item.price;
  }
  return null;
};

export const certificates = raw.map((c) => ({
  ...c,
  image: imageFor(c.id),
  price: priceOf(c.service),
  href: wa(`Hi Saifi Tax, I saw the ${c.name} preview on your website. I want to apply. Please share the process, documents and fee.`),
  sampleHref: wa(`Hi Saifi Tax, before I apply, can you share a real sample of the ${c.name} you deliver (with personal details hidden)?`),
}));
