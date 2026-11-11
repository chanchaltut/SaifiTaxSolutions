/**
 * Renders the favicon set, the main social banner and a per-page Open Graph
 * image into public/. Run with `npm run og` after changing titles or branding.
 * Requires a local Chrome. The generated files are committed, so deploys do not.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import { createServer } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = path.join(root, 'public');
const CHROME = process.env.CHROME_PATH || '/usr/bin/google-chrome';

const vite = await createServer({ root, server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
const { categories } = await vite.ssrLoadModule('/src/content/services.js');
const { guides } = await vite.ssrLoadModule('/src/content/guides.js');
const { tools } = await vite.ssrLoadModule('/src/content/tools.js');
await vite.close();

/* ---------- Shared pieces ---------- */

const fontUrl = (file) =>
  `file://${path.join(root, 'node_modules/@fontsource-variable/plus-jakarta-sans/files', file)}`;

const BG = '#070B14';
const SURFACE = '#0D1322';
const ACCENT = '#38BDF8';
const FILL = '#0A6FE0';
const FILL_DEEP = '#0757B3';
const INK = '#04070E';
const SKY_SOFT = '#DCF0FE';
const TEXT = '#F4F7FB';
const TEXT_2 = '#AAB7CC';
const GRAD = 'linear-gradient(92deg,#38BDF8,#BAE6FD 52%,#A5B4FC)';

const baseCss = `
@font-face{font-family:Host;src:url(${fontUrl('plus-jakarta-sans-latin-wght-normal.woff2')});font-weight:200 800}
@font-face{font-family:Host;src:url(${fontUrl('plus-jakarta-sans-latin-ext-wght-normal.woff2')});font-weight:300 800;unicode-range:U+0100-02AF,U+20A0-20C0,U+2113,U+2C60-2C7F}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:100%;height:100%;overflow:hidden;background:${BG}}
body{font-family:Host,sans-serif;color:${TEXT};-webkit-font-smoothing:antialiased}
`;

const markDefs = (id) =>
  `<defs><linearGradient id="${id}" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse"><stop stop-color="#38BDF8"/><stop offset="1" stop-color="#1D4ED8"/></linearGradient></defs>`;
const markBody = (id, glyph = '#FFFFFF') =>
  `<rect width="64" height="64" rx="16" fill="url(#${id})"/><path d="M31 15H13V32H28V49H11M13 15H51M39.5 15V49" fill="none" stroke="${glyph}" stroke-width="6.5" stroke-linejoin="round"/>`;
let markN = 0;
const mark = (size) => {
  markN += 1;
  const id = `mk${markN}`;
  return `
<svg width="${size}" height="${size}" viewBox="0 0 64 64" style="display:block;flex:none">${markDefs(id)}${markBody(id)}</svg>`;
};

const dots = (cols, rows, gap, color, r = 1.6) => {
  let c = '';
  for (let y = 0; y < rows; y += 1) for (let x = 0; x < cols; x += 1) c += `<circle cx="${x * gap + r}" cy="${y * gap + r}" r="${r}"/>`;
  return `<svg width="${(cols - 1) * gap + r * 2}" height="${(rows - 1) * gap + r * 2}" fill="${color}" style="display:block">${c}</svg>`;
};

const ICONS = {
  receipt: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/>',
  percent: '<path d="M19 5 5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
  landmark: '<path d="M3 22h18"/><path d="M6 18v-7"/><path d="M10 18v-7"/><path d="M14 18v-7"/><path d="M18 18v-7"/><path d="m12 2 8 5H4Z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="1"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
};

const icon = (name, size, color, sw = 1.6) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" style="display:block">${ICONS[name]}</svg>`;

/* ---------- Main banner: split composition in midnight navy and sky ---------- */

