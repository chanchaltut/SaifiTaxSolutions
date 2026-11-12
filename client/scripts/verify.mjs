/**
 * Release checks against dist/site:
 *   1. Every service and fee in the content that was built is on the services page.
 *   2. Every internal link resolves to a real file.
 *   3. Every page has valid metadata, one H1 and parseable structured data,
 *      and each FAQ in structured data is visible on its page.
 *   4. Sitemap and answer-engine files exist.
 *   5. The Code Hyphen credit is on every page.
 * Exits non-zero if anything fails.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const site = path.join(root, 'dist/site');

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


/* The admin panel (admin.html) is a private app, not a public page. */
const htmlFiles = walk(site).filter((f) => f.endsWith('.html') && path.basename(f) !== 'admin.html');
const pages = htmlFiles.map((f) => ({ file: f, rel: path.relative(site, f), html: fs.readFileSync(f, 'utf8') }));

let failures = 0;
const fail = (msg) => {
  failures += 1;
  console.log(`  FAIL  ${msg}`);
};

/* ---------- 1. Fees ---------- */

/* The content the build used: what the client published, or the built-in content. */
const readJson = (f) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null);
const content = readJson(path.join(root, 'src/generated/content.json')) || readJson(path.join(root, 'src/content/defaults.json'));
const services = content.lists.services.filter((c) => c.published !== false);
const servicesPage = pages.find((p) => p.rel === path.join('services', 'index.html'));
const servicesText = norm(fragments(servicesPage.html).join(' '));
let feeRows = 0;
let feeMissing = 0;
console.log('\n1. Fees');
for (const c of services) {
  for (const item of c.items) {
    feeRows += 1;
    if (!servicesText.includes(`${norm(item.name)}${norm(item.price)}`)) {
      feeMissing += 1;
      fail(`Fee not shown: ${c.name} → ${item.name} = ${item.price}`);
    }
  }
}
console.log(`   ${feeRows - feeMissing}/${feeRows} services shown with their exact fee`);

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
  /* /admin/... is served from admin.html by the host (vercel.json rewrites). */
  if (/^\/admin(\/|$)/.test(pathOnly)) return fs.existsSync(path.join(site, 'admin.html'));
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
process.exit(failures ? 1 : 0);
