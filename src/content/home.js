import { wa } from './site';

/* ------------------------------------------------------------------ */
/* Hero and global strips                                              */
/* ------------------------------------------------------------------ */

export const hero = {
  eyebrow: 'Your Trusted Financial Partner — Dehradun',
  titleA: 'Expert Tax & Compliance',
  titleB: 'Services Across India',
  body: 'GST, ITR & TDS filing, Company & MSME registrations, Comprehensive Tax Advisory — delivered 100% online with accuracy and transparency.',
  primary: {
    label: 'Chat With Us on WhatsApp',
    href: wa('Hi Saifi Tax Solutions, I would like to know about your services.'),
  },
  secondary: { label: 'Saifi Tools', to: '/tools/' },
};

export const statutoryAlert = 'Statutory Window Open: Monthly GSTR-1 & 3B Processing Active';

export const talkToExpert = {
  label: 'Talk to Expert',
  href: wa('Hi Saifi Tax Solutions, I would like to consult regarding my business taxation.'),
};

export const ticker = [
  'GST Registration',
  'ITR Filing',
  'Company Registration',
  'TDS Returns',
  'Bookkeeping',
  'ROC Compliance',
  'MSME Registration',
  'Tax Notices',
  'IEC Registration',
  'Digital Signature',
  'Trademark Registration',
  'FSSAI License',
  'Startup India',
  'Project Reports',
  'Tax Audit',
  'GST Annual Return',
  'Income Tax Planning',
  'CMA Data',
  'DPIIT Recognition',
  'PF & ESIC',
];

export const stats = [
  { value: '500+', label: 'ITR & GST Filings' },
  { value: '99.8%', label: 'Notice-Free Accuracy' },
  { value: '15 Mins', label: 'Avg. WhatsApp Response' },
  { value: '100%', label: 'Paperless & Confidential' },
];

/* ------------------------------------------------------------------ */
/* Compliance Radar and statutory calendar                             */
/* ------------------------------------------------------------------ */

export const radar = {
  title: 'Compliance Radar',
  sub: 'Key statutory deadlines for Indian businesses',
  by: 'Auto-monitored by Saifi Tax Solutions',
  items: [
    {
      id: 'tds',
      kicker: 'Withholding',
      title: 'TDS Payment Deposit',
      when: '7th of succeeding month',
      status: 'Chalan 281 Verification',
      day: 7,
    },
    {
      id: 'gstr1',
      kicker: 'GST Return',
      title: 'GSTR-1 Monthly',
      when: '11th of every month',
      status: 'Standard Filing Period',
      day: 11,
    },
    {
      id: 'advance',
      kicker: 'Income Tax',
      title: 'Advance Tax Instalment',
      when: 'Quarterly cycles (15th)',
      status: 'Penal Interest Protection',
      day: 15,
      months: [2, 5, 8, 11],
    },
    {
      id: 'gstr3b',
      kicker: 'Tax & ITC',
      title: 'GSTR-3B Summary',
      when: '20th of every month',
      status: 'Reconciliation Recommended',
      day: 20,
    },
  ],
};

