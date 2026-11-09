import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from '../lib/router';
import { BookOpen, ChevronDown, Menu, X, Phone, MapPin } from 'lucide-react';
import { Wordmark, WhatsAppIcon } from './brand';
import { ext } from './ui';
import { SITE, tel } from '../content/site';
import { statutoryAlert, talkToExpert } from '../content/home';
import { Ticker } from './Hero';
import { categories, SERVICE_META_LINE } from '../content/services';

const NAV = [
  { to: '/compliance-calendar/', label: 'Due Dates' },
  { to: '/fee-schedule/', label: 'Fee Schedule' },
  { to: '/tools/', label: 'Saifi Tools' },
  { to: '/notice-desk/', label: 'Notice Desk' },
];

const HUB = { to: '/knowledge-hub/', label: 'Knowledge Hub' };

const MORE = [
  { to: '/#our-services', label: 'All Services & Fees' },
  { to: '/#certificates', label: 'Certificate Previews' },
  { to: '/#saifi-services-packages', label: 'Compliance Plans' },
  { to: '/tools/presumptive-tax-estimator/', label: 'Tax Estimator' },
  { to: '/faq/', label: 'FAQ' },
];

export default function Header() {
  const [mega, setMega] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const megaRef = useRef(null);
  const drawerRef = useRef(null);
  const closeRef = useRef(null);
  const closeDrawer = () => setDrawer(false);
  const { pathname, hash } = useLocation();

  useEffect(() => {
    setMega(false);
    setDrawer(false);
  }, [pathname, hash]);

  /* While the menu is open: lock page scroll, move focus into it, and keep Tab inside it. */
  useEffect(() => {
    if (!drawer) return undefined;
    const root = document.documentElement;
    const previousFocus = document.activeElement;
    root.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const trapTab = (e) => {
      if (e.key !== 'Tab' || !drawerRef.current) return;
      const items = drawerRef.current.querySelectorAll('a[href], button');
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    const desktop = window.matchMedia('(min-width: 1181px)');
    const onResize = () => { if (desktop.matches) setDrawer(false); };
    window.addEventListener('keydown', trapTab);
    desktop.addEventListener('change', onResize);

    return () => {
      root.style.overflow = '';
      document.body.style.overflow = '';
      window.removeEventListener('keydown', trapTab);
      desktop.removeEventListener('change', onResize);
      if (previousFocus && previousFocus.focus) previousFocus.focus({ preventScroll: true });
    };
  }, [drawer]);

  useEffect(() => {
    if (!mega && !drawer) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setMega(false);
        setDrawer(false);
      }
    };
    const onDown = (e) => {
      if (megaRef.current && !megaRef.current.contains(e.target)) setMega(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onDown);
    };
  }, [mega, drawer]);

  return (
    <>
      <div className="topbar">
        <div className="wrap topbar__row">
          <p className="topbar__alert">
            <span className="livedot" aria-hidden="true" />
            {statutoryAlert}
          </p>
          <ul className="topbar__meta">
            <li>
              <MapPin size={14} strokeWidth={1.75} aria-hidden="true" />
              {SITE.address.short}
            </li>
            <li>
              <Phone size={14} strokeWidth={1.75} aria-hidden="true" />
              <a href={tel}>{SITE.phoneDisplay}</a>
            </li>
          </ul>
        </div>
      </div>

      <header className="header">
        <Ticker />
        <div className="wrap header__row" ref={megaRef}>
          <Link to="/" className="header__logo" aria-label={`${SITE.name} home`}>
            <Wordmark />
          </Link>

          <nav className="nav" aria-label="Primary">
            <button
              type="button"
              className={`nav__link nav__trigger${pathname.startsWith('/services') ? ' is-active' : ''}`}
              aria-expanded={mega}
              aria-controls="mega-services"
              onClick={() => setMega((v) => !v)}
            >
              Services
              <ChevronDown size={15} strokeWidth={1.75} className={mega ? 'is-flipped' : ''} aria-hidden="true" />
            </button>
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} className={({ isActive }) => `nav__link${isActive ? ' is-active' : ''}`}>
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="header__cta">
            <NavLink to={HUB.to} className={({ isActive }) => `header__hub${isActive ? ' is-active' : ''}`}>
              <BookOpen size={16} strokeWidth={2} aria-hidden="true" />
              <span>{HUB.label}</span>
            </NavLink>
            <a href={talkToExpert.href} className="header__wa" aria-label={`${talkToExpert.label} on WhatsApp`} {...ext}>
              <WhatsAppIcon size={16} />
              <span>{talkToExpert.label}</span>
            </a>
            <button
              type="button"
              className="header__burger"
              aria-label="Open menu"
              aria-expanded={drawer}
              aria-controls="mobile-menu"
              onClick={() => setDrawer(true)}
            >
              <Menu size={24} strokeWidth={1.5} />
            </button>
          </div>

          <div id="mega-services" className={`mega${mega ? ' is-open' : ''}`}>
            <div className="mega__intro">
              <p className="mega__title">Complete Professional Services</p>
              <p className="mega__meta">{SERVICE_META_LINE}</p>
              <Link to="/services/" className="tlink">
                <span>Search all services</span>
              </Link>
              <ul className="mega__more">
                {MORE.map((m) => (
                  <li key={m.to}>
                    <Link to={m.to}>{m.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <ul className="mega__list">
              {categories.map((c) => (
                <li key={c.cat}>
                  <Link to={c.path}>
                    <span className="mega__code">{c.code}</span>
                    <span className="mega__name">{c.name}</span>
                    <span className="mega__from">{c.from}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </header>

      {drawer && (
        <div id="mobile-menu" ref={drawerRef} className="drawer" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="drawer__head">
            <Link to="/" className="header__logo" aria-label={`${SITE.name} home`} onClick={closeDrawer}>
              <Wordmark />
            </Link>
            <button type="button" ref={closeRef} className="drawer__close" aria-label="Close menu" onClick={closeDrawer}>
              <X size={24} strokeWidth={1.5} />
            </button>
          </div>
          <nav className="drawer__body" aria-label="Mobile" onClick={(e) => { if (e.target.closest('a')) closeDrawer(); }}>
            <ul className="drawer__primary">
              <li><Link to="/services/">Services</Link></li>
              {NAV.map((n) => (
                <li key={n.to}><Link to={n.to}>{n.label}</Link></li>
              ))}
              <li><Link to={HUB.to} className="drawer__hub"><BookOpen size={20} strokeWidth={2} aria-hidden="true" />{HUB.label}</Link></li>
              <li><Link to="/about/">About</Link></li>
              <li><Link to="/contact/">Contact</Link></li>
            </ul>
            <ul className="drawer__secondary">
              {MORE.map((m) => (
                <li key={m.to}><Link to={m.to}>{m.label}</Link></li>
              ))}
            </ul>
          </nav>
          <div className="drawer__foot">
            <a href={tel} className="drawer__call">
              <Phone size={18} strokeWidth={1.75} aria-hidden="true" />
              <span>{SITE.phoneDisplay}</span>
            </a>
            <a href={talkToExpert.href} className="drawer__wa" {...ext}>
              <WhatsAppIcon size={18} />
              <span>{talkToExpert.label}</span>
            </a>
          </div>
        </div>
      )}
    </>
  );
}
