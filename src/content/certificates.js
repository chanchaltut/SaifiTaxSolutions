import { categories } from './services';
import { wa } from './site';

/**
 * Certificate previews shown on the home page. Each one is an illustrative sample
 * drawn in HTML with placeholder details, watermarked SAMPLE and free of any
 * government emblem. `service` must match a service name in services.raw.json,
 * so the fee shown always follows the fee schedule.
 */

export const certificatesIntro = {
  badge: 'Certificate Preview',
  titleA: 'Preview Your',
  titleB: 'Official Certificates',
  body: 'Every registration ends with an official document. See how each certificate looks before you apply, so you know exactly what you will receive.',
  note: 'Illustrative samples with placeholder details. Your certificate is issued by the authority shown, in its official format.',
  delivered: 'PDF on WhatsApp & Email',
};

const raw = [
  {
    id: 'gst',
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
    paper: {
      variant: 'form',
      seal: 'GSTN',
      top: ['Government of India', 'Form GST REG-06', '[See rule 10(1)]'],
      title: 'Registration Certificate',
      reg: ['Registration Number', '05ABCDE1234F1Z5'],
      rows: [
        ['Legal Name', 'Your Business Name'],
        ['Trade Name, if any', 'Your Brand'],
        ['Constitution of Business', 'Proprietorship'],
        ['Principal Place of Business', 'Rajpur Road, Dehradun, Uttarakhand 248001'],
        ['Date of Liability', '01/04/2026'],
        ['Type of Registration', 'Regular'],
      ],
      foot: 'Digitally signed on the GST portal',
    },
  },
  {
    id: 'udyam',
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
    paper: {
      variant: 'form',
      seal: 'MSME',
      top: ['Government of India', 'Ministry of Micro, Small & Medium Enterprises'],
      title: 'Udyam Registration Certificate',
      reg: ['Udyam Registration Number', 'UDYAM-UK-05-0012345'],
      rows: [
        ['Type of Enterprise', 'Micro'],
        ['Major Activity', 'Services'],
        ['Name of Enterprise', 'Your Business Name'],
        ['Date of Incorporation', '12/03/2026'],
        ['Date of Udyam Registration', '15/03/2026'],
      ],
      foot: 'Verifiable online with the Udyam number',
    },
  },
  {
    id: 'itr',
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
    paper: {
      variant: 'ack',
      seal: 'ITD',
      top: ['Indian Income Tax Return Acknowledgement'],
      title: 'Assessment Year 2026-27',
      reg: ['e-Filing Acknowledgement Number', '1234567890XXXXX'],
      rows: [
        ['PAN', 'ABCDE1234F'],
        ['Name', 'Your Full Name'],
        ['Form Number', 'ITR-4 (Sugam)'],
        ['Total Income', '₹ 6,00,000'],
        ['Net Tax Payable', '₹ 0'],
        ['Refund', '₹ 12,500'],
      ],
      foot: 'Return verified electronically',
    },
  },
  {
    id: 'coi',
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
    paper: {
      variant: 'cert',
      seal: 'MCA',
      top: ['Government of India', 'Ministry of Corporate Affairs', 'Central Registration Centre'],
      title: 'Certificate of Incorporation',
      sub: '[Pursuant to sub-section (2) of section 7 of the Companies Act, 2013]',
      text: 'I hereby certify that YOUR COMPANY PRIVATE LIMITED is incorporated on this fifteenth day of March, two thousand twenty-six under the Companies Act, 2013 and that the company is limited by shares.',
      rows: [
        ['Corporate Identity Number', 'U74999UK2026PTC012345'],
        ['PAN', 'ABCCY1234D'],
        ['TAN', 'DEHY01234B'],
      ],
      foot: 'Registrar of Companies',
    },
  },
  {
    id: 'fssai',
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
    paper: {
      variant: 'form',
      seal: 'FSSAI',
      top: ['Food Safety and Standards Authority of India', 'Ministry of Health & Family Welfare'],
      title: 'Registration Certificate',
      reg: ['Registration Number', '22626050000XXX'],
      rows: [
        ['Food Business Operator', 'Your Business Name'],
        ['Address of Premises', 'Rajpur Road, Dehradun, Uttarakhand'],
        ['Kind of Business', 'Food Service / Retail'],
        ['Valid Upto', '14/03/2031'],
      ],
      foot: 'Display at a prominent place in the premises',
    },
  },
  {
    id: 'tm',
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
    paper: {
      variant: 'cert',
      seal: 'TMR',
      top: ['Government of India', 'Trade Marks Registry'],
      title: 'Certificate of Registration of Trade Mark',
      sub: 'Section 23(2), Rule 56(1)',
      text: 'Trade Mark No. 6123456 in Class 35 has been registered in the name of YOUR BUSINESS NAME, trading as YOUR BRAND, in respect of the services described in the registration.',
      rows: [
        ['Trade Mark', 'YOUR BRAND ®'],
        ['Date of Application', '15/03/2026'],
        ['Class', '35'],
      ],
      foot: 'Registrar of Trade Marks',
    },
  },
  {
    id: 'iec',
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
    paper: {
      variant: 'form',
      seal: 'DGFT',
      top: ['Government of India', 'Ministry of Commerce and Industry', 'Directorate General of Foreign Trade'],
      title: 'Importer-Exporter Code',
      reg: ['IEC Number', 'ABCDE1234F'],
      rows: [
        ['IEC Issue Date', '15/03/2026'],
        ['Firm Name', 'Your Business Name'],
        ['Nature of Concern', 'Proprietorship'],
        ['Address', 'Rajpur Road, Dehradun, Uttarakhand 248001'],
      ],
      foot: 'Generated on the DGFT portal',
    },
  },
  {
    id: 'deed',
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
    paper: {
      variant: 'deed',
      seal: 'DEED',
      top: ['Executed on Non-Judicial Stamp Paper'],
      title: 'Deed of Partnership',
      text: 'This Deed of Partnership is made at Dehradun on the fifteenth day of March, 2026 between PARTNER ONE (the First Party) and PARTNER TWO (the Second Party), who agree to carry on business in partnership on the terms below.',
      rows: [
        ['Name of Firm', 'M/s Your Firm Name'],
        ['Profit Sharing Ratio', '50 : 50'],
        ['Capital Contribution', 'As per Schedule A'],
      ],
      foot: 'Signed by both partners and two witnesses',
    },
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
  price: priceOf(c.service),
  href: wa(`Hi Saifi Tax, I saw the ${c.name} preview on your website. I want to apply. Please share the process, documents and fee.`),
}));
