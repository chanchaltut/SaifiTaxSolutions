import { SERVICE_NOTE } from '../content/services';
import { faqs, faqText } from '../content/home';

const note = SERVICE_NOTE.replace(/^\*\s*/, '');
const onlineAnswer = faqText(faqs.find((f) => f.id === 'online'));

/**
 * Self-contained answers for each service page, assembled only from facts
 * already on the page. Shown on screen and mirrored in FAQPage structured data.
 */
export function serviceFaqs(c) {
  const listed = c.items.filter((i) => i.price);
  const names = c.items.slice(0, 4).map((i) => i.name).join(', ');
  const priced = listed
    .slice(0, 3)
    .map((i) => `${i.name}: ${i.price}`)
    .join('; ');

  return [
    {
      q: `What does ${c.name} at Saifi Tax Solutions cover?`,
      a: `${c.desc} The ${c.items.length} listed services include ${names}.`,
    },
    {
      q: `How much does ${c.name} cost?`,
      a: `${c.name} are priced ${c.from.toLowerCase()}. For example, ${priced}. ${note}`,
    },
    {
      q: `Do I need to visit the Dehradun office for ${c.name}?`,
      a: onlineAnswer,
    },
  ];
}
