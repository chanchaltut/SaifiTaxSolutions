import { useEffect, useMemo } from 'react';
import { useLocation } from '../lib/router';
import Header from './Header';
import Footer from './Footer';
import { WhatsAppIcon } from './brand';
import { ext } from './ui';
import { wa } from '../content/site';
import { guides } from '../content/guides';
import { syncHead } from '../seo/head';
import { getMeta } from '../seo/meta';

/** Matches the page-aware WhatsApp greeting of the original site. */
function floatMessage(pathname, title) {
  const guide = guides.find((g) => pathname.includes(g.slug));
  if (guide) return guide.floatMessage;
  if (pathname === '/') {
    return 'Hi Saifi Tax Solutions, I visited your website and need help with Tax / GST compliance.';
  }
  const pageTitle = (title || '').split('|')[0].trim();
  return pageTitle
    ? `Hi Saifi Tax, I was reading '${pageTitle}' on your site and need expert consultation.`
    : 'Hi Saifi Tax Solutions, I visited your website and need help with Tax / GST compliance.';
}

function useScrollManager(pathname, hash) {
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView();
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
}

function useReveal(pathname) {
  useEffect(() => {
    const nodes = document.querySelectorAll('[data-reveal]:not([data-in])');
    if (!('IntersectionObserver' in window)) {
      nodes.forEach((n) => n.setAttribute('data-in', ''));
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.setAttribute('data-in', '');
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.04 },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [pathname]);
}

export default function Layout({ children }) {
  const { pathname, hash } = useLocation();
  const meta = useMemo(() => getMeta(pathname), [pathname]);

  useEffect(() => {
    syncHead(meta);
  }, [meta]);

  useScrollManager(pathname, hash);
  useReveal(pathname);

  return (
    <>
      <a href="#main" className="skip">Skip to main content</a>
      <Header />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <Footer />
      <a
        href={wa(floatMessage(pathname, meta.title))}
        className="wafloat"
        aria-label="Chat with Tax Expert on WhatsApp"
        {...ext}
      >
        <span className="wafloat__label">
          <span className="livedot" aria-hidden="true" />
          Tax Expert Online
        </span>
        <span className="wafloat__btn"><WhatsAppIcon size={26} /></span>
      </a>
    </>
  );
}
