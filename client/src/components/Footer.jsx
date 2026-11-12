import { Link } from '../lib/router';
import { ArrowUpRight } from 'lucide-react';
import { Wordmark } from './brand';
import { ext } from './ui';
import { SITE, tel, mailto } from '../content/site';
import { guides } from '../content/guides';

const CORE = [
  { to: '/services/income-tax-return/', label: 'Income Tax (ITR) Filing' },
  { to: '/services/gst/', label: 'GST Registration & Filing' },
  { to: '/services/incorporation/', label: 'Company Incorporation' },
  { to: '/services/', label: 'All 12 Service Categories' },
  { to: '/tax-consultant-dehradun/', label: 'Tax Consultant in Dehradun' },
];

const ENGINES = [
  { to: '/tools/', label: 'Saifi Tools & Calculators' },
  { to: '/fee-schedule/', label: 'Master Fee Schedule' },
  { to: '/#certificates', label: 'Certificate Previews' },
  { to: '/compliance-calendar/', label: 'Statutory Compliance Calendar' },
  { to: '/notice-desk/', label: 'Notice Defense Desk' },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer__top">
          <div className="footer__brand">
            <Wordmark />
            <p className="footer__name">SAIFI TAX SOLUTIONS</p>
            <p className="footer__blurb">{SITE.blurb}</p>
          </div>

          <nav className="footer__col" aria-label="Core Solutions">
            <h2 className="footer__h">Core Solutions</h2>
            <ul>
              {CORE.map((l) => (
                <li key={l.to}><Link to={l.to}>{l.label}</Link></li>
              ))}
            </ul>
          </nav>

          <nav className="footer__col" aria-label="Interactive Engines">
            <h2 className="footer__h">Interactive Engines</h2>
            <ul>
              {ENGINES.map((l) => (
                <li key={l.to}><Link to={l.to}>{l.label}</Link></li>
              ))}
            </ul>
          </nav>

          <nav className="footer__col" aria-label="Knowledge Hub">
            <h2 className="footer__h">Knowledge Hub</h2>
            <ul>
              {guides.map((g) => (
                <li key={g.slug}><Link to={g.path}>{g.relatedTitle}</Link></li>
              ))}
            </ul>
          </nav>

          <div className="footer__col">
            <h2 className="footer__h">Office Location</h2>
            <address className="footer__addr">
              <a href={SITE.mapUrl} {...ext}>{SITE.address.full}</a>
              <a href={mailto}>{SITE.email}</a>
              <a href={tel}>{SITE.phoneDisplay}</a>
            </address>
            <ul className="footer__mini">
              <li><Link to="/about/">About</Link></li>
              <li><Link to="/faq/">FAQ</Link></li>
              <li><Link to="/contact/">Contact</Link></li>
              {/* A plain link: the admin panel is its own app, not a page of this site. */}
              <li><a href="/admin/" rel="nofollow">Team Login</a></li>
            </ul>
          </div>
        </div>

        <div className="footer__base">
          <p>&copy; 2026 {SITE.name}. All Rights Reserved.</p>
          <a className="footer__credit" href={`${SITE.credit.url}/`} title={`${SITE.credit.name}, website design and development`} {...ext}>
            <span>Designed &amp; built by</span>
            <strong>{SITE.credit.name}</strong>
            <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}
