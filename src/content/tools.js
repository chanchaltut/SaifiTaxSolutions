/** Saifi Tools Hub and the interactive checker / estimator copy. */

export const toolsHub = {
  label: 'Saifi Tools Hub',
  soon: 'HSN Finder (Soon)',
};

export const tools = [
  {
    id: 'gst',
    path: '/tools/gst-calculator/',
    nav: 'GST Calculator',
    title: 'GST Calculator Engine',
    metaTitle: 'GST Calculator: Inclusive, Exclusive, CGST + SGST',
    metaDescription:
      'Free GST calculator from Saifi Tax Solutions. Work out taxable amount, CGST, SGST and final value at 5%, 12%, 18% or 28%, inclusive or exclusive of tax.',
    blurb: 'Exclusive (Base + Tax) or Inclusive (Total incl. Tax), with CGST and SGST shown separately.',
  },
  {
    id: 'emi',
    path: '/tools/emi-calculator/',
    nav: 'EMI Calculator',
    title: 'Business Loan EMI',
    metaTitle: 'Business Loan EMI Calculator with Total Interest',
    metaDescription:
      'Free business loan EMI calculator from Saifi Tax Solutions. Enter loan amount, interest rate and tenure to see your monthly instalment, total interest and total payment.',
    blurb: 'Monthly Installment, Total Interest and Total Payment for any loan amount, rate and tenure.',
  },
  {
    id: 'estimator',
    path: '/tools/presumptive-tax-estimator/',
    nav: 'Presumptive Income Estimator',
    title: 'Freelancer & Business Presumptive Income Estimator',
    metaTitle: 'Presumptive Tax Calculator: Section 44AD & 44ADA',
    metaDescription:
      'See how Section 44ADA (Professionals) & Section 44AD (Businesses) reduce your taxable income legally. Free presumptive income estimator for ITR-4 filers.',
    blurb: 'See how Section 44ADA (Professionals) & Section 44AD (Businesses) reduce your taxable income legally.',
  },
  {
    id: 'checker',
    path: '/tools/itr-checker/',
    nav: '1-Minute ITR & Tax Checker',
    title: '1-Minute ITR & Tax Checker',
    metaTitle: '1-Minute ITR Checker: Which ITR Form Applies to You?',
    metaDescription:
      'Not sure which ITR form applies to you or how to handle an AIS mismatch? Answer 3 quick questions to get your instant compliance plan.',
    blurb: 'Answer 3 quick questions to get your instant compliance plan.',
  },
];

export const toolById = (id) => tools.find((t) => t.id === id);

export const estimator = {
  eyebrow: 'Instant Tax Saving Calculator',
  titleA: 'Freelancer & Business',
  titleB: 'Presumptive Income Estimator',
  body: 'See how Section 44ADA (Professionals) & Section 44AD (Businesses) reduce your taxable income legally.',
  categoryLabel: 'Select Your Category',
  turnoverLabel: 'Annual Gross Receipts / Turnover (₹)',
  resultLabel: 'Minimum Taxable Profit Under ITR-4',
  cta: 'Claim This Tax Benefit in My ITR',
  options: [
    {
      value: '44ada',
      label: 'Freelancer / Consultant / Doctor / IT (Sec 44ADA - 50%)',
      rate: 0.5,
      sec: 'Section 44ADA (50%)',
    },
    {
      value: '44ad_digital',
      label: 'Business / Trader - Digital Receipts (Sec 44AD - 6%)',
      rate: 0.06,
      sec: 'Section 44AD Digital (6%)',
    },
    {
      value: '44ad_cash',
      label: 'Business / Shop - Cash Receipts (Sec 44AD - 8%)',
      rate: 0.08,
      sec: 'Section 44AD Cash (8%)',
    },
  ],
};

export const checker = {
  eyebrow: 'Interactive Compliance Tool',
  titleA: '1-Minute',
  titleB: 'ITR & Tax Checker',
  body: 'Not sure which ITR form applies to you or how to handle an AIS mismatch? Answer 3 quick questions to get your instant compliance plan.',
  resultEyebrow: 'Your Personalized Compliance Recommendation',
  cta: 'Get My Exact Filing Plan on WhatsApp',
  restart: 'Start Over / Check Another Profile',
  back: 'Previous Question',
  steps: [
    {
      q: '1. What is your primary source of income?',
      options: [
        { value: 'Salaried Employee', title: 'Salaried Employee', sub: 'Receiving salary / Form 16 from employer' },
        { value: 'Business / Shop Owner', title: 'Business / Shop Owner', sub: 'Retail, trading, manufacturing, or MSME' },
        { value: 'Freelancer / Professional', title: 'Freelancer / Professional', sub: 'Doctor, consultant, IT freelancer, agency' },
        { value: 'Stocks, Mutual Funds or Property', title: 'Stocks / F&O / Property Sale', sub: 'Capital gains, intraday trading, or rent' },
      ],
    },
    {
      q: '2. What is your approximate annual income / turnover?',
      options: [
        { value: 'Up to ₹12 Lakh', title: 'Up to ₹12 Lakh', sub: 'Section 87A rebate check & basic ITR filing' },
        { value: '₹12 Lakh to ₹15 Lakh', title: '₹12 Lakh – ₹15 Lakh', sub: 'Old vs New regime tax-saving optimization' },
        { value: '₹15 Lakh to ₹50 Lakh', title: '₹15 Lakh – ₹50 Lakh', sub: 'Presumptive tax (44AD/44ADA) & AIS review' },
        { value: 'Above ₹50 Lakh', title: 'Above ₹50 Lakh', sub: 'Advanced tax audit, GST & surcharge planning' },
      ],
    },
    {
      q: '3. What do you need help with right now?',
      options: [
        { value: 'Error-Free ITR Filing', title: 'File My ITR Accurately', sub: 'Complete filing + Form 16, 26AS & AIS check' },
        { value: 'New GST / Monthly GST Returns', title: 'GST Registration / Filing', sub: 'New GSTIN in 3–5 days or GSTR-1 & 3B' },
        { value: 'AIS Mismatch / Tax Notice Reply', title: 'AIS Mismatch / Notice Help', sub: 'Resolve defective return or TDS mismatch' },
        { value: 'MSME / Business Setup & Accounting', title: 'MSME & Full Compliance', sub: 'Udyam, bookkeeping, and annual compliance' },
      ],
    },
  ],
};

export const recommend = (q1) => {
  if (q1.includes('Salaried')) {
    return {
      title: 'Recommended: ITR-1 (Sahaj) + AIS & 26AS Check',
      desc: 'Ideal for salaried taxpayers. Our team will cross-verify your Form 16 with AIS bank interest/dividends and compare Old vs New Tax Regime to maximize your refund.',
    };
  }
  if (q1.includes('Business')) {
    return {
      title: 'Recommended: ITR-4 (Sugam) Sec 44AD / GST Review',
      desc: 'Best suited for business & shop owners. We help you declare presumptive income accurately, reconcile GST turnovers, and prevent defective return notices.',
    };
  }
  if (q1.includes('Freelancer')) {
    return {
      title: 'Recommended: ITR-4 under Section 44ADA (50% Presumptive Income)',
      desc: 'Eligible professionals can declare income on a presumptive basis under Section 44ADA (subject to turnover limits) while matching client TDS in Form 26AS.',
    };
  }
  return {
    title: 'Recommended: ITR-2 / ITR-3 Capital Gains & AIS Audit',
    desc: 'Stock market, mutual fund, and property transactions are directly reported in AIS. Accurate capital gains schedule filing is mandatory to avoid tax notices.',
  };
};
