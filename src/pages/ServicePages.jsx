import { Link, useParams, Navigate } from '../lib/router';
import { Check } from 'lucide-react';
import ServiceCatalog, { FeeTable } from '../components/ServiceCatalog';
import { AnswerBox, Btn, Eyebrow, FaqList, PageHead, TextLink } from '../components/ui';
import { FinalCta, GuideCard, LicenceRow, NoticeCard, PlanCard } from '../components/Sections';
import { ext } from '../components/ui';
import { categories, categoryEnquiry, SERVICE_META_LINE, SERVICE_NOTE } from '../content/services';
import { dueDates, feeSchedule, licences, noticeDesk, plans, verticals } from '../content/home';
import { guideBySlug } from '../content/guides';
import { wa } from '../content/site';
import { serviceFaqs } from '../seo/serviceFaqs';

export function ServicesPage() {
  return (
    <>
      <PageHead
        crumbs={[['Home', '/'], ['Services']]}
        eyebrow="OUR SERVICES"
        title="Complete Professional"
        titleB="Services"
        body={SERVICE_META_LINE}
        meta={SERVICE_NOTE}
      />
      <section className="section section--tight">
        <div className="wrap">
          <ServiceCatalog />
        </div>
      </section>
      <FinalCta />
    </>
  );
}

