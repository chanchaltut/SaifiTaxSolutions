import { useState } from 'react';
import { Link, useNavigate } from '../lib/router';
import { ArrowRight, ArrowUpRight, Search, Star, Clock, Check } from 'lucide-react';
import { Btn, Eyebrow, FaqList, Heading, TextLink, ext } from './ui';
import { WhatsAppIcon } from './brand';
import {
  verticals,
  verticalsIntro,
  process,
  plans,
  plansIntro,
  reviews,
  reviewsIntro,
  noticeDesk,
  licences,
  licencesIntro,
  faqs,
  faqIntro,
  finalCta,
} from '../content/home';
import { categories, SERVICE_META_LINE, SERVICE_NOTE } from '../content/services';
import { guides, hub } from '../content/guides';
import { SITE, tel, mailto } from '../content/site';

/* ------------------------------------------------------------------ */

export function Verticals() {
  return (
    <section id="services" className="section verticals" aria-labelledby="verticals-title">
      <div className="wrap">
        <div className="sechead" data-reveal>
          <div className="sechead__l">
            <Eyebrow>{verticalsIntro.eyebrow}</Eyebrow>
            <h2 id="verticals-title" className="h h--3xl">{verticalsIntro.title}</h2>
          </div>
          <p className="sechead__r lede">{verticalsIntro.body}</p>
        </div>
        <ul className="verticals__grid" data-reveal>
          {verticals.map((v) => (
            <li key={v.id}>
              <Link to={v.to} className="vcard">
                <span className="vcard__code" aria-hidden="true">{v.code}</span>
                <span className="vcard__bottom">
                  <span className="vcard__title">{v.title}</span>
                  <span className="vcard__body">{v.body}</span>
                  <span className="vcard__cta">
                    View Requirements
                    <ArrowRight size={18} strokeWidth={1.75} aria-hidden="true" />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export function ServiceIndex() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const submit = (e) => {
    e.preventDefault();
    navigate(q.trim() ? `/services/?q=${encodeURIComponent(q.trim())}` : '/services/');
  };

  return (
    <section id="our-services" className="section index tone-ink" aria-labelledby="svc-title">
      <div className="wrap">
        <div className="index__grid">
          <div className="index__head" data-reveal>
            <Eyebrow tone="inv">OUR SERVICES</Eyebrow>
            <h2 id="svc-title" className="h h--3xl">
              Complete Professional <span className="h__accent h__accent--sky">Services</span>
            </h2>
            <p className="index__meta">{SERVICE_META_LINE}</p>
            <form className="searchbar searchbar--inv" role="search" onSubmit={submit}>
              <Search size={18} strokeWidth={1.75} aria-hidden="true" />
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search — GST, ITR, Trademark, MSME, PF..."
                aria-label="Search services"
                autoComplete="off"
              />
              <button type="submit" aria-label="Search"><ArrowRight size={18} strokeWidth={1.75} /></button>
            </form>
            <p className="index__note">{SERVICE_NOTE}</p>
          </div>

          <ul className="index__list" data-reveal>
            {categories.map((c) => (
              <li key={c.cat}>
                <Link to={c.path} className="irow">
                  <span className="irow__code">{c.code}</span>
                  <span className="irow__main">
                    <span className="irow__name">{c.name}</span>
                    <span className="irow__desc">{c.desc}</span>
                  </span>
                  <span className="irow__price">{c.from}</span>
                  <ArrowUpRight className="irow__arrow" size={22} strokeWidth={1.5} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function StepArt({ i }) {
  if (i === 0) {
    return (
      <div className="art art--docs" aria-hidden="true">
        <span className="art__chip"><i />Form 16</span>
        <span className="art__chip art__chip--2"><i />PAN</span>
        <span className="art__chip art__chip--3"><i />Business details</span>
      </div>
    );
  }
  if (i === 1) {
    return (
      <div className="art art--audit" aria-hidden="true">
        {['Form 16', '26AS', 'AIS'].map((l) => (
          <span key={l} className="art__row">
            <span>{l}</span>
            <span className="art__rule" />
            <Check size={14} strokeWidth={2.5} />
          </span>
        ))}
      </div>
    );
  }
  if (i === 2) {
    return (
      <div className="art art--sheet" aria-hidden="true">
        <span className="art__sheettitle">Tax computation sheet</span>
        <span className="art__bar" style={{ width: '82%' }} />
        <span className="art__bar" style={{ width: '64%' }} />
        <span className="art__bar" style={{ width: '74%' }} />
        <span className="art__bar" style={{ width: '54%' }} />
        <span className="art__bar art__bar--total" style={{ width: '40%' }} />
        <span className="art__approve">Confirm</span>
      </div>
    );
  }
  return (
    <div className="art art--stamp" aria-hidden="true">
      <span className="art__stamp">
        <span>ITR-V</span>
        <span>Acknowledgement</span>
      </span>
    </div>
  );
}

export function Process() {
  return (
    <section id="saifi-how-it-works" className="section process" aria-labelledby="process-title">
      <div className="wrap">
        <div className="sechead" data-reveal>
          <div className="sechead__l">
            <Eyebrow>{process.eyebrow}</Eyebrow>
            <Heading id="process-title" a={process.titleA} b={process.titleB} />
          </div>
          <p className="sechead__r lede">{process.body}</p>
        </div>
        <ol className="process__grid" data-reveal>
          {process.steps.map((s, i) => (
            <li key={s.n} className="pstep">
              <StepArt i={i} />
              <p className="pstep__n">{s.n}</p>
              <h3 className="pstep__title">{s.title}</h3>
              <p className="pstep__body">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Stars() {
  return (
    <span className="stars" role="img" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={14} strokeWidth={0} fill="currentColor" aria-hidden="true" />
      ))}
    </span>
  );
}

export function Reviews() {
  return (
    <section className="section reviews tone-paper" aria-labelledby="reviews-title">
      <div className="wrap">
        <div className="sechead" data-reveal>
          <div className="sechead__l">
            <Eyebrow>{reviewsIntro.eyebrow}</Eyebrow>
            <Heading id="reviews-title" a={reviewsIntro.titleA} b={reviewsIntro.titleB} />
          </div>
          <p className="sechead__r lede">{reviewsIntro.body}</p>
        </div>
        <ul className="reviews__grid" data-reveal>
          {reviews.map((r, i) => (
            <li key={r.name} className={`review${i === 0 ? ' review--lead' : ''}`}>
              <figure>
                <div className="review__top">
                  <Stars />
                  <span className="review__verified"><Check size={13} strokeWidth={2.5} aria-hidden="true" />Verified Client</span>
                </div>
                <blockquote>
                  <p>“{r.quote}”</p>
                </blockquote>
                <figcaption>
                  <span className="review__initials" aria-hidden="true">{r.initials}</span>
                  <span>
                    <strong>{r.name}</strong>
                    <span>{r.role}</span>
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export function PlanCard({ plan }) {
  return (
    <article className={`plan${plan.featured ? ' plan--featured' : ''}`}>
      <div className="plan__top">
        <p className="plan__kicker">{plan.kicker}</p>
        {plan.featured && <p className="plan__flag">{plan.featured}</p>}
      </div>
      <h3 className="plan__title">{plan.title}</h3>
      <p className="plan__body">{plan.body}</p>
      <ul className="plan__list">
        {plan.list.map((l) => (
          <li key={l}><Check size={16} strokeWidth={2} aria-hidden="true" />{l}</li>
        ))}
      </ul>
      <a href={plan.href} className="plan__cta" {...ext}>
        <span>{plan.cta}</span>
        <WhatsAppIcon size={18} />
      </a>
    </article>
  );
}

export function Plans() {
  return (
    <section id="saifi-services-packages" className="section plans" aria-labelledby="plans-title">
      <div className="wrap">
        <div className="sechead" data-reveal>
          <div className="sechead__l">
            <Eyebrow>{plansIntro.eyebrow}</Eyebrow>
            <Heading id="plans-title" a={plansIntro.titleA} b={plansIntro.titleB} />
          </div>
          <p className="sechead__r lede">{plansIntro.body}</p>
        </div>
        <div className="plans__grid" data-reveal>
          {plans.map((p) => (
            <PlanCard key={p.id} plan={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export function NoticeCard({ n }) {
  return (
    <article className="notice">
      <p className="notice__section">{n.section}</p>
      <h3 className="notice__title">{n.title}</h3>
      <p className="notice__body">{n.body}</p>
      <a href={n.href} className="notice__cta" {...ext}>
        {n.cta}
        <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" />
      </a>
    </article>
  );
}

export function NoticeDesk({ headingTag = 'h2' }) {
  return (
    <section id="saifi-notice-desk" className="section noticed tone-ink" aria-labelledby="notice-title">
      <div className="wrap">
        <div className="noticed__head" data-reveal>
          <div>
            <Eyebrow tone="stamp">{noticeDesk.eyebrow}</Eyebrow>
            <Heading as={headingTag} id="notice-title" a={noticeDesk.titleA} b={noticeDesk.titleB} accent="stamp" />
          </div>
          <div className="noticed__side">
            <p className="lede">{noticeDesk.body}</p>
            <Btn href={noticeDesk.href} tone="stamp">{noticeDesk.cta}</Btn>
          </div>
        </div>
        <div className="noticed__grid" data-reveal>
          {noticeDesk.items.map((n) => (
            <NoticeCard key={n.id} n={n} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export function LicenceRow({ l }) {
  return (
    <article className="licence">
      <h3 className="licence__title">
        <Link to={l.to}>{l.title}</Link>
      </h3>
      <p className="licence__body">{l.body}</p>
      <a href={l.href} className="licence__cta" {...ext}>{licencesIntro.cta}</a>
    </article>
  );
}

export function Licences() {
  return (
    <section id="saifi-business-licenses" className="section licences tone-paper" aria-labelledby="licences-title">
      <div className="wrap">
        <div className="sechead" data-reveal>
          <div className="sechead__l">
            <Eyebrow>{licencesIntro.eyebrow}</Eyebrow>
            <Heading id="licences-title" a={licencesIntro.titleA} b={licencesIntro.titleB} />
          </div>
          <p className="sechead__r lede">{licencesIntro.body}</p>
        </div>
        <div className="licences__grid" data-reveal>
          {licences.map((l) => (
            <LicenceRow key={l.id} l={l} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export function FaqSection() {
  return (
    <section id="saifi-faq-section" className="section faqs" aria-labelledby="faq-title">
      <div className="wrap">
        <div className="split split--faq">
          <div className="split__head" data-reveal>
            <Eyebrow>{faqIntro.eyebrow}</Eyebrow>
            <Heading id="faq-title" a={faqIntro.titleA} b={faqIntro.titleB} />
            <p className="lede">{faqIntro.body}</p>
            <TextLink to="/faq/">All answers</TextLink>
          </div>
          <div data-reveal>
            <FaqList items={faqs} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export function GuideCard({ g }) {
  return (
    <Link to={g.path} className={`gcard gcard--${g.slug}`}>
      <span className="gcard__cover" aria-hidden="true">
        <span>{g.cover}</span>
      </span>
      <span className="gcard__meta">
        <span>{g.tag}</span>
        <span className="gcard__time"><Clock size={13} strokeWidth={1.75} aria-hidden="true" />{g.readTime}</span>
      </span>
      <span className="gcard__title">{g.cardTitle}</span>
      <span className="gcard__body">{g.cardBody}</span>
      <span className="gcard__cta">
        {g.cardCta}
        <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" />
      </span>
    </Link>
  );
}

export function HubTeaser() {
  return (
    <section className="section hubt tone-paper" aria-labelledby="hub-title">
      <div className="wrap">
        <div className="sechead" data-reveal>
          <div className="sechead__l">
            <Eyebrow>{hub.eyebrow}</Eyebrow>
            <h2 id="hub-title" className="h h--3xl">{hub.title}</h2>
          </div>
          <div className="sechead__r">
            <p className="lede">{hub.body}</p>
            <TextLink to="/knowledge-hub/">{hub.label}</TextLink>
          </div>
        </div>
        <ul className="hubt__grid" data-reveal>
          {guides.map((g) => (
            <li key={g.slug}><GuideCard g={g} /></li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export function FinalCta() {
  return (
    <section className="final" aria-labelledby="final-title">
      <div className="wrap final__grid">
        <h2 id="final-title" className="final__title">
          <span>Fast.</span> <span>Accurate.</span> <span>100% Digital.</span>
        </h2>
        <div className="final__side">
          <p className="final__body">{finalCta.body}</p>
          <Btn href={finalCta.href} tone="white">{finalCta.label}</Btn>
          <ul className="final__contact">
            <li><a href={tel}>{SITE.phoneDisplay}</a></li>
            <li><a href={mailto}>{SITE.email}</a></li>
            <li>{SITE.address.short}</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