export const dueDates = {
  eyebrow: 'Statutory Compliance Calendar',
  titleA: 'Upcoming',
  titleB: 'Tax Due Dates',
  fallbackMonth: 'Monthly',
  body: 'Avoid ₹50/day GST late fees, 1.5% monthly interest, and Section 234F penalties by filing before the statutory cut-off.',
  items: [
    {
      id: 'tds',
      tag: 'Every Month',
      date: '7th',
      title: 'Monthly TDS / TCS Deposit',
      body: 'Challan ITNS-281 payment for tax deducted in the previous month.',
      cta: 'Book TDS Filing →',
      href: wa('Hi Saifi Tax, I need help with TDS Deposit / Quarterly TDS Return.'),
    },
    {
      id: 'gstr1',
      tag: 'GSTR-1',
      date: '11th',
      title: 'GSTR-1 Outward Supplies',
      body: 'Monthly B2B & B2C sales invoice reporting so your buyers get timely ITC.',
      cta: 'File GSTR-1 Now →',
      href: wa('Hi Saifi Tax, I want to file my GSTR-1 before the 11th due date.'),
    },
    {
      id: 'gstr3b',
      tag: 'GSTR-3B',
      date: '20th',
      title: 'GSTR-3B & ITC Match',
      body: 'Monthly summary return & tax payment after GSTR-2B input credit reconciliation.',
      cta: 'File GSTR-3B Now →',
      href: wa('Hi Saifi Tax, I want to file my GSTR-3B before the 20th due date.'),
    },
    {
      id: 'itr',
      tag: 'Income Tax',
      date: 'ITR / Belated',
      title: 'Annual ITR & Revised Filing',
      body: 'File original, belated (u/s 139(4)), or updated ITR-U returns to keep loan files clean.',
      cta: 'File ITR Today →',
      href: wa('Hi Saifi Tax, I want to file my Pending / Current Income Tax Return.'),
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Practice verticals (with the former modal detail pages)             */
/* ------------------------------------------------------------------ */

export const verticalsIntro = {
  eyebrow: 'Practice Verticals',
  title: 'Full-Lifecycle Business Governance',
  body: 'From corporate inception to ongoing filings, every requirement handled under one roof. Click a service to view details.',
};

export const verticals = [
  {
    id: 'itr',
    code: 'ITR',
    to: '/services/income-tax-return/',
    title: 'Income Tax Advisory (ITR)',
    body: 'Tailored tax returns for salaried individuals, consultants, HUFs, and corporate entities. Full deductions review under old and new tax regimes.',
    detailTitle: 'Income Tax Advisory',
    documents: [
      ['Identity Proofs', 'PAN Card & Aadhaar Card.'],
      ['Income Proof', 'Form 16/16A (if salaried) or Business invoices.'],
      ['Bank Details', 'Bank Statements for the full financial year.'],
      ['Investment Proofs', 'LIC, PPF, Mutual Funds, or AIS/TIS details.'],
    ],
    benefits: [
      ['Maximum Deductions', 'Expert review under Old vs New regime to minimize tax liability.'],
      ['Avoid Penalties', 'Error-free computation prevents costly IT department notices.'],
      ['Loan Approvals', 'A properly audited ITR accelerates business and home loan approvals.'],
    ],
    cta: 'Proceed with ITR Filing',
    href: wa('Hi Saifi Tax, I have the documents ready and want to start my ITR filing.'),
  },
  {
    id: 'gst',
    code: 'GST',
    to: '/services/gst/',
    title: 'GST Compliance & Filing',
    body: 'Complete end-to-end GST management. Registrations, periodic return preparations (GSTR-1, 3B, 9), and input tax credit (ITC) reconciliation.',
    detailTitle: 'GST Compliance & Filing',
    documents: [
      ['Identity', "Applicant's PAN Card & Aadhaar Card."],
      ['Address Proof', 'Latest Electricity Bill or Property Tax Receipt.'],
      ['Premises', 'Rent Agreement & NOC from owner (if rented).'],
      ['Banking', 'Cancelled Cheque or Bank Statement showing name.'],
    ],
    benefits: [
      ['ITC Reconciliation', 'We accurately match GSTR 2B vs Purchase records to claim maximum Input Tax Credit.'],
      ['Legal Expansion', 'Allows you to legally sell across different states in India and on e-commerce platforms.'],
      ['E-Way Bill Support', 'Complete guidance on generating e-way bills and e-invoicing for seamless logistics.'],
    ],
    cta: 'Proceed with GST Services',
    href: wa('Hi Saifi Tax, I have the documents ready and need assistance with GST.'),
  },
  {
    id: 'inc',
    code: 'MCA',
    to: '/services/incorporation/',
    title: 'MCA & Corporate Law',
    body: 'Turnkey legal structuring for companies and firms across India. Fast-track SPICe+ MCA filing with dedicated DIN and digital signatures.',
    detailTitle: 'MCA & Corporate Law',
    documents: [
      ['Director ID', 'PAN & Aadhaar of all proposed Directors.'],
      ['Address Proofs', 'Recent Bank Statement / Mobile Bill of Directors.'],
      ['Registered Office', "Electricity bill of office premises & Owner's NOC."],
      ['Photographs', 'Passport size photos for DSC (Digital Signature) creation.'],
    ],
    benefits: [
      ['Limited Liability', 'Protects your personal assets from business risks and debts.'],
      ['Funding Access', 'A registered Pvt Ltd or LLP structure is mandatory for raising Angel or VC funding.'],
      ['Brand Trust', 'Being registered with the MCA dramatically increases credibility among clients and vendors.'],
    ],
    cta: 'Proceed with Incorporation',
    href: wa('Hi Saifi Tax, I have the documents ready and want to Incorporate my Company.'),
  },
];

/* ------------------------------------------------------------------ */
/* Process                                                             */
/* ------------------------------------------------------------------ */

export const process = {
  eyebrow: 'Zero Office Visits Required',
  title: 'How Online Filing Works in 4 Simple Steps',
  titleA: 'How Online Filing Works in',
  titleB: '4 Simple Steps',
  body: 'Get your tax returns, GST, or business registrations completed from your phone while our compliance team handles the heavy lifting.',
  steps: [
    {
      n: 'STEP 01',
      title: 'Share Docs on WhatsApp',
      body: 'Send your Form 16, PAN, or business details securely on our official WhatsApp desk.',
    },
    {
      n: 'STEP 02',
      title: '26AS & AIS Audit',
      body: 'Our experts cross-verify every entry with government portals and calculate maximum tax savings.',
    },
    {
      n: 'STEP 03',
      title: 'Draft Review & Approval',
      body: 'We share the clear tax computation sheet with you on WhatsApp for your confirmation before filing.',
    },
    {
      n: 'STEP 04',
      title: 'Instant Govt. Receipt',
      body: 'Receive your official ITR-V Acknowledgement or GST Certificate directly on WhatsApp & Email.',
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Compliance plans                                                    */
/* ------------------------------------------------------------------ */

export const plansIntro = {
  eyebrow: 'End-to-End Tax & GST Solutions',
  titleA: 'Choose Your',
  titleB: 'Compliance Plan',
  body: '100% paperless process. Share your documents on WhatsApp and let our experts handle your filings with zero notice risk.',
};

export const plans = [
  {
    id: 'salaried',
    kicker: 'For Individuals',
    title: 'Salaried & Investor ITR',
    body: 'Complete return preparation for employees with Form 16, bank interest, mutual funds, or stock market gains.',
    list: [
      'Form 16, 26AS & AIS Reconciliation',
      'Old vs New Regime Tax Saving Check',
      'Capital Gains & Dividend Reporting',
      'Maximum Legitimate Refund Claim',
    ],
    cta: 'File Salaried ITR',
    href: wa('Hi Saifi Tax, I want to file my Salaried / Capital Gains ITR. Please share the process and fee.'),
  },
  {
    id: 'business',
    kicker: 'Sec 44AD / 44ADA',
    title: 'Business & Freelancer ITR',
    body: 'Tailored for shop owners, traders, doctors, consultants, and freelancers seeking smart tax optimization.',
    list: [
      'ITR-3 / ITR-4 (Sugam) Filing',
      '50% Presumptive Tax Benefit (44ADA)',
      'P&L and Balance Sheet Computation',
      'Loan & Visa Ready ITR-V Copy',
    ],
    cta: 'Book Business ITR',
    featured: 'Most Popular',
    href: wa('Hi Saifi Tax, I need help with Business / Freelancer ITR (ITR-3 or ITR-4). Please guide me.'),
  },
  {
    id: 'gst-msme',
    kicker: 'New Business Setup',
    title: 'GST & MSME Registration',
    body: 'Get your official GSTIN and Udyam certificate quickly without visiting any government office.',
    list: [
      'New GST Application in 3–5 Days',
      'Accurate HSN / SAC Code Mapping',
      'Rent Agreement / NOC Format Help',
      'MSME / Udyam Certificate Included',
    ],
    cta: 'Apply for New GST',
    href: wa('Hi Saifi Tax, I want to apply for New GST and MSME Registration. Please share details.'),
  },
  {
    id: 'gst-returns',
    kicker: 'Monthly Retainer',
    title: 'GST Returns & Notice Care',
    body: 'Dedicated monthly compliance partner for your business to prevent late fees and GST notices.',
    list: [
      'Monthly / Quarterly GSTR-1 & 3B',
      'GSTR-2B Input Tax Credit (ITC) Match',
      'Income Tax / GST Notice Drafting',
      'Dedicated WhatsApp Priority Support',
    ],
    cta: 'Get Monthly Support',
    href: wa('Hi Saifi Tax, I need Monthly GST Return Filing / Tax Notice assistance.'),
  },
];

/* ------------------------------------------------------------------ */
/* Reviews                                                             */
/* ------------------------------------------------------------------ */

export const reviewsIntro = {
  eyebrow: '5.0 ★ Rated Tax Consultancy',
  titleA: 'Trusted by',
  titleB: 'Businesses & Taxpayers',
  body: 'From salaried professionals to growing startups in Dehradun and across India, here is what our clients say about our compliance support.',
};

export const reviews = [
  {
    quote:
      'My AIS and Form 26AS had a huge mismatch because of stock market and FD interest entries. Saifi Tax Solutions reconciled everything smoothly and filed my ITR without a single notice.',
    initials: 'RS',
    name: 'Rohit Sharma',
    role: 'IT Professional • Salaried & Stocks ITR',
  },
  {
    quote:
      "Got my new GST Registration and Udyam certificate in Dehradun completely online on WhatsApp. Didn't have to visit any office, and their monthly GSTR-1 & 3B filing reminder system is super reliable.",
    initials: 'AK',
    name: 'Amanpreet Kohli',
    role: 'Retail Business Owner • Dehradun',
  },
  {
    quote:
      'As a freelancer, I was confused between ITR-3 and ITR-4 presumptive taxation. Their expert guided me properly, saved a lot of legitimate tax under Section 44ADA, and handled everything within 24 hours.',
    initials: 'NV',
    name: 'Neha Verma',
    role: 'Independent Consultant • ITR-4 Filing',
  },
];

/* ------------------------------------------------------------------ */
/* Notice defence desk                                                 */
/* ------------------------------------------------------------------ */

export const noticeDesk = {
  eyebrow: 'Priority Legal & Tax Notice Representation',
  titleA: 'Received an Income Tax or',
  titleB: 'GST Notice?',
  body: 'Do not ignore portal intimations or reply without reconciliation. Send a photo or PDF of your notice for a confidential expert assessment.',
  cta: 'Send Notice Photo on WhatsApp',
  href: wa('Hi Saifi Tax, I have received an Income Tax / GST Notice and need urgent expert review.'),
  items: [
    {
      id: 's139',
      section: 'Section 139(9)',
      title: 'Defective Return Notice',
      body: "Triggered when wrong ITR form is filed or TDS claimed doesn't match 26AS/AIS turnover.",
      cta: 'Resolve 139(9)',
      href: wa('Hi Saifi Tax, I received a Section 139(9) Defective Return Notice. Please help resolve it.'),
    },
    {
      id: 's143',
      section: 'Section 143(1) / 133(6)',
      title: 'Intimation & Demand',
      body: 'Tax calculation mismatch, high-value transaction query, or disallowed deductions rectification.',
      cta: 'File Rectification',
      href: wa('Hi Saifi Tax, I received a 143(1) Intimation / Demand Notice. Please help.'),
    },
    {
      id: 'ais',
      section: 'AIS / 26AS Portal',
      title: 'AIS Mismatch Feedback',
      body: 'Unreported stocks, mutual funds, property sales, or bank interest reflecting on compliance portal.',
      cta: 'Fix AIS Mismatch',
      href: wa('Hi Saifi Tax, my AIS has a mismatch and I need help submitting portal feedback.'),
    },
    {
      id: 'gst',
      section: 'GST REG-17 / DRC-01',
      title: 'GST Suspension / SCN',
      body: 'Reply to GST Show Cause Notice, revoke suspended GSTIN, or reconcile GSTR-2B vs 3B ITC differences.',
      cta: 'Draft GST Reply',
      href: wa('Hi Saifi Tax, I need urgent help with a GST Show Cause Notice / Suspended GSTIN.'),
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Business licences                                                   */
/* ------------------------------------------------------------------ */

export const licencesIntro = {
  eyebrow: 'Complete Business Desk',
  titleA: 'Registrations, Licenses &',
  titleB: 'Startup Registrations',
  body: 'Beyond ITR and GST, we provide complete legal and statutory registrations for shops, startups, exporters, and enterprises across India.',
  cta: 'Apply on WhatsApp →',
};

export const licences = [
  {
    id: 'fssai',
    to: '/services/fssai/',
    title: 'FSSAI Food License',
    body: 'Basic, State & Central FSSAI registration for restaurants, cloud kitchens, cafes, and food traders.',
    href: wa('Hi Saifi Tax, I need FSSAI Food License Registration.'),
  },
  {
    id: 'trademark',
    to: '/services/trademark/',
    title: 'Trademark & Brand Protection',
    body: 'Trademark search, TM application filing (24 hours), and objection reply to protect your brand name & logo.',
    href: wa('Hi Saifi Tax, I need Trademark Registration for my brand.'),
  },
  {
    id: 'iec',
    to: '/services/import-export/',
    title: 'Import Export Code (DGFT IEC)',
    body: 'Lifetime IEC certificate & annual DGFT update for global exporters, importers, and Amazon global sellers.',
    href: wa('Hi Saifi Tax, I need Import Export Code (IEC) Registration.'),
  },
  {
    id: 'dsc',
    to: '/services/incorporation/',
    title: 'Class-3 DSC, PAN & TAN',
    body: 'Instant paperless Digital Signature Certificates (DSC) for e-Tenders, MCA, Income Tax, GST & firm PAN/TAN.',
    href: wa('Hi Saifi Tax, I need Class-3 Digital Signature (DSC) / PAN / TAN.'),
  },
  {
    id: 'reports',
    to: '/services/accounting/',
    title: 'Project Reports & Loan Financials',
    body: 'Projected Balance Sheet, P&L, and CMA Data preparation for Mudra Loan, CC Limit, and Business Loans.',
    href: wa('Hi Saifi Tax, I need Balance Sheet / CMA Project Report for Bank Loan.'),
  },
  {
    id: 'company',
    to: '/services/incorporation/',
    title: 'Company, LLP & Partnership Setup',
    body: 'End-to-end incorporation for Proprietorships, Partnership Deeds, LLPs, Private Limited & ROC filings.',
    href: wa('Hi Saifi Tax, I want to register a Partnership Firm / LLP / Pvt Ltd Company.'),
  },
];

/* ------------------------------------------------------------------ */
/* Master fee schedule                                                 */
/* ------------------------------------------------------------------ */

export const feeSchedule = {
  title: 'Master Fee Schedule',
  heading: 'Transparent Service Economics',
  body: 'Zero hidden retainers. Premium services at standard national pricing.',
  cta: 'Contact to Start',
  groups: [
    {
      title: 'Taxation & GST',
      rows: [
        ['ITR Salary', '₹499'],
        ['ITR Business', '₹999'],
        ['ITR Sal. + Cap Gain', '₹1,499'],
        ['ITR Audited', '₹4,999'],
        ['GST Reg (Individual)', '₹1,499'],
        ['GST Reg (Partnership)', '₹1,999'],
        ['GST Returns', 'From ₹499'],
      ],
    },
    {
      title: 'Company Setup & Licences',
      rows: [
        ['Pvt Ltd + GST', '₹11,999'],
        ['LLP + GST', '₹10,999'],
        ['Partnership Deed', '₹2,499'],
        ['Trademark', '₹9,440'],
        ['DSC (Signature)', '₹2,360'],
        ['PAN / TAN', '₹399'],
      ],
    },
    {
      title: 'Accounting & Reports',
      rows: [
        ['Balance Sheet', '₹999'],
        ['Project Report 3–5 Yrs', '₹4,999'],
        ['Project Report 7 Yrs', '₹6,999'],
        ['Full Bookkeeping', '₹7,999'],
        ['Online Accounting', 'From ₹1,499'],
      ],
    },
  ],
};

/* ------------------------------------------------------------------ */
/* FAQs                                                                */
/* ------------------------------------------------------------------ */

export const faqIntro = {
  eyebrow: 'Got Questions?',
  titleA: 'Frequently Asked',
  titleB: 'Compliance Questions',
  body: 'Everything you need to know about our online tax filing, security, and turnaround time.',
};

/**
 * `a` is the visible rich answer as [text, bold] segments.
 * The plain text form feeds structured data, so both always match.
 */
export const faqs = [
  {
    id: 'online',
    q: 'Do I need to visit your office in Dehradun, or is the process 100% online?',
    a: [
      ['Our entire workflow is '],
      ['100% paperless and online', true],
      ['. Whether you are in Dehradun, Noida, Delhi, Mumbai, or anywhere in India, you can simply share your documents via WhatsApp or Email, review your computation draft on your phone, and receive your official ITR-V or GST certificate without stepping out.'],
    ],
  },
  {
    id: 'reconcile',
    q: 'Why should I reconcile AIS and Form 26AS before filing my Income Tax Return?',
    a: [
      ["The Income Tax Department's automated system cross-checks your ITR against your "],
      ['Annual Information Statement (AIS)', true],
      [' and '],
      ['Form 26AS', true],
      ['. Even a small mismatch in bank interest, dividends, stock trading, or TDS can trigger an automated Section 139(9) Defective Return or Section 143(1) demand notice. We reconcile all three documents before filing.'],
    ],
  },
  {
    id: 'timeline',
    q: 'How long does it take to file an ITR or get a new GST Registration?',
    a: [
      ['Income Tax Returns (ITR)', true],
      [' are typically audited, prepared, and filed within '],
      ['4 to 24 hours', true],
      [' of receiving complete documents. '],
      ['New GST Registration', true],
      [' applications are filed within 24 hours, and government GSTIN allotment generally takes '],
      ['3 to 5 working days', true],
      [' subject to Aadhaar authentication.'],
    ],
  },
  {
    id: 'privacy',
    q: 'Is my financial data and PAN/Aadhaar information kept confidential?',
    a: [
      ['Yes, 100%. We follow strict client data privacy protocols. Your financial statements, Form 16, and identity documents are only used for official government portal filings and are never shared with any third-party marketers or external agencies.'],
    ],
  },
  {
    id: 'notice',
    q: 'Can you help if I already filed my ITR elsewhere and received a tax notice?',
    a: [
      ['Absolutely. Even if someone else filed your original return, our Notice Defense Desk can review your intimation order, prepare a Revised Return (u/s 139(5)), Rectification Request (u/s 154), or Defective Return response (u/s 139(9)) to resolve the discrepancy.'],
    ],
  },
];

export const faqText = (faq) =>
  typeof faq.a === 'string' ? faq.a : faq.a.map(([t]) => t).join('');

/* ------------------------------------------------------------------ */
/* Closing call to action                                              */
/* ------------------------------------------------------------------ */

export const finalCta = {
  body: '100% paperless process. Share your documents on WhatsApp and let our experts handle your filings with zero notice risk.',
  href: wa('Hi Saifi Tax Solutions, I would like to consult regarding my business taxation.'),
  label: 'Talk to Expert',
};
