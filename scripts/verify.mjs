/**
 * Release checks against dist/site:
 *   1. Every sentence from the original site still exists on the new one.
 *   2. Every internal link resolves to a real file.
 *   3. Every page has valid metadata, one H1 and parseable structured data.
 *   4. Each FAQ in structured data is visible on its page.
 * Exits non-zero if anything fails.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const site = path.join(root, 'dist/site');
const legacy = path.join(root, 'legacy-site');

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)],
  );

const decode = (s) =>
  s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&copy;/g, '©')
    .replace(/&ldquo;|&rdquo;/g, '"');

/* Whitespace is ignored so inline markup differences cannot cause false results. */
const norm = (s) =>
  decode(s)
    .replace(/[“”]/g, '"')
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, '')
    .toLowerCase();

/** Visible text fragments of a document, one per text-bearing element. */
function fragments(html) {
  const body = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<head[\s\S]*?<\/head>/i, ' ');
  /* Inline tags are flattened first so one sentence stays one fragment. */
  const flat = body.replace(/<\/?(strong|em|b|i|span|br|a|sup|sub|small|code|u)\b[^>]*>/gi, '');
  return flat
    .split(/<[^>]+>/)
    .map((t) => decode(t).replace(/\s+/g, ' ').trim())
    .filter((t) => t.length > 1 && /[a-z0-9₹]/i.test(t));
}


const htmlFiles = walk(site).filter((f) => f.endsWith('.html'));
const pages = htmlFiles.map((f) => ({ file: f, rel: path.relative(site, f), html: fs.readFileSync(f, 'utf8') }));

/* Interactive states rendered only after input, confirmed in the browser tests. */
const runtimeText = ['src/content', 'src/components', 'src/pages']
  .flatMap((d) => walk(path.join(root, d)))
  .filter((f) => /\.(js|jsx|json)$/.test(f))
  .map((f) => fs.readFileSync(f, 'utf8'))
  .join('\n');

const newCorpus = norm(pages.map((p) => fragments(p.html).join(' ')).join(' '));
const runtimeCorpus = norm(runtimeText.replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/',\s*'/g, ' ').replace(/'\],?\s*\[\s*'/g, ' '));

let failures = 0;
const fail = (msg) => {
  failures += 1;
  console.log(`  FAIL  ${msg}`);
};

/* ---------- 1. Content parity ---------- */

/* Interface chrome of the old build that the new structure replaces by design. */
const INTENTIONAL = [
  /* Old navigation controls for the modal pages and the loading screen. */
  'Back to Dashboard', 'Back to Main Website', 'Back', 'Saifi Tax Engine', 'Saifi Tax Knowledge Base',
  'Master Guide', 'Setup Engine Services Due Dates', 'Setup Engine Services Compliance Plans Tax Estimator Due Dates FAQ',
  /* Placeholders the old scripts always replaced on load, so no visitor could ever see them. */
  'Mandatory Requirements for Professional',
  'ITR-1 / ITR-2 + Full AIS Reconciliation',
  'Based on your profile, we recommend reconciling your Form 26AS and AIS before filing to claim maximum legitimate tax deductions and avoid automated mismatch notices.',
  '50% of your receipts are allowed as presumptive expense deduction! May be tax-free under the New Regime rebate (resident individuals, taxable income up to ₹12L). Eligibility conditions apply.',
  '₹6,00,000',
  /* The Setup Engine ("Automated Discovery") block, removed at the client's request in November 2026. */
  'Automated Discovery',
  'Determine Your Exact Compliance Footprint',
  'Select your enterprise model to identify non-negotiable statutory requirements.',
  'Professional Consultant / Tech',
  'E-Commerce Amazon / D2C',
  'Startup Entity Pvt Ltd / LLP',
  'Trader / Retail Wholesale / Shop',
  '3 items identified',
  'Receive standard document checklist and filing schedules directly. Export Checklist to WhatsApp',
  'Business Setup Discovery',
  /* Empty states shown only after a search with no results; covered by browser tests. */
  'Didn\'t find a guide on " "?',
  'No service found for your search. Message us on WhatsApp and we will help you.',
].map(norm);