function banner(W, H) {
  const u = W / 1200;
  const px = (n) => `${Math.round(n * u * 100) / 100}px`;
  const stats = [
    ['500+', 'ITR & GST', 'Filings', 'receipt'],
    ['99.8%', 'Notice-Free', 'Accuracy', 'shield'],
    ['15 Mins', 'Avg. WhatsApp', 'Response', 'clock'],
    ['100%', 'Paperless &', 'Confidential', 'lock'],
  ];
  const services = [
    ['receipt', 'INCOME TAX ADVISORY', 'Tailored tax returns for salaried', 'individuals, consultants and HUFs'],
    ['percent', 'GST COMPLIANCE & FILING', 'Registrations, GSTR-1, 3B, 9 and', 'input tax credit reconciliation'],
    ['landmark', 'MCA & CORPORATE LAW', 'Turnkey legal structuring for', 'companies and firms across India'],
  ];
  /* The split runs down from the top, breaks inward, then returns to the base. */
  const edge = (shift) =>
    `${(636 + shift) * u},0 ${(636 + shift) * u},0 ${(492 + shift) * u},${H * 0.5} ${(620 + shift) * u},${H} ${W},${H} ${W},0`;
  return `<!doctype html><meta charset="utf-8"><style>${baseCss}
  .stage{position:relative;width:${W}px;height:${H}px;background:${BG};overflow:hidden}
  .sheen{position:absolute;inset:0;background:radial-gradient(${px(620)} ${px(380)} at 18% 12%,rgba(56,189,248,.26),transparent 70%),linear-gradient(to right,rgba(255,255,255,.045) 1px,transparent 1px) 0 0/${px(44)} ${px(44)},linear-gradient(to bottom,rgba(255,255,255,.045) 1px,transparent 1px) 0 0/${px(44)} ${px(44)}}
  .shape{position:absolute;inset:0;width:100%;height:100%}
  .left{position:absolute;left:${px(64)};top:${px(62)};width:${px(500)}}
  .brand{display:flex;align-items:center;gap:${px(16)}}
  .name{font-size:${px(47)};font-weight:600;letter-spacing:-.035em;line-height:.98}
  .name span{display:block;width:max-content;background:${GRAD};-webkit-background-clip:text;background-clip:text;color:transparent}
  .rule{display:flex;align-items:center;gap:${px(8)};margin-top:${px(26)}}
  .rule i{display:block;height:${px(3)};width:${px(72)};background:${ACCENT};box-shadow:0 0 ${px(14)} ${ACCENT}}
  .rule b{display:block;height:1px;width:${px(240)};background:rgba(255,255,255,.18)}
  .head{margin-top:${px(22)};font-size:${px(35)};font-weight:500;letter-spacing:-.028em;line-height:1.08}
  .head em{font-style:normal;display:block;width:max-content;background:${GRAD};-webkit-background-clip:text;background-clip:text;color:transparent}
  .lede{margin-top:${px(16)};font-size:${px(18)};line-height:1.38;color:${TEXT_2};width:${px(430)}}
  .strip{position:absolute;left:${px(64)};bottom:${px(58)};width:${px(476)};display:grid;grid-template-columns:repeat(4,1fr);background:${SURFACE};box-shadow:inset 0 0 0 1px rgba(255,255,255,.14);color:#fff;clip-path:polygon(0 0,calc(100% - ${px(20)}) 0,100% ${px(20)},100% 100%,0 100%)}
  .cell{padding:${px(15)} ${px(6)} ${px(14)};display:grid;justify-items:center;text-align:center;border-left:1px solid rgba(255,255,255,.18)}
  .cell:first-child{border-left:0}
  .cell strong{margin-top:${px(7)};font-size:${px(18)};font-weight:500;letter-spacing:-.025em;white-space:nowrap;line-height:1}
  .cell span{margin-top:${px(5)};font-size:${px(10.5)};line-height:1.25;color:${SKY_SOFT};white-space:nowrap}
  .dots-a{position:absolute;left:${px(64)};top:${px(26)};opacity:.55}
  .right{position:absolute;right:${px(58)};top:${px(52)};width:${px(528)}}
  .svc{display:flex;align-items:center;gap:${px(22)};padding-block:${px(19)}}
  .disc{flex:none;width:${px(88)};height:${px(88)};border-radius:50%;background:${ACCENT};box-shadow:0 0 0 ${px(4)} rgba(255,255,255,.92), 0 0 ${px(34)} rgba(56,189,248,.65);display:flex;align-items:center;justify-content:center}
  .bar{flex:none;width:1px;height:${px(66)};background:rgba(255,255,255,.28)}
  .svc h3{font-size:${px(22)};font-weight:600;letter-spacing:-.012em;line-height:1.1;color:#fff}
  .svc p{margin-top:${px(7)};font-size:${px(16)};line-height:1.3;color:${SKY_SOFT}}
  .tag{position:absolute;right:${px(58)};bottom:${px(48)};width:${px(462)};display:flex;gap:${px(14)};padding-top:${px(16)};border-top:1px solid rgba(255,255,255,.22);font-size:${px(17)};font-weight:500;letter-spacing:.005em;color:#fff}
  .tag i{font-style:normal;color:${ACCENT}}
  .dots-b{position:absolute;right:${px(26)};top:${px(26)};opacity:.7}
  .url{position:absolute;left:${px(64)};bottom:${px(24)};font-size:${px(13)};color:#8290A8}
  </style>
  <div class="stage">
    <div class="sheen"></div>
    <svg class="shape" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
      <polygon points="${edge(-14)}" fill="${FILL_DEEP}"/>
      <polygon points="${edge(0)}" fill="${ACCENT}"/>
      <polygon points="${edge(9)}" fill="${FILL}"/>
      <polygon points="${edge(30)}" fill="${SURFACE}"/>
    </svg>
    <div class="dots-a">${dots(12, 2, 11 * u, ACCENT, 1.4 * u)}</div>
    <div class="left">
      <div class="brand">${mark(72 * u)}<div class="name">Saifi Tax<span>Solutions</span></div></div>
      <div class="rule"><i></i><b></b></div>
      <p class="head">Expert Tax &amp; Compliance<br><em>Services Across India</em></p>
      <p class="lede">GST, ITR &amp; TDS filing, Company &amp; MSME registrations, delivered 100% online.</p>
    </div>
    <div class="strip">
      ${stats
        .map(
          ([v, a, b, ic]) =>
            `<div class="cell">${icon(ic, 22 * u, ACCENT, 1.5)}<strong>${v}</strong><span>${a}<br>${b}</span></div>`,
        )
        .join('')}
    </div>
    <div class="url">saifitaxsolutions.site &nbsp;·&nbsp; IT Park, Dehradun</div>
    <div class="dots-b">${dots(6, 6, 12 * u, ACCENT, 1.3 * u)}</div>
    <div class="right">
      ${services
        .map(
          ([ic, t, a, b]) => `<div class="svc">
        <div class="disc">${icon(ic, 40 * u, INK, 1.5)}</div>
        <div class="bar"></div>
        <div><h3>${t.replace('&', '&amp;')}</h3><p>${a}<br>${b}</p></div>
      </div>`,
        )
        .join('')}
    </div>
    <div class="tag"><span>Fast.</span><i>|</i><span>Accurate.</span><i>|</i><span>100% Digital.</span></div>
  </div>`;
}

