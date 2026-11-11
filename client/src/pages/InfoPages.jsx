import { Link } from '../lib/router';
import { Mail, MapPin, Phone } from 'lucide-react';
import { AnswerBox, Btn, CardImage, FaqList, PageHead, TextLink, ext } from '../components/ui';
import { IMG } from '../content/cardImages';
import { WhatsAppIcon } from '../components/brand';
import { FinalCta, NoticeCard, Process, Reviews } from '../components/Sections';
import DueDatesSection, { ComplianceRadar } from '../components/DueDates';
import { Stats } from '../components/Hero';
import EnquiryForm, { OfficeMap } from '../components/EnquiryForm';
import { faqById, faqs, faqText, noticeDesk, talkToExpert } from '../content/home';
import { guides } from '../content/guides';
import { categories } from '../content/services';
import { mailto, SITE, tel } from '../content/site';

export function CalendarPage() {
  return (
    <>
      <PageHead
        crumbs={[['Home', '/'], ['Due Dates']]}
        eyebrow="Statutory Compliance Calendar"
        title="Tax Due Dates"
        body="TDS deposit on the 7th, GSTR-1 on the 11th, GSTR-3B on the 20th, and quarterly advance tax on the 15th."
      />
      <ComplianceRadar />
      <DueDatesSection calendar />
      <FinalCta />
    </>
  );
}

export function NoticeDeskPage() {
  return (
    <>
      <PageHead
        tone="ink"
        crumbs={[['Home', '/'], ['Notice Desk']]}
        eyebrow={noticeDesk.eyebrow}
        title={noticeDesk.titleA}
        titleB={noticeDesk.titleB}
        body={noticeDesk.body}
      >
        <Btn href={noticeDesk.href} tone="stamp">{noticeDesk.cta}</Btn>
      </PageHead>
      <section className="section section--tight tone-ink noticed noticed--page" aria-label="Notice types">
        <div className="wrap">
          <div className="noticed__grid">
            {noticeDesk.items.map((n) => <NoticeCard key={n.id} n={n} />)}
          </div>
        </div>
      </section>
      <section className="section section--tight" aria-labelledby="ndq">
        <div className="wrap">
          <div className="split split--faq">
            <div className="split__head">
              <p className="eyebrow">Got Questions?</p>
              <h2 id="ndq" className="h h--2xl">Notice Defense Desk</h2>
            </div>
            <FaqList items={faqs.filter((f) => ['notice', 'reconcile'].includes(f.id))} />
          </div>
        </div>
      </section>
      <FinalCta />
    </>
  );
}

export function FaqPage() {
  const guideFaqs = guides.flatMap((g) => g.faqs);
  return (
    <>
      <PageHead
        crumbs={[['Home', '/'], ['FAQ']]}
        eyebrow="Got Questions?"
        title="Frequently Asked"
        titleB="Compliance Questions"
        body="Everything you need to know about our online tax filing, security, and turnaround time."
      />
      <section className="section section--tight">
        <div className="wrap">
          <div className="split split--faq">
            <div className="split__head"><h2 className="h h--2xl">Online tax filing, security &amp; turnaround</h2></div>
            <FaqList items={faqs} />
          </div>
          <div className="split split--faq split--gap">
            <div className="split__head"><h2 className="h h--2xl">AIS, Form 26AS &amp; Form 16</h2></div>
            <FaqList items={guideFaqs} />
          </div>
        </div>
      </section>
      <FinalCta />
    </>
  );
}

