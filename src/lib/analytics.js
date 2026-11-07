/**
 * Counts leads: every call, WhatsApp and email click, plus enquiry form sends.
 * Google Analytics loads only when VITE_GA_ID is set, and only after the page is idle.
 */
const GA_ID = import.meta.env.VITE_GA_ID;

export function trackLead(method, label) {
  window.dataLayer = window.dataLayer || [];
  const detail = { method, label, page_path: window.location.pathname };
  if (typeof window.gtag === 'function') window.gtag('event', 'generate_lead', detail);
  else window.dataLayer.push({ event: 'generate_lead', ...detail });
}

const methodFor = (href) => {
  if (href.includes('wa.me/')) return 'whatsapp';
  if (href.startsWith('tel:')) return 'phone';
  if (href.startsWith('mailto:')) return 'email';
  return null;
};

function loadGoogleAnalytics() {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID);
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
  document.head.appendChild(script);
}

export function initAnalytics() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest && e.target.closest('a[href]');
    if (!link) return;
    const method = methodFor(link.getAttribute('href'));
    if (method) trackLead(method, link.innerText.trim().slice(0, 80));
  });

  if (!GA_ID) return;
  if ('requestIdleCallback' in window) window.requestIdleCallback(loadGoogleAnalytics, { timeout: 4000 });
  else window.setTimeout(loadGoogleAnalytics, 2000);
}