/* ---------- Per-page Open Graph template ---------- */

function pageCard({ kicker, title, code, foot }) {
  const W = 1200;
  const H = 630;
  const size = title.length > 54 ? 56 : title.length > 34 ? 66 : 80;
  const codeSize = code.length > 5 ? 96 : code.length > 3 ? 132 : 188;
  return `<!doctype html><meta charset="utf-8"><style>${baseCss}
  .stage{position:relative;width:${W}px;height:${H}px;background:radial-gradient(620px 360px at 20% 0%,rgba(56,189,248,.22),transparent 70%),${BG};overflow:hidden}
  .shape{position:absolute;inset:0}
  .brand{position:absolute;left:64px;top:56px;display:flex;align-items:center;gap:14px}
  .name{font-size:30px;font-weight:600;letter-spacing:-.03em}
  .main{position:absolute;left:64px;bottom:60px;width:680px}
  .kicker{font-size:24px;font-weight:500;color:${ACCENT};margin-bottom:18px}
  h1{font-size:${size}px;font-weight:500;line-height:1.02;letter-spacing:-.036em;text-wrap:balance}
  .foot{margin-top:26px;font-size:21px;color:${TEXT_2}}
  .code{position:absolute;right:52px;top:64px;color:#fff;font-size:${codeSize}px;font-weight:400;letter-spacing:-.05em;line-height:.9;text-align:right;max-width:330px}
  .sub{position:absolute;right:56px;bottom:62px;color:${SKY_SOFT};font-size:20px;text-align:right;line-height:1.35}
  </style>
  <div class="stage">
    <svg class="shape" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <polygon points="806,0 ${W},0 ${W},${H} 734,${H}" fill="${ACCENT}"/>
      <polygon points="816,0 ${W},0 ${W},${H} 744,${H}" fill="${FILL}"/>
    </svg>
    <div class="brand">${mark(52)}<div class="name">Saifi Tax Solutions</div></div>
    <div class="main">
      <p class="kicker">${kicker}</p>
      <h1>${title}</h1>
      ${foot ? `<p class="foot">${foot}</p>` : ''}
    </div>
    <div class="code">${code.replace(/ · /g, '<br>').replace(/ \+ /g, '<br>+ ')}</div>
    <div class="sub">Fast. Accurate.<br>100% Digital.</div>
  </div>`;
}

const esc = (s) => s.replace(/&/g, '&amp;');

