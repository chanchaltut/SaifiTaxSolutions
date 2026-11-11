import { single } from './data';
import { localFaqs } from './home';

/**
 * The Dehradun landing page, edited in the admin panel: Pages → Dehradun page.
 * Its questions are the ones marked "Tax consultant in Dehradun page" in
 * Questions & answers.
 */
const l = single('local');

export const local = {
  path: '/tax-consultant-dehradun/',
  crumb: 'Tax Consultant in Dehradun',
  metaTitle: l.metaTitle,
  metaDescription: l.metaDescription,
  eyebrow: l.eyebrow,
  titleA: l.titleA,
  titleB: l.titleB,
  body: l.body,
  answer: l.answer,
  servicesTitle: l.servicesTitle,
  /* Names match the fee list, so fees always stay in step with the catalog. */
  popular: l.popular || [],
  faqs: localFaqs,
};
