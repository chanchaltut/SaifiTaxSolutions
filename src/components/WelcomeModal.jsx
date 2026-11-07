import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Phone, X } from 'lucide-react';
import { Link } from '../lib/router';
import { Wordmark, WhatsAppIcon } from './brand';
import { ext } from './ui';
import { dueDates, hero } from '../content/home';
import { categoryByCat } from '../content/services';
import { SITE, tel } from '../content/site';
import { ordinal, relativeDays, upcoming } from '../hooks/useStatutory';

const SEEN_KEY = 'saifi_welcome';
const CHIPS = [
  ['gst', 'GST'],
  ['itr', 'ITR'],
  ['inc', 'Incorporation'],
  ['tds', 'TDS'],
  ['msme', 'MSME / Udyam'],
  ['legal', 'Legal'],
].map(([cat, label]) => ({ ...categoryByCat(cat), label }));

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
  const [next, setNext] = useState(null);
  const sheetRef = useRef(null);

  useEffect(() => {
    if (readSeen()) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = window.setTimeout(() => {
      const tag = document.activeElement && document.activeElement.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
      setNext(upcoming(new Date())[0]);
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
  const due = next && dueDates.items.find((d) => d.id === next.item.id);

  return (
    <div className="welcome" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
      <div className="welcome__scrim" onClick={close} aria-hidden="true" />
      <div className="welcome__sheet" ref={sheetRef} tabIndex={-1}>
        <div className="welcome__in">
          <div className="welcome__head">
            <Wordmark />
            <button type="button" className="welcome__close" aria-label="Close" onClick={close}>
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>

          <h2 id="welcome-title" className="welcome__title">
            Welcome to <span>{SITE.name}</span>
          </h2>
          <p className="welcome__sub">{hero.eyebrow}</p>

          {next && (
            <a
              className="welcome__due"
              href={due ? due.href : '/compliance-calendar/'}
              {...(due ? ext : {})}
            >
              <span className="welcome__duedate">{ordinal(next.date.getDate())}</span>
              <span className="welcome__duetext">
                <strong>{next.item.title}</strong>
                <span>{relativeDays(next.days)}</span>
              </span>
              <ArrowRight size={18} strokeWidth={1.75} aria-hidden="true" />
            </a>
          )}

          <ul className="welcome__chips">
            {CHIPS.map((c) => (
              <li key={c.cat}>
                <Link to={c.path} onClick={close}>
                  <strong>{c.label}</strong>
                  <span>{c.from.replace('Starting from', 'From')}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="welcome__actions">
            <a className="welcome__wa" href={hero.primary.href} {...ext} onClick={close}>
              <WhatsAppIcon size={18} />
              {hero.primary.label}
            </a>
            <a className="welcome__call" href={tel} aria-label={`Call ${SITE.phoneDisplay}`} onClick={close}>
              <Phone size={17} strokeWidth={1.75} aria-hidden="true" />
              <span>{SITE.phoneDisplay}</span>
            </a>
          </div>

          <Link to="/services/" className="welcome__all" onClick={close}>
            Explore all 120+ services
          </Link>
        </div>
      </div>
    </div>
  );
}
