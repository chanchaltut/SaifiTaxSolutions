import { Link } from 'react-router-dom';
import { Icon } from '../ui';

const TOPICS = [
  {
    icon: 'newspaper',
    title: 'Writing an article',
    points: [
      'Blog → Articles & guides → “Add article”. Write a headline, a one or two sentence summary, then the article itself.',
      'Use “Heading” in the editor for each main section. The headings build the “On this page” list and help Google understand the article.',
      'Add tables for comparisons (old vs new regime, due dates, fees), and a “Note box” for tips and warnings.',
      'Switch off “Published” to keep it as a draft. Nobody sees a draft until you switch it on.',
      'The four original guides have a designed layout. You can still edit their title, summary, questions and WhatsApp box.',
      'Copying text from Word or Google Docs works: headings, bold and lists are kept. Pictures are not, so add them with the Photo button.',
    ],
  },
  {
    icon: 'images',
    title: 'Photos',
    points: [
      'Upload from your phone or computer, any size. Every photo is turned into a small WebP file. “WebP compression” lets you choose High quality, Balanced (recommended) or Smallest file.',
      'Hidden information inside photos, such as the GPS location, is removed.',
      '“Crop” cuts away what should never be seen. “Auto crop” fits the shape around the most important part by itself.',
      '“Focus point” is the most important spot. It is set automatically when you upload; move it if needed. Phones and computers show photos in different shapes, and the focus point always stays in view.',
      'Write a short description for each photo. It helps blind visitors and Google.',
      'iPhone photos: if one will not upload, on the iPhone go to Settings → Camera → Formats → “Most Compatible”.',
    ],
  },
  {
    icon: 'award',
    title: 'Certificate previews',
    points: [
      'Only use real certificates you delivered, with the client’s permission.',
      'Upload a photo or scan, then press “Hide details” and drag over the name, address, PAN, GSTIN, registration number, QR code and signature. A covered copy is saved; nothing underneath can be recovered from it.',
      'The original photo stays in the Photo library. Delete it there once the covered copy is in use.',
      'A PDF also works: choose “A PDF file” and upload it. Hide the details in the PDF before uploading.',
      'Pick the service in “Service whose fee is shown” so the fee always matches your fee list.',
    ],
  },
  {
    icon: 'briefcase',
    title: 'Fees and services',
    points: [
      'Services → Services & fees holds every service and its fee. Changing a fee there changes it everywhere: service pages, certificate pop-ups, the Dehradun page and Google.',
      'Write fees the way visitors should read them, for example “Starting from ₹1,499” or “On Consultation”.',
      'The Fee schedule page has its own short summary table. Remember to update it too when a main fee changes.',
    ],
  },
  {
    icon: 'eye',
    title: 'Hide instead of delete',
    points: [
      'Articles, services, certificates, reviews, plans and questions can be hidden with the eye button. Hidden things disappear from the website but stay here, ready to show again.',
      'Deleting is permanent. Photos still used somewhere cannot be deleted by mistake.',
    ],
  },
  {
    icon: 'globe',
    title: 'When do changes appear?',
    points: [
      'About two minutes after you stop editing, the website is published by itself. Publishing takes about two more minutes.',
      'In a hurry? Press “Publish now” at the top of the screen.',
      'The whole website is rebuilt each time, so Google, WhatsApp link previews and AI assistants see exactly what your visitors see.',
      'If the website could not be published, it keeps showing the previous version and tries again by itself.',
    ],
  },
  {
    icon: 'key',
    title: 'Staying safe',
    points: [
      'Use your own account. Never share passwords: the owner can add as many people as needed in “People & access”.',
      'After 8 wrong passwords an account locks for 15 minutes.',
      'Lost a phone? Open “My account” and press “Sign out everywhere”.',
      'Every change is written in the Activity log, so mistakes can be traced and fixed.',
    ],
  },
];

export default function Help() {
  return (
    <div className="a-page">
      <header className="a-page__head">
        <div>
          <h1><Icon name="help" size={26} /> Help & tips</h1>
          <p className="a-page__desc">Everything you need to look after the website. Nothing here can break it: if something is wrong, the panel tells you how to fix it.</p>
        </div>
      </header>
      <div className="a-helpgrid">
        {TOPICS.map((t) => (
          <section className="a-card" key={t.title}>
            <h2 className="a-card__title"><Icon name={t.icon} size={20} /> {t.title}</h2>
            <ul className="a-ticks">{t.points.map((p) => <li key={p}>{p}</li>)}</ul>
          </section>
        ))}
      </div>
      <p className="a-muted">Still stuck? Write down what you were doing and what the message said, and send it to Code Hyphen. <Link to="/activity">The activity log</Link> helps us see what happened.</p>
    </div>
  );
}
