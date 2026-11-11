import { Phone } from 'lucide-react';
import { AnswerBox, Btn, Eyebrow, FaqList, PageHead } from '../components/ui';
import { FinalCta, Process, Reviews } from '../components/Sections';
import { FeeTable } from '../components/ServiceCatalog';
import EnquiryForm, { OfficeMap } from '../components/EnquiryForm';
import { local } from '../content/local';
import { categories, SERVICE_NOTE } from '../content/services';
import { talkToExpert } from '../content/home';
import { SITE, tel } from '../content/site';

const allItems = categories.flatMap((c) => c.items);
const popular = local.popular.map((name) => allItems.find((i) => i.name === name)).filter(Boolean);

export default function LocalPage() {
  return (
    <>
      <PageHead
        crumbs={[['Home', '/'], [local.crumb]]}
        eyebrow={local.eyebrow}
        title={local.titleA}
        titleB={local.titleB}
        body={local.body}
      >
        <div className="phead__actions">
          <Btn href={talkToExpert.href}>{talkToExpert.label}</Btn>
          <a className="phead__tel" href={tel}>
            <Phone size={17} strokeWidth={1.75} aria-hidden="true" />
            {SITE.phoneDisplay}
          </a>
        </div>
      </PageHead>

      <section className="section section--tight" aria-labelledby="local-services">
        <div className="wrap">
          <div className="svcbody">
            <div className="svcbody__side">
              <AnswerBox label={`About ${SITE.name}`}>{local.answer}</AnswerBox>
              <p className="note">{SERVICE_NOTE}</p>
            </div>
            <div>
              <h2 id="local-services" className="h h--xl">{local.servicesTitle}</h2>
              <FeeTable items={popular} caption={local.servicesTitle} />
            </div>
          </div>
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

      <Process />
      <Reviews />

      <section className="section section--tight" aria-labelledby="local-faq">
        <div className="wrap">
          <div className="split split--faq">
            <div className="split__head">
              <Eyebrow>Got Questions?</Eyebrow>
              <h2 id="local-faq" className="h h--2xl">Tax help in Dehradun: questions</h2>
            </div>
            <FaqList items={local.faqs} />
          </div>
        </div>
      </section>

      <FinalCta />
    </>
  );
}
