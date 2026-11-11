import { useEffect, useRef, useState } from 'react';
import { Building2, Compass, FileText, Percent, Receipt, Scale, Store, X } from 'lucide-react';
import { Link } from '../lib/router';
import { Wordmark, WhatsAppIcon } from './brand';
import { ext } from './ui';
import { hero } from '../content/home';
import { categoryByCat } from '../content/services';
import { SITE, wa } from '../content/site';

const SEEN_KEY = 'saifi_welcome';

const CHIPS = [
  ['gst', 'GST Filing', Receipt],
  ['itr', 'ITR Filing', FileText],
  ['inc', 'Incorporation', Building2],
  ['tds', 'TDS Returns', Percent],
  ['msme', 'MSME / Udyam', Store],
  ['legal', 'Legal Services', Scale],
]
  .filter(([cat]) => categoryByCat(cat))
  .map(([cat, label, Icon]) => ({ path: categoryByCat(cat).path, label, Icon }));

const KEYWORDS = ['GST', 'ITR', 'TDS', 'MSME', 'Trademark', 'FSSAI'];

const readSeen = () => {
  try {
    return Boolean(sessionStorage.getItem(SEEN_KEY));
  } catch {
    return true;
  }
};

const markSeen = () => {
  try {
    sessionStorage.setItem(SEEN_KEY, '1');
  } catch {
    /* Storage can be blocked; the popup simply will not repeat in this page view. */
  }
};

/**
 * Welcome popup, shown once per browser session right after the logo intro.
 * It renders only on the client, so the page's indexable content is never behind it,
 * and it waits if the visitor has already started typing somewhere.
 */
export default function WelcomeModal() {
  const [open, setOpen] = useState(false);
  const sheetRef = useRef(null);

  useEffect(() => {
    if (!SITE.welcome || readSeen()) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = window.setTimeout(() => {
      const tag = document.activeElement && document.activeElement.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
      setOpen(true);
      markSeen();
    }, reduced ? 800 : 2100);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const root = document.documentElement;
    const previousFocus = document.activeElement;
    root.style.overflow = 'hidden';
    sheetRef.current?.focus({ preventScroll: true });

    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
      if (e.key !== 'Tab' || !sheetRef.current) return;
      const items = sheetRef.current.querySelectorAll('a[href], button');
      const first = items[0];
      const last = items[items.length - 1];
      if (document.activeElement === sheetRef.current) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      root.style.overflow = '';
      window.removeEventListener('keydown', onKey);
      if (previousFocus && previousFocus.focus) previousFocus.focus({ preventScroll: true });
    };
  }, [open]);

  if (!open) return null;

  const close = () => setOpen(false);

  return (
    <div className="welcome" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
      <div className="welcome__scrim" onClick={close} aria-hidden="true" />
      <div className="welcome__card" ref={sheetRef} tabIndex={-1}>
        <div className="welcome__strip" aria-hidden="true" />

        <div className="welcome__head">
          <Wordmark />
          <button type="button" className="welcome__close" aria-label="Close" onClick={close}>
            <X size={20} strokeWidth={1.75} />
          </button>
        </div>

        <div className="welcome__body">
          <h2 id="welcome-title" className="welcome__title">
            Welcome to <span>{SITE.name}</span>
          </h2>
          <p className="welcome__sub">{hero.eyebrow}</p>

          <ul className="welcome__chips">
            {CHIPS.map(({ path, label, Icon }) => (
              <li key={path}>
                <Link to={path} onClick={close}>
                  <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                  <span>{label}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="welcome__actions">
            <Link to="/services/" className="welcome__explore" onClick={close}>
              <Compass size={18} strokeWidth={1.75} aria-hidden="true" />
              Explore Services
            </Link>
            <a
              className="welcome__wa"
              href={wa('Hi Saifi Tax Solutions, I would like to know about your services.')}
              onClick={close}
              {...ext}
            >
              <WhatsAppIcon size={18} />
              WhatsApp Us
            </a>
          </div>
        </div>

        <ul className="welcome__keys" aria-label="Key services">
          {KEYWORDS.map((k) => (
            <li key={k}>{k}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