const cards = [
  ...categories.map((c) => [
    `services-${c.slug}.png`,
    { kicker: 'Saifi Tax Solutions services', title: esc(c.name), code: c.code, foot: esc(c.from) + ' · 100% online across India' },
  ]),
  ...guides.map((g) => [
    `guide-${g.slug}.png`,
    { kicker: esc(g.tag) + ' · ' + g.readTime, title: esc(g.headline), code: esc(g.cover), foot: 'Saifi Knowledge Hub' },
  ]),
  ...tools.map((t) => [
    `tool-${t.id}.png`,
    { kicker: 'Saifi Tools Hub', title: esc(t.title), code: { gst: 'GST', emi: 'EMI', estimator: '44AD', checker: 'ITR' }[t.id], foot: 'Free to use' },
  ]),
  ['tax-consultant-dehradun.png', { kicker: 'IT Park, Sahastradhara Road', title: 'Tax Consultant in Dehradun', code: 'ITR + GST', foot: 'Delivered 100% online across India' }],
  ['fee-schedule.png', { kicker: 'Transparent Service Economics', title: 'Master Fee Schedule', code: '₹', foot: 'Zero hidden retainers.' }],
  ['tools.png', { kicker: 'Saifi Tools Hub', title: 'GST, EMI &amp; Presumptive Tax Calculators', code: '₹', foot: 'Free to use' }],
  ['compliance-calendar.png', { kicker: 'Statutory Compliance Calendar', title: 'GST, TDS &amp; Income Tax Due Dates', code: '7·11·20', foot: 'Every month, on one sheet' }],
  ['notice-desk.png', { kicker: 'Priority Legal &amp; Tax Notice Representation', title: 'Received an Income Tax or GST Notice?', code: '139(9)', foot: 'Confidential expert assessment' }],
  ['knowledge-hub.png', { kicker: 'Tax &amp; Compliance Library', title: 'Saifi Knowledge Hub', code: 'ITR', foot: 'Expert guides and compliance breakdowns' }],
];

/* ---------- Icons ---------- */

const iconPage = (size, opts = {}) => {
  const pad = opts.pad ? Math.round(size * opts.pad) : 0;
  return `<!doctype html><meta charset="utf-8"><style>*{margin:0}html,body{width:${size}px;height:${size}px;overflow:hidden;background:${opts.bg || 'transparent'}}div{padding:${pad}px}</style><div>${mark(size - pad * 2, opts.sheet || ACCENT, opts.glyph || INK)}</div>`;
};

const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${markDefs('g')}${markBody('g')}</svg>\n`;

/** Wraps a PNG in a single-image ICO container. */
function pngToIco(png, size) {
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  header.writeUInt8(size, 6);
  header.writeUInt8(size, 7);
  header.writeUInt16LE(1, 10);
  header.writeUInt16LE(32, 12);
  header.writeUInt32LE(png.length, 14);
  header.writeUInt32LE(22, 18);
  return Buffer.concat([header, png]);
}

/* ---------- Render ---------- */

fs.mkdirSync(path.join(pub, 'og'), { recursive: true });
fs.mkdirSync(path.join(pub, 'icons'), { recursive: true });
fs.writeFileSync(path.join(pub, 'favicon.svg'), faviconSvg);

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--allow-file-access-from-files'] });
const page = await browser.newPage();

const tmp = path.join(root, 'node_modules/.cache-brand.html');
async function shot(html, width, height, out, { transparent = false } = {}) {
  fs.writeFileSync(tmp, html);
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  await page.goto(`file://${tmp}`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: out, omitBackground: transparent, clip: { x: 0, y: 0, width, height } });
}

await shot(banner(1200, 630), 1200, 630, path.join(pub, 'og/saifi-tax-solutions.png'));
await shot(banner(1600, 840), 1600, 840, path.join(pub, 'og/saifi-tax-solutions-banner.png'));

for (const [file, data] of cards) {
  await shot(pageCard(data), 1200, 630, path.join(pub, 'og', file));
}

await shot(iconPage(192), 192, 192, path.join(pub, 'icons/icon-192.png'), { transparent: true });
await shot(iconPage(512), 512, 512, path.join(pub, 'icons/icon-512.png'), { transparent: true });
await shot(iconPage(512, { pad: 0.14, bg: BG }), 512, 512, path.join(pub, 'icons/icon-maskable-512.png'));
await shot(iconPage(180, { pad: 0.12, bg: BG }), 180, 180, path.join(pub, 'apple-touch-icon.png'));
await shot(iconPage(32), 32, 32, path.join(pub, 'icons/icon-32.png'), { transparent: true });
fs.writeFileSync(path.join(pub, 'favicon.ico'), pngToIco(fs.readFileSync(path.join(pub, 'icons/icon-32.png')), 32));
fs.rmSync(path.join(pub, 'icons/icon-32.png'));

await browser.close();
fs.rmSync(tmp, { force: true });
console.log(`Brand assets written: ${cards.length + 2} social images, favicon set.`);
