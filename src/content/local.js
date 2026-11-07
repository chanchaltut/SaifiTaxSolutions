import { SITE } from './site';
import { faqs, faqText } from './home';

const answerFor = (id) => faqText(faqs.find((f) => f.id === id));

/**
 * The Dehradun landing page. Every fact here comes from the client's own
 * material, so nothing is claimed that the firm has not stated.
 */
export const local = {
  path: '/tax-consultant-dehradun/',
  crumb: 'Tax Consultant in Dehradun',
  metaTitle: 'Tax Consultant in Dehradun: ITR, GST & Company Setup | Saifi Tax',
  metaDescription:
    'Saifi Tax Solutions, IT Park, Sahastradhara Road, Dehradun. ITR filing from ₹499, GST registration from ₹1,499, company setup and tax notice replies. Call +91 9548932631.',
  eyebrow: 'Your Trusted Financial Partner — Dehradun',
  titleA: 'Tax Consultant in',
  titleB: 'Dehradun',
  body: 'GST, ITR & TDS filing, Company & MSME registrations, Comprehensive Tax Advisory — delivered 100% online with accuracy and transparency.',
  answer: `${SITE.name} is a tax and compliance consultancy at ${SITE.address.full}. It handles ITR filing, GST registration and returns, TDS, company and MSME registration and tax notice replies for clients in Dehradun and across India.`,
  servicesTitle: 'Popular services in Dehradun',
  /* Names must match services.raw.json, so fees always stay in step with the catalog. */
  popular: [
    'ITR-1 — Salaried / Pension',
    'ITR-3 / ITR-4 — Business & Freelancer',
    'New GST Registration — Individual',
    'GST Returns (GSTR-1 & GSTR-3B)',
    'Income Tax Notice Reply & Assessment',
    'GST Notice / Demand Reply',
    'Private Limited Company (Pvt Ltd) + GST',
    'New Udyam Registration',
    'FSSAI Basic Registration (Petty Operator)',
    'Trademark Registration (1 Class)',
    'Full Bookkeeping',
    '26Q — Non-Salary TDS Return',
  ],
  faqs: [
    {
      q: 'Where is Saifi Tax Solutions located in Dehradun?',
      a: `${SITE.name} is at ${SITE.address.full}. You can reach the team on ${SITE.phoneDisplay} by phone or WhatsApp, or at ${SITE.email}.`,
    },
    {
      q: 'How much does ITR filing cost in Dehradun?',
      a: 'At Saifi Tax Solutions, ITR-1 for salaried people starts from ₹499, ITR-3 / ITR-4 for business and freelancers from ₹999, ITR-2 for salary with capital gains from ₹1,499, and audit cases from ₹4,999.',
    },
    {
      q: 'How long does GST registration take in Dehradun?',
      a: 'New GST Registration applications are filed within 24 hours, and government GSTIN allotment generally takes 3 to 5 working days subject to Aadhaar authentication. Fees start from ₹1,499 for individuals.',
    },
    {
      q: 'Do I need to visit the Dehradun office?',
      a: answerFor('online'),
    },
    {
      q: 'Can you help with an Income Tax or GST notice in Dehradun?',
      a: answerFor('notice'),
    },
  ],
};
