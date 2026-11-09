import { useCallback, useState } from 'react';
import { Award, BadgeCheck, CalendarClock, Eye, FileCheck2, Landmark, Send, ZoomIn } from 'lucide-react';
import Modal from './Modal';
import { Btn, CardImage, SectionHead } from './ui';
import { WhatsAppIcon } from './brand';
import { certificates, certificatesIntro } from '../content/certificates';

const altFor = (cert) => `${cert.name} issued to a Saifi Tax Solutions client, personal details hidden`;

/** Shown in place of the certificate until a real, redacted copy is added. */
function SamplePanel({ cert }) {
  return (
    <div className={`certdetail__sample has-photo certcard--${cert.tone}`}>
      <CardImage name={cert.photo} />
      <span className="certdetail__sampleicon"><FileCheck2 size={30} strokeWidth={1.75} aria-hidden="true" /></span>
      <p className="certdetail__sampletitle">{certificatesIntro.sampleLabel}</p>
      <p className="certdetail__sampletext">{certificatesIntro.sampleNote}</p>
      <Btn href={cert.sampleHref} tone="ghost" icon={<WhatsAppIcon size={16} />}>{certificatesIntro.sampleCta}</Btn>
    </div>
  );
}

function CertificateDetail({ cert }) {
  const titleId = `cert-${cert.id}-title`;
  return (
    <div className="certdetail">
      {cert.image ? (
        <a className="certdetail__image" href={cert.image} target="_blank" rel="noopener" title="Open full size">
          <img src={cert.image} alt={altFor(cert)} />
          <span className="certdetail__zoom"><ZoomIn size={15} strokeWidth={2} aria-hidden="true" />Full size</span>
        </a>
      ) : (
        <SamplePanel cert={cert} />
      )}
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
        {cert.image && <p className="certdetail__note">{certificatesIntro.note}</p>}
      </div>
    </div>
  );
}

/** Certificates the firm delivers. Real redacted copies appear as they are added. */
export default function Certificates() {
  const [active, setActive] = useState(null);
  const close = useCallback(() => setActive(null), []);
  const current = certificates.find((c) => c.id === active);
  const anyImage = certificates.some((c) => c.image);

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
                {c.image ? (
                  <span className="certcard__paper">
                    <img src={c.image} alt={altFor(c)} loading="lazy" decoding="async" />
                    <span className="certcard__zoom"><Eye size={16} strokeWidth={2} aria-hidden="true" />Preview</span>
                  </span>
                ) : (
                  <span className="certcard__paper certcard__paper--photo">
                    <CardImage name={c.photo} />
                    <span className="certcard__seal"><FileCheck2 size={26} strokeWidth={1.75} aria-hidden="true" /></span>
                    <span className="certcard__zoom"><Eye size={16} strokeWidth={2} aria-hidden="true" />View details</span>
                  </span>
                )}
                <span className="certcard__body">
                  <span className="certcard__form">{c.form}</span>
                  <span className="certcard__name">{c.name}</span>
                  {c.price && <span className="certcard__price">{c.price}</span>}
                  {!c.image && <span className="certcard__sample">{certificatesIntro.sampleLabel}</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className="certs__note">{anyImage ? certificatesIntro.note : certificatesIntro.sampleNote}</p>
      </div>

      <Modal open={Boolean(current)} onClose={close} labelledBy={current ? `cert-${current.id}-title` : undefined} size="lg">
        {current && <CertificateDetail cert={current} />}
      </Modal>
    </section>
  );
}