export function AboutPage() {
  return (
    <>
      <PageHead
        crumbs={[['Home', '/'], ['About']]}
        eyebrow="Your Trusted Financial Partner — Dehradun"
        title={SITE.name}
        body={SITE.blurb}
      />
      <section className="section section--tight" aria-labelledby="about-facts">
        <div className="wrap">
          <AnswerBox label="Who we are">
            {SITE.name} provides GST, ITR &amp; TDS filing, Company &amp; MSME registrations and Comprehensive Tax Advisory — delivered 100% online with accuracy and transparency, from {SITE.address.full}.
          </AnswerBox>
          <h2 id="about-facts" className="visually-hidden">In numbers</h2>
          <Stats />
        </div>
      </section>
      <section className="section section--tight tone-paper" aria-labelledby="about-services">
        <div className="wrap">
          <h2 id="about-services" className="h h--xl">Complete Professional Services</h2>
          <ul className="otherlinks">
            {categories.map((o) => (
              <li key={o.cat}>
                <Link to={o.path}>
                  <span>{o.name}</span>
                  <span className="otherlinks__from">{o.from}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <Process />
      <Reviews />
      <FinalCta />
    </>
  );
}

export function ContactPage() {
  return (
    <>
      <PageHead
        crumbs={[['Home', '/'], ['Contact']]}
        eyebrow="Talk to Expert"
        title="Chat With Us on WhatsApp"
        body="100% paperless process. Share your documents on WhatsApp and let our experts handle your filings with zero notice risk."
      >
        <Btn href={talkToExpert.href}>{talkToExpert.label}</Btn>
      </PageHead>
      <section className="section section--tight">
        <div className="wrap">
          <address className="contactgrid">
            <a href={talkToExpert.href} className="contactcard has-photo" {...ext}>
              <CardImage name={IMG.contact[0]} />
              <WhatsAppIcon size={24} />
              <span className="contactcard__k">WhatsApp</span>
              <span className="contactcard__v">{SITE.phoneDisplay}</span>
              <span className="contactcard__n">15 Mins Avg. WhatsApp Response</span>
            </a>
            <a href={tel} className="contactcard has-photo">
              <CardImage name={IMG.contact[1]} />
              <Phone size={24} strokeWidth={1.5} aria-hidden="true" />
              <span className="contactcard__k">Phone</span>
              <span className="contactcard__v">{SITE.phoneDisplay}</span>
            </a>
            <a href={mailto} className="contactcard has-photo">
              <CardImage name={IMG.contact[2]} />
              <Mail size={24} strokeWidth={1.5} aria-hidden="true" />
              <span className="contactcard__k">Email</span>
              <span className="contactcard__v contactcard__v--sm">{SITE.email}</span>
            </a>
            <a href={SITE.mapUrl} className="contactcard has-photo" {...ext}>
              <CardImage name={IMG.contact[3]} />
              <MapPin size={24} strokeWidth={1.5} aria-hidden="true" />
              <span className="contactcard__k">Office Location</span>
              <span className="contactcard__v contactcard__v--sm">{SITE.address.full}</span>
            </a>
          </address>
        </div>
      </section>
      <section className="section section--tight tone-paper" aria-labelledby="enquiry-title">
        <div className="wrap">
          <div className="enqgrid">
            <EnquiryForm />
            <OfficeMap />
          </div>
        </div>
      </section>
      <section className="section section--tight" aria-labelledby="contact-online">
        <div className="wrap">
          <div className="split split--faq">
            <div className="split__head">
              <h2 id="contact-online" className="h h--2xl">{faqById('online').q}</h2>
            </div>
            <div className="prose"><p>{faqText(faqById('online'))}</p></div>
          </div>
        </div>
      </section>
    </>
  );
}

export function NotFoundPage() {
  return (
    <>
      <PageHead
        crumbs={[['Home', '/'], ['Page not found']]}
        eyebrow="404"
        title="This page isn’t on file."
        body="The page may have moved. Every service, fee and guide is one click away."
      >
        <div className="phead__links">
          <TextLink to="/">Home</TextLink>
          <TextLink to="/services/">Services</TextLink>
          <TextLink to="/knowledge-hub/">Knowledge Hub</TextLink>
        </div>
      </PageHead>
      <FinalCta />
    </>
  );
}
