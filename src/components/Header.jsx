import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from '../lib/router';
import { ChevronDown, Menu, X, Phone, MapPin } from 'lucide-react';
import { Wordmark, WhatsAppIcon } from './brand';
import { ext } from './ui';
import { SITE, tel } from '../content/site';
import { statutoryAlert, talkToExpert } from '../content/home';
import { categories, SERVICE_META_LINE } from '../content/services';

const NAV = [
  { to: '/fee-schedule/', label: 'Fee Schedule' },
  { to: '/tools/', label: 'Saifi Tools' },
  { to: '/compliance-calendar/', label: 'Due Dates' },
  { to: '/notice-desk/', label: 'Notice Desk' },
  { to: '/knowledge-hub/', label: 'Knowledge Hub' },
];

const MORE = [
  { to: '/#wizard', label: 'Setup Engine' },
  { to: '/#saifi-services-packages', label: 'Compliance Plans' },
  { to: '/tools/presumptive-tax-estimator/', label: 'Tax Estimator' },
  { to: '/faq/', label: 'FAQ' },
];

export default function Header() {
  const [mega, setMega] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const megaRef = useRef(null);
  const { pathname, hash } = useLocation();

  useEffect(() => {
    setMega(false);
    setDrawer(false);
  }, [pathname, hash]);

  useEffect(() => {
    document.body.style.overflow = drawer ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
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
            <a href={talkToExpert.href} className="header__wa" aria-label={`${talkToExpert.label} on WhatsApp`} {...ext}>
              <WhatsAppIcon size={16} />
              <span>{talkToExpert.label}</span>
            </a>
            <button
              type="button"
              className="header__burger"
              aria-label={drawer ? 'Close menu' : 'Open menu'}
              aria-expanded={drawer}
              aria-controls="mobile-menu"
              onClick={() => setDrawer((v) => !v)}
            >
              {drawer ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
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
        <div id="mobile-menu" className="drawer" role="dialog" aria-modal="true" aria-label="Menu">
          <nav aria-label="Mobile">
            <ul className="drawer__primary">
              <li><Link to="/services/">Services</Link></li>
              {NAV.map((n) => (
                <li key={n.to}><Link to={n.to}>{n.label}</Link></li>
              ))}
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
            <a href={talkToExpert.href} className="btn btn--blue btn--full" {...ext}>
              <span className="btn__label">{talkToExpert.label}</span>
              <span className="btn__icon"><WhatsAppIcon size={18} /></span>
            </a>
            <a href={tel} className="drawer__tel">{SITE.phoneDisplay}</a>
          </div>
        </div>
      )}
    </>
  );
}
