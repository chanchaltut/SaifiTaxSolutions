import { useCallback, useState } from 'react';
import { Award, BadgeCheck, CalendarClock, Eye, Landmark, Send } from 'lucide-react';
import Modal from './Modal';
import { Btn, SectionHead } from './ui';
import { certificates, certificatesIntro } from '../content/certificates';

/**
 * An illustrative certificate drawn in HTML. Sizes are set in container units,
 * so the same sheet works as a card thumbnail and as the large preview.
 */
export function Paper({ paper, tone }) {
  const { variant, top, title, sub, reg, rows, text, foot, seal } = paper;
  return (
    <div className="paperframe">
      <div className={`paper paper--${variant} paper--${tone}`} aria-hidden="true">
        <div className="paper__wm">Sample</div>
        <div className="paper__head">
          <span className="paper__seal"><span>{seal}</span></span>
          <div className="paper__top">
            {top.map((t, i) => (
              <p key={t} className={i === 0 ? 'paper__gov' : 'paper__dept'}>{t}</p>
            ))}
          </div>
        </div>
        <p className="paper__title">{title}</p>
        {sub && <p className="paper__sub">{sub}</p>}
        {reg && (
          <p className="paper__reg">
            <span>{reg[0]}</span>
            <strong>{reg[1]}</strong>
          </p>
        )}
        {text && <p className="paper__text">{text}</p>}
        <dl className="paper__rows">
          {rows.map(([k, v], i) => (
            <div key={k}>
              <dt>{variant === 'form' ? `${i + 1}. ` : ''}{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <div className="paper__foot">
          <span className="paper__sign">
            <i />
            {foot}
          </span>
          <span className="paper__qr" />
        </div>
      </div>
    </div>
  );
}

function CertificateDetail({ cert }) {
  const titleId = `cert-${cert.id}-title`;
  return (
    <div className="certdetail">
      <div className="certdetail__paper">
        <Paper paper={cert.paper} tone={cert.tone} />
      </div>
      <div className="certdetail__info">
        <p className={`badge${cert.tone === 'sky' ? '' : ` badge--${cert.tone}`}`}>{cert.form}</p>
        <h3 id={titleId} className="certdetail__title">{cert.name}</h3>
        <dl className="certdetail__facts">
          <div>
            <dt><Landmark size={15} strokeWidth={2} aria-hidden="true" />Issued by</dt>
            <dd>{cert.issuer}</dd>
          </div>
          <div>
            <dt><CalendarClock size={15} strokeWidth={2} aria-hidden="true" />Validity</dt>
            <dd>{cert.validity}</dd>
          </div>
          <div>
            <dt><Send size={15} strokeWidth={2} aria-hidden="true" />Delivered as</dt>
            <dd>{certificatesIntro.delivered}</dd>
          </div>
        </dl>
        <p className="certdetail__label">What it is used for</p>
        <ul className="certdetail__uses">
          {cert.usedFor.map((u) => (
            <li key={u}><BadgeCheck size={16} strokeWidth={2} aria-hidden="true" />{u}</li>
          ))}
        </ul>
        {cert.price && <p className="certdetail__price">{cert.price}</p>}
        <Btn href={cert.href} tone="wa" className="btn--full">{cert.cta}</Btn>
        <p className="certdetail__note">{certificatesIntro.note}</p>
      </div>
    </div>
  );
}

export default function Certificates() {
  const [active, setActive] = useState(null);
  const close = useCallback(() => setActive(null), []);
  const current = certificates.find((c) => c.id === active);

  return (
    <section id="certificates" className="section certs" aria-labelledby="certs-title">
      <div className="wrap">
        <SectionHead
          badge={certificatesIntro.badge}
          icon={Award}
          id="certs-title"
          a={certificatesIntro.titleA}
          b={certificatesIntro.titleB}
          body={certificatesIntro.body}
        />

        <ul className="certs__grid" data-reveal>
          {certificates.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                className={`certcard card lift certcard--${c.tone}`}
                onClick={() => setActive(c.id)}
                aria-haspopup="dialog"
              >
                <span className="certcard__paper">
                  <Paper paper={c.paper} tone={c.tone} />
                  <span className="certcard__zoom"><Eye size={16} strokeWidth={2} aria-hidden="true" />Preview</span>
                </span>
                <span className="certcard__body">
                  <span className="certcard__form">{c.form}</span>
                  <span className="certcard__name">{c.name}</span>
                  {c.price && <span className="certcard__price">{c.price}</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className="certs__note">{certificatesIntro.note}</p>
      </div>

      <Modal open={Boolean(current)} onClose={close} labelledBy={current ? `cert-${current.id}-title` : undefined} size="lg">
        {current && <CertificateDetail cert={current} />}
      </Modal>
    </section>
  );
}
