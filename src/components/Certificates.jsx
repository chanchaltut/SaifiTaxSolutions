import { useCallback, useState } from 'react';
import { Award, BadgeCheck, CalendarClock, Eye, Landmark, Send, ZoomIn } from 'lucide-react';
import Modal from './Modal';
import { Btn, SectionHead } from './ui';
import { certificates, certificatesIntro, hasCertificates } from '../content/certificates';

const altFor = (cert) => `${cert.name} issued to a Saifi Tax Solutions client, personal details hidden`;

function CertificateDetail({ cert }) {
  const titleId = `cert-${cert.id}-title`;
  return (
    <div className="certdetail">
      <a className="certdetail__image" href={cert.image} target="_blank" rel="noopener" title="Open full size">
        <img src={cert.image} alt={altFor(cert)} />
        <span className="certdetail__zoom"><ZoomIn size={15} strokeWidth={2} aria-hidden="true" />Full size</span>
      </a>
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

/** Real certificates the firm has delivered. Renders nothing until images are added. */
export default function Certificates() {
  const [active, setActive] = useState(null);
  const close = useCallback(() => setActive(null), []);
  if (!hasCertificates) return null;
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
                  <img src={c.image} alt={altFor(c)} loading="lazy" decoding="async" />
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