/* Copy that exists only in client-side state or was deliberately reworded for display. */
const legacyFiles = fs.readdirSync(legacy).filter((f) => f.endsWith('.html'));
let checked = 0;
const missing = [];
const runtimeOnly = [];

for (const file of legacyFiles) {
  const html = fs.readFileSync(path.join(legacy, file), 'utf8');
  for (const frag of new Set(fragments(html))) {
    const n = norm(frag);
    if (n.length < 3 || INTENTIONAL.includes(n)) continue;
    checked += 1;
    /* FAQ numbering moved out of the question text into its own column. */
    const unnumbered = n.replace(/^\d\./, '');
    if (newCorpus.includes(n) || newCorpus.includes(unnumbered)) continue;
    if (runtimeCorpus.includes(n)) {
      runtimeOnly.push(frag);
      continue;
    }
    missing.push(`${file}: "${frag}"`);
  }
}

console.log(`\n1. Content parity: ${checked} text fragments from the original site`);
console.log(`   ${checked - missing.length - runtimeOnly.length} found in static HTML, ${runtimeOnly.length} in interactive states, ${missing.length} not found`);
missing.forEach((m) => console.log(`   ?  ${m}`));

/* Fees are checked numerically as well, from the original markup. */
const legacyIndex = fs.readFileSync(path.join(legacy, 'index.html'), 'utf8');
const feeRows = [...legacyIndex.matchAll(/<span>([^<]+)<\/span><\/span><span class="svc-rside"><span class="svc-price[^"]*">([^<]+)<\/span>/g)];
let feeMissing = 0;
const servicesPage = pages.find((p) => p.rel === path.join('services', 'index.html'));
for (const [, name, price] of feeRows) {
  const n = norm(name);
  const pr = norm(price);
  const text = norm(fragments(servicesPage.html).join(' '));
  if (!text.includes(`${n}${pr}`)) {
    feeMissing += 1;
    fail(`Fee mismatch: ${decode(name)} = ${decode(price)}`);
  }
}
console.log(`   Fees: ${feeRows.length - feeMissing}/${feeRows.length} service rows match name and price exactly`);

/* ---------- 2. Internal links ---------- */

console.log('\n2. Internal links');
const linkSet = new Set();
for (const p of pages) {
  for (const [, href] of p.html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)) {
    const h = decode(href);
    if (/^(https?:|mailto:|tel:|#)/.test(h)) continue;
    linkSet.add(h);
  }
}
const resolves = (h) => {
  const [pathOnly] = h.split(/[?#]/);
  const target = path.join(site, pathOnly);
  return fs.existsSync(target) && (fs.statSync(target).isFile() || fs.existsSync(path.join(target, 'index.html')));
};
let badLinks = 0;
for (const h of linkSet) {
  if (!resolves(h)) {
    badLinks += 1;
    fail(`Broken link: ${h}`);
  }
  if (!h.split(/[?#]/)[0].endsWith('/')) fail(`Link missing trailing slash: ${h}`);
}
console.log(`   ${linkSet.size} unique internal links, ${badLinks} broken`);

/* ---------- 3. Metadata and structured data ---------- */

console.log('\n3. Per-page metadata and structured data');
const titles = new Map();
const descriptions = new Map();
let schemaNodes = 0;
const types = new Set();
for (const p of pages) {
  const isNotFound = p.rel === '404.html';
  const title = (p.html.match(/<title>([^<]*)<\/title>/) || [])[1];
  const desc = (p.html.match(/<meta name="description" content="([^"]*)"/) || [])[1];
  const canonical = (p.html.match(/<link rel="canonical" href="([^"]*)"/) || [])[1];
  const h1s = (p.html.match(/<h1[\s>]/g) || []).length;
  const ld = (p.html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/) || [])[1];

  if (!title) fail(`${p.rel}: no <title>`);
  if (!desc) fail(`${p.rel}: no meta description`);
  if (!canonical) fail(`${p.rel}: no canonical`);
  if (h1s !== 1) fail(`${p.rel}: ${h1s} H1 elements`);

  if (!isNotFound) {
    const t = decode(title || '');
    const d = decode(desc || '');
    if (t.length > 70) fail(`${p.rel}: title is ${t.length} chars: ${t}`);
    if (d.length < 70 || d.length > 200) fail(`${p.rel}: description is ${d.length} chars`);
    if (titles.has(t)) fail(`Duplicate title on ${p.rel} and ${titles.get(t)}`);
    if (descriptions.has(d)) fail(`Duplicate description on ${p.rel} and ${descriptions.get(d)}`);
    titles.set(t, p.rel);
    descriptions.set(d, p.rel);
    const expected = `https://saifitaxsolutions.site/${p.rel.replace(/index\.html$/, '')}`;
    if (canonical !== expected) fail(`${p.rel}: canonical ${canonical} expected ${expected}`);
    const og = (p.html.match(/<meta property="og:image" content="([^"]*)"/) || [])[1];
    const ogPath = og && path.join(site, og.replace('https://saifitaxsolutions.site', ''));
    if (!ogPath || !fs.existsSync(ogPath)) fail(`${p.rel}: og:image missing on disk: ${og}`);
  }

  try {
    const data = JSON.parse(ld);
    for (const node of data['@graph']) {
      schemaNodes += 1;
      [].concat(node['@type']).forEach((t) => types.add(t));
      if (node['@type'] === 'FAQPage') {
        const visible = norm(fragments(p.html).join(' '));
        for (const q of node.mainEntity) {
          if (!visible.includes(norm(q.name))) fail(`${p.rel}: FAQ question not visible: ${q.name}`);
          if (!visible.includes(norm(q.acceptedAnswer.text))) fail(`${p.rel}: FAQ answer not visible: ${q.acceptedAnswer.text.slice(0, 60)}`);
        }
      }
    }
  } catch (e) {
    fail(`${p.rel}: JSON-LD does not parse: ${e.message}`);
  }
}
console.log(`   ${pages.length} pages, ${titles.size} unique titles, ${descriptions.size} unique descriptions`);
console.log(`   ${schemaNodes} schema nodes. Types: ${[...types].sort().join(', ')}`);

/* ---------- 4. Crawl and AI files ---------- */

console.log('\n4. Crawl and answer-engine files');
const sitemap = fs.readFileSync(path.join(site, 'sitemap.xml'), 'utf8');
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
for (const loc of locs) {
  const f = path.join(site, loc.replace('https://saifitaxsolutions.site', ''), 'index.html');
  if (!fs.existsSync(f)) fail(`Sitemap URL has no page: ${loc}`);
}
for (const f of ['robots.txt', 'llms.txt', 'llms-full.txt', 'favicon.svg', 'favicon.ico', 'apple-touch-icon.png', 'manifest.webmanifest', '404.html']) {
  if (!fs.existsSync(path.join(site, f))) fail(`Missing ${f}`);
}
console.log(`   Sitemap: ${locs.length} URLs. llms.txt ${fs.statSync(path.join(site, 'llms.txt')).size} bytes, llms-full.txt ${fs.statSync(path.join(site, 'llms-full.txt')).size} bytes`);

/* ---------- 5. Credit and tone ---------- */

console.log('\n5. Footer credit');
/* A followed link (no nofollow/sponsored/ugc), so it counts as a backlink for the studio. */
const creditLink = /<a class="footer__credit" href="https:\/\/www\.codehyphen\.in\/?"[^>]*>/;
const creditPages = pages.filter((p) => {
  const tag = p.html.match(creditLink);
  return tag && !/rel="[^"]*(nofollow|sponsored|ugc)/.test(tag[0]) && p.html.includes('Code Hyphen');
});
if (creditPages.length !== pages.length) fail(`Credit on ${creditPages.length}/${pages.length} pages`);
console.log(`   Code Hyphen credit linked on ${creditPages.length}/${pages.length} pages`);

console.log(failures ? `\n${failures} check(s) failed.` : '\nAll checks passed.');
process.exit(failures || missing.length ? 1 : 0);