function Requirements({ v }) {
  return (
    <section className="section reqs tone-paper" aria-labelledby="req-title">
      <div className="wrap">
        <div className="reqs__grid">
          <div>
            <Eyebrow>{v.detailTitle}</Eyebrow>
            <h2 id="req-title" className="h h--2xl">Required Documents</h2>
            <ul className="reqlist">
              {v.documents.map(([k, val]) => (
                <li key={k}>
                  <Check size={18} strokeWidth={2} aria-hidden="true" />
                  <span><strong>{k}:</strong> {val}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <Eyebrow>{v.detailTitle}</Eyebrow>
            <h2 className="h h--2xl">Key Benefits</h2>
            <ul className="reqlist">
              {v.benefits.map(([k, val]) => (
                <li key={k}>
                  <Check size={18} strokeWidth={2} aria-hidden="true" />
                  <span><strong>{k}:</strong> {val}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="reqs__cta">
          <Btn href={v.href}>{v.cta}</Btn>
        </div>
      </div>
    </section>
  );
}

export function ServiceCategoryPage() {
  const { slug } = useParams();
  const c = categories.find((x) => x.slug === slug);
  if (!c) return <Navigate to="/services/" replace />;

  const vertical = verticals.find((v) => v.id === c.cat);
  const relatedPlans = plans.filter((p) => c.plans.includes(p.id));
  const relatedNotices = noticeDesk.items.filter((n) => c.related.notices.includes(n.id));
  const relatedDues = dueDates.items.filter((d) => c.related.dueDates.includes(d.id));
  const relatedGuides = c.related.guides.map(guideBySlug);
  const licence = licences.find((l) => l.id === c.related.licence);
  const others = categories.filter((x) => x.cat !== c.cat);

  return (
    <>
      <PageHead
        crumbs={[['Home', '/'], ['Services', '/services/'], [c.name]]}
        eyebrow={c.from}
        title={c.name}
        body={vertical ? vertical.body : c.desc}
        meta={vertical ? c.desc : undefined}
      >
        <Btn href={wa(categoryEnquiry(c.name))}>{`Enquire about ${c.name}`}</Btn>
      </PageHead>

      <section className="section section--tight" aria-labelledby="fee-title">
        <div className="wrap">
          <div className="svcbody">
            <div className="svcbody__side">
              <p className="svcbody__code" aria-hidden="true">{c.code}</p>
              <AnswerBox label={c.name}>
                {c.desc} {c.from}, 100% online across India.
              </AnswerBox>
              <p className="note">{SERVICE_NOTE}</p>
            </div>
            <div>
              <h2 id="fee-title" className="h h--xl">All services — fees as listed</h2>
              <FeeTable items={c.items} caption={`${c.name} fees`} />
            </div>
          </div>
        </div>
      </section>

      {vertical && <Requirements v={vertical} />}

      {licence && (
        <section className="section section--tight tone-paper" aria-labelledby="lic-title">
          <div className="wrap">
            <h2 id="lic-title" className="h h--xl">Complete Business Desk</h2>
            <div className="licences__grid licences__grid--single"><LicenceRow l={licence} /></div>
          </div>
        </section>
      )}

      {relatedPlans.length > 0 && (
        <section className="section section--tight" aria-labelledby="plan-title">
          <div className="wrap">
            <h2 id="plan-title" className="h h--xl">Choose Your Compliance Plan</h2>
            <div className={`plans__grid plans__grid--${relatedPlans.length}`}>
              {relatedPlans.map((p) => <PlanCard key={p.id} plan={p} />)}
            </div>
          </div>
        </section>
      )}

      {relatedDues.length > 0 && (
        <section className="section section--tight tone-paper" aria-labelledby="due-rel">
          <div className="wrap">
            <div className="rowhead">
              <h2 id="due-rel" className="h h--xl">Statutory Compliance Calendar</h2>
              <TextLink to="/compliance-calendar/">Due Dates</TextLink>
            </div>
            <ul className="duestrip">
              {relatedDues.map((d) => (
                <li key={d.id}>
                  <span className="duestrip__num">{d.date}</span>
                  <span>
                    <strong>{d.title}</strong>
                    <span>{d.body}</span>
                    <a href={d.href} {...ext}>{d.cta}</a>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {relatedNotices.length > 0 && (
        <section className="section section--tight tone-ink" aria-labelledby="not-rel">
          <div className="wrap">
            <div className="rowhead">
              <h2 id="not-rel" className="h h--xl">{noticeDesk.titleA} {noticeDesk.titleB}</h2>
              <TextLink to="/notice-desk/" tone="inv">Notice Desk</TextLink>
            </div>
            <div className="noticed__grid">
              {relatedNotices.map((n) => <NoticeCard key={n.id} n={n} />)}
            </div>
          </div>
        </section>
      )}

      {relatedGuides.length > 0 && (
        <section className="section section--tight" aria-labelledby="guide-rel">
          <div className="wrap">
            <div className="rowhead">
              <h2 id="guide-rel" className="h h--xl">Related Income Tax Guides</h2>
              <TextLink to="/knowledge-hub/">Knowledge Hub</TextLink>
            </div>
            <ul className="hubt__grid">
              {relatedGuides.map((g) => <li key={g.slug}><GuideCard g={g} /></li>)}
            </ul>
          </div>
        </section>
      )}

      <section className="section section--tight" aria-labelledby="svc-faq">
        <div className="wrap">
          <div className="split split--faq">
            <div className="split__head">
              <Eyebrow>Got Questions?</Eyebrow>
              <h2 id="svc-faq" className="h h--2xl">{c.name}: questions</h2>
            </div>
            <FaqList items={serviceFaqs(c)} />
          </div>
        </div>
      </section>

      <section className="section section--tight tone-paper" aria-labelledby="other-svc">
        <div className="wrap">
          <h2 id="other-svc" className="h h--xl">Complete Professional Services</h2>
          <ul className="otherlinks">
            {others.map((o) => (
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

      <FinalCta />
    </>
  );
}

export function FeeSchedulePage() {
  return (
    <>
      <PageHead
        crumbs={[['Home', '/'], [feeSchedule.title]]}
        eyebrow={feeSchedule.title}
        title={feeSchedule.heading}
        body={feeSchedule.body}
        meta={SERVICE_NOTE}
      >
        <Btn href={wa()}>{feeSchedule.cta}</Btn>
      </PageHead>
      <section className="section section--tight">
        <div className="wrap">
          <div className="feegroups">
            {feeSchedule.groups.map((g) => (
              <div key={g.title} className="feegroup">
                <h2>{g.title}</h2>
                <table>
                  <caption className="visually-hidden">{g.title} fees</caption>
                  <thead className="visually-hidden">
                    <tr><th scope="col">Service</th><th scope="col">Fee</th></tr>
                  </thead>
                  <tbody>
                    {g.rows.map(([k, val]) => (
                      <tr key={k}>
                        <th scope="row">{k}</th>
                        <td>{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
          <div className="feegroups__foot">
            <p className="lede">{SERVICE_META_LINE}</p>
            <TextLink to="/services/">Complete Professional Services</TextLink>
          </div>
        </div>
      </section>
      <FinalCta />
    </>
  );
}
