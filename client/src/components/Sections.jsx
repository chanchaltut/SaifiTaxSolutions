import { useCallback, useState } from 'react';
import { Link } from '../lib/router';
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  CircleCheck,
  Clock,
  Copyright,
  FileText,
  FolderOpen,
  Globe,
  KeyRound,
  Landmark,
  Laptop,
  Layers,
  MessageCircleQuestion,
  Percent,
  ReceiptIndianRupee,
  ShieldAlert,
  ShieldCheck,
  Star,
  Store,
  UserRound,
  Utensils,
  Zap,
} from 'lucide-react';
import Modal from './Modal';
import { Btn, CardImage, FaqList, SectionHead, TextLink, ext } from './ui';
import { IMG } from '../content/cardImages';
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
import { SITE, tel, mailto } from '../content/site';

/* ------------------------------------------------------------------ */
/* Full-lifecycle business governance: three cards, each opens a pop-up */
/* ------------------------------------------------------------------ */

const VERTICAL_STYLE = {
  itr: { tone: 'sky', Icon: ReceiptIndianRupee },
  gst: { tone: 'emerald', Icon: Percent },
  inc: { tone: 'indigo', Icon: Landmark },
};

function VerticalDetail({ v }) {
  const { tone, Icon } = VERTICAL_STYLE[v.id];
  const second = tone === 'sky' ? 'emerald' : 'sky';
  return (
    <div className="vdetail">
      <div className="vdetail__head">
        <span className={`icotile icotile--${tone}`}><Icon size={22} strokeWidth={2} aria-hidden="true" /></span>
        <div>
          <p className="vdetail__eyebrow">{verticalsIntro.eyebrow}</p>
          <h3 id={`vertical-${v.id}-title`} className="vdetail__title">{v.detailTitle}</h3>
        </div>
      </div>
      <div className="vdetail__grid">
        <div className={`vdetail__card vdetail__card--${tone}`}>
          <h4><FolderOpen size={18} strokeWidth={2} aria-hidden="true" />Required Documents</h4>
          <ul>
            {v.documents.map(([k, d]) => (
              <li key={k}>
                <CircleCheck size={16} strokeWidth={2.25} aria-hidden="true" />
                <span><strong>{k}:</strong> {d}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className={`vdetail__card vdetail__card--${second}`}>
          <h4><Star size={18} strokeWidth={2} aria-hidden="true" />Key Benefits</h4>
          <ul>
            {v.benefits.map(([k, d]) => (
              <li key={k}>
                <ShieldCheck size={16} strokeWidth={2.25} aria-hidden="true" />
                <span><strong>{k}:</strong> {d}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="vdetail__cta">
        <Btn href={v.href} tone={tone === 'emerald' ? 'wa' : 'blue'}>{v.cta}</Btn>
      </div>
    </div>
  );
}

export function Verticals() {
  const [active, setActive] = useState(null);
  const close = useCallback(() => setActive(null), []);
  const current = verticals.find((v) => v.id === active);

  return (
    <section id="services" className="section verticals" aria-labelledby="verticals-title">
      <div className="wrap">
        <div className="lhead" data-reveal>
          <div>
            <p className="eyebrow">{verticalsIntro.eyebrow}</p>
            <h2 id="verticals-title" className="lhead__title">{verticalsIntro.title}</h2>
          </div>
          <p className="lhead__body">{verticalsIntro.body}</p>
        </div>
        <ul className="verticals__grid" data-reveal>
          {verticals.map((v) => {
            const { tone, Icon } = VERTICAL_STYLE[v.id];
            return (
              <li key={v.id}>
                <button type="button" className={`vcard card lift vcard--${tone}`} onClick={() => setActive(v.id)} aria-haspopup="dialog">
                  <CardImage name={IMG.vertical[v.id] || 'office'} variant="cover" />
                  <span className={`icotile icotile--${tone}`}><Icon size={22} strokeWidth={2} aria-hidden="true" /></span>
                  <span className="vcard__title">{v.title}</span>
                  <span className="vcard__body">{v.body}</span>
                  <span className="vcard__cta">
                    <span>View Requirements</span>
                    <ArrowRight size={17} strokeWidth={2.25} aria-hidden="true" />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <Modal open={Boolean(current)} onClose={close} labelledBy={current ? `vertical-${current.id}-title` : undefined}>
        {current && <VerticalDetail v={current} />}
      </Modal>
    </section>
  );
}

/* ------------------------------------------------------------------ */

const STEP_TONES = ['sky', 'indigo', 'amber', 'emerald'];

export function Process() {
  return (
    <section id="saifi-how-it-works" className="section process" aria-labelledby="process-title">
      <div className="wrap">
        <SectionHead badge={process.eyebrow} icon={Zap} id="process-title" a={process.titleA} b={process.titleB} body={process.body} />
        <ol className="process__grid" data-reveal>
          {process.steps.map((s, i) => (
            <li key={s.n} className="pstep card lift">
              <CardImage name={IMG.step[i]} variant="cover" />
              <p className={`pstep__n pstep__n--${STEP_TONES[i]}`}>{s.n}</p>
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
        <Star key={i} size={15} strokeWidth={0} fill="currentColor" aria-hidden="true" />
      ))}
    </span>
  );
}

const REVIEW_TONES = ['sky', 'indigo', 'emerald'];

export function Reviews() {
  return (
    <section className="section reviews" aria-labelledby="reviews-title">
      <div className="wrap">
        <SectionHead
          badge={reviewsIntro.eyebrow}
          icon={Star}
          tone="amber"
          id="reviews-title"
          a={reviewsIntro.titleA}
          b={reviewsIntro.titleB}
          body={reviewsIntro.body}
        />
        <ul className="reviews__grid" data-reveal>
          {reviews.map((r, i) => (
            <li key={r.name} className="review card lift">
              <figure>
                <div className="review__top">
                  <Stars />
                  <span className="review__verified"><BadgeCheck size={13} strokeWidth={2.5} aria-hidden="true" />Verified Client</span>
                </div>
                <blockquote>
                  <p>“{r.quote}”</p>
                </blockquote>
                <figcaption>
                  <span className={`review__initials review__initials--${REVIEW_TONES[i % 3]}`} aria-hidden="true">{r.initials}</span>
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

const PLAN_STYLE = {
  salaried: { tone: 'sky', Icon: UserRound },
  business: { tone: 'sky', Icon: Laptop },
  'gst-msme': { tone: 'emerald', Icon: Store },
  'gst-returns': { tone: 'indigo', Icon: ShieldCheck },
};

export function PlanCard({ plan }) {
  const { tone, Icon } = PLAN_STYLE[plan.id] || { tone: 'sky', Icon: Layers };
  return (
    <article className={`plan card plan--${tone}${plan.featured ? ' plan--featured' : ''}`}>
      {plan.featured && <p className="plan__flag">{plan.featured}</p>}
      <CardImage name={plan.photo || IMG.plan[plan.id] || 'laptop'} variant="cover" />
      <span className={`icotile icotile--${tone}`}><Icon size={20} strokeWidth={2} aria-hidden="true" /></span>
      <p className="plan__kicker">{plan.kicker}</p>
      <h3 className="plan__title">{plan.title}</h3>
      <p className="plan__body">{plan.body}</p>
      <ul className="plan__list">
        {plan.list.map((l) => (
          <li key={l}><Check size={15} strokeWidth={2.5} aria-hidden="true" />{l}</li>
        ))}
      </ul>
      <a href={plan.href} className="plan__cta" {...ext}>
        <WhatsAppIcon size={16} />
        <span>{plan.cta}</span>
      </a>
    </article>
  );
}

export function Plans() {
  return (
    <section id="saifi-services-packages" className="section plans" aria-labelledby="plans-title">
      <div className="wrap">
        <SectionHead
          badge={plansIntro.eyebrow}
          icon={Layers}
          tone="emerald"
          id="plans-title"
          a={plansIntro.titleA}
          b={plansIntro.titleB}
          body={plansIntro.body}
        />
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

const NOTICE_TONES = { s139: 'rose', s143: 'amber', ais: 'sky', gst: 'indigo' };

export function NoticeCard({ n }) {
  return (
    <article className={`notice has-photo notice--${NOTICE_TONES[n.id] || 'rose'}`}>
      <CardImage name={IMG.notice[n.id] || 'notice'} />
      <p className="notice__section">{n.section}</p>
      <h3 className="notice__title">{n.title}</h3>
      <p className="notice__body">{n.body}</p>
      <a href={n.href} className="notice__cta" {...ext}>
        {n.cta}
        <ArrowRight size={15} strokeWidth={2.25} aria-hidden="true" />
      </a>
    </article>
  );
}

export function NoticeDesk({ headingTag: Tag = 'h2' }) {
  return (
    <section id="saifi-notice-desk" className="section noticed" aria-labelledby="notice-title">
      <div className="wrap">
        <div className="noticed__panel" data-reveal>
          <div className="noticed__head">
            <div className="noticed__intro">
              <p className="badge badge--rose"><ShieldAlert size={13} strokeWidth={2.5} aria-hidden="true" />{noticeDesk.eyebrow}</p>
              <Tag id="notice-title" className="noticed__title">
                {noticeDesk.titleA} <span>{noticeDesk.titleB}</span>
              </Tag>
              <p className="noticed__body">{noticeDesk.body}</p>
            </div>
            <Btn href={noticeDesk.href} tone="stamp">{noticeDesk.cta}</Btn>
          </div>
          <div className="noticed__grid">
            {noticeDesk.items.map((n) => (
              <NoticeCard key={n.id} n={n} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

const LICENCE_STYLE = {
  fssai: { tone: 'emerald', Icon: Utensils },
  trademark: { tone: 'sky', Icon: Copyright },
  iec: { tone: 'amber', Icon: Globe },
  dsc: { tone: 'indigo', Icon: KeyRound },
  reports: { tone: 'rose', Icon: FileText },
  company: { tone: 'sky', Icon: Building2 },
};

export function LicenceRow({ l }) {
  const { tone, Icon } = LICENCE_STYLE[l.id] || { tone: 'sky', Icon: FileText };
  return (
    <article className="licence card lift">
      <CardImage name={IMG.licence[l.id] || 'documents'} variant="cover" />
      <div className="licence__top">
        <span className={`icotile icotile--${tone}`}><Icon size={19} strokeWidth={2} aria-hidden="true" /></span>
        <a href={l.href} className="licence__cta" {...ext}>{licencesIntro.cta}</a>
      </div>
      <h3 className="licence__title">
        <Link to={l.to}>{l.title}</Link>
      </h3>
      <p className="licence__body">{l.body}</p>
    </article>
  );
}

export function Licences() {
  return (
    <section id="saifi-business-licenses" className="section licences" aria-labelledby="licences-title">
      <div className="wrap">
        <SectionHead
          badge={licencesIntro.eyebrow}
          icon={Building2}
          tone="indigo"
          id="licences-title"
          a={licencesIntro.titleA}
          b={licencesIntro.titleB}
          body={licencesIntro.body}
        />
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
        <SectionHead badge={faqIntro.eyebrow} icon={MessageCircleQuestion} id="faq-title" a={faqIntro.titleA} b={faqIntro.titleB} body={faqIntro.body} />
        <div className="faqs__list" data-reveal>
          <FaqList items={faqs} />
          <p className="faqs__more"><TextLink to="/faq/">All answers</TextLink></p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export function GuideCard({ g }) {
  return (
    <Link to={g.path} className={`gcard card lift gcard--${g.slug}`}>
      <CardImage name={g.photo || IMG.guide[g.slug] || 'documents'} variant="cover">
        <span className="gcard__label" aria-hidden="true">{g.cover}</span>
      </CardImage>
      <span className="gcard__inner">
        <span className="gcard__meta">
          <span>{g.tag}</span>
          <span className="gcard__time"><Clock size={13} strokeWidth={2} aria-hidden="true" />{g.readTime}</span>
        </span>
        <span className="gcard__title">{g.cardTitle}</span>
        <span className="gcard__body">{g.cardBody}</span>
        <span className="gcard__cta">
          {g.cardCta}
          <ArrowRight size={15} strokeWidth={2.25} aria-hidden="true" />
        </span>
      </span>
    </Link>
  );
}

/* ------------------------------------------------------------------ */

export function FinalCta() {
  return (
    <section className="final" aria-labelledby="final-title">
      <div className="wrap">
        <div className="final__panel">
          <div>
            <h2 id="final-title" className="final__title">
              Fast. Accurate. <span>100% Digital.</span>
            </h2>
            <p className="final__body">{finalCta.body}</p>
          </div>
          <div className="final__side">
            <Btn href={finalCta.href} tone="white">{finalCta.label}</Btn>
            <ul className="final__contact">
              <li><a href={tel}>{SITE.phoneDisplay}</a></li>
              <li><a href={mailto}>{SITE.email}</a></li>
              <li>{SITE.address.short}</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
