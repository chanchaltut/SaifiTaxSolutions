// End-to-end tests: a real MongoDB (in memory), the real seed script, the real HTTP server.
// Run with:  npm test

import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MongoMemoryServer } from 'mongodb-memory-server';
import sharp from 'sharp';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-test-secret-test-secret-123456';
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.CLOUDINARY_CLOUD_NAME = '';
process.env.DEPLOY_HOOK_URL = '';

const ORIGIN = 'http://localhost:5173';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const run = promisify(execFile);
const DEFAULTS = JSON.parse(fs.readFileSync(path.join(root, '../client/src/content/defaults.json'), 'utf8'));
const OWNER = { email: 'owner@saifi.test', password: 'blue ledger evening 2026' };

let mongo; let server; let base; let mongoose; let User; let hashPassword;

/** Tiny cookie-keeping client. */
function client() {
  let cookie = '';
  const call = async (method, url, body, { origin = ORIGIN, headers = {}, raw = false } = {}) => {
    const h = { ...headers };
    if (origin) h.origin = origin;
    if (cookie) h.cookie = cookie;
    let payload = body;
    if (body && !(body instanceof FormData)) { h['content-type'] = 'application/json'; payload = JSON.stringify(body); }
    const res = await fetch(base + url, { method, headers: h, body: payload, redirect: 'manual' });
    const set = res.headers.getSetCookie?.() || [];
    set.forEach((c) => {
      const [pair] = c.split(';');
      if (pair.startsWith('saifi_admin=')) cookie = pair.endsWith('=') ? '' : pair;
    });
    if (raw) return res;
    const text = await res.text();
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch { json = text; }
    return { status: res.status, body: json, headers: res.headers };
  };
  return {
    get: (u, o) => call('GET', u, undefined, o),
    post: (u, b, o) => call('POST', u, b, o),
    put: (u, b, o) => call('PUT', u, b, o),
    patch: (u, b, o) => call('PATCH', u, b, o),
    del: (u, o) => call('DELETE', u, undefined, o),
    hasCookie: () => Boolean(cookie),
  };
}

/** Local-storage photo URLs name the default port; point them at the test server. */
const local = (url, w) => url.replace('{w}', String(w)).replace(/^https?:\/\/[^/]+/, base);

/** A photo with a bright subject in the lower right, and EXIF that must be removed. */
async function jpeg(width, height) {
  const r = Math.round(Math.min(width, height) / 6);
  return sharp({ create: { width, height, channels: 3, background: { r: 236, g: 240, b: 245 } } })
    .composite([{ input: Buffer.from(`<svg width="${width}" height="${height}"><circle cx="${width * 0.78}" cy="${height * 0.72}" r="${r}" fill="#e11d48"/></svg>`) }])
    .jpeg({ quality: 95 }).withMetadata({ exif: { IFD0: { Copyright: 'test', Artist: 'GPS-should-be-removed' } } }).toBuffer();
}

async function upload(c, buffers, { quality } = {}) {
  const form = new FormData();
  if (quality) form.append('quality', quality);
  buffers.forEach(([buf, name, type = 'image/jpeg']) => form.append('files', new Blob([buf], { type }), name));
  return c.post('/api/admin/media', form);
}

const content = async () => (await client().get('/api/public/content', { origin: null })).body;

before(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri();

  // The real seed script, as the developer will run it.
  await run(process.execPath, ['src/scripts/seed.js'], { cwd: root, env: { ...process.env, NODE_ENV: 'development' } });

  const db = await import('../src/db.js');
  await db.connectDb(mongo.getUri());
  mongoose = (await import('mongoose')).default;
  User = (await import('../src/models/User.js')).default;
  ({ hashPassword } = await import('../src/services/passwords.js'));
  for (const name of mongoose.modelNames()) await mongoose.model(name).syncIndexes();
  await User.create({ name: 'Firm Owner', email: OWNER.email, role: 'owner', passwordHash: await hashPassword(OWNER.password) });

  const { createApp } = await import('../src/app.js');
  server = createApp().listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  server?.close();
  await mongoose?.disconnect();
  await mongo?.stop();
});

describe('public website content', () => {
  test('the seeded database gives back exactly the built-in content', async () => {
    const c = client();
    const { status, body, headers } = await c.get('/api/public/content', { origin: null });
    assert.equal(status, 200);
    assert.equal(headers.get('access-control-allow-origin'), '*');
    assert.ok(body.version && body.updatedAt);
    for (const k of Object.keys(DEFAULTS.singles)) assert.ok(body.singles[k], `missing settings page ${k}`);
    for (const [k, items] of Object.entries(DEFAULTS.lists)) assert.equal(body.lists[k].length, items.length, `${k} count`);

    // Every fee survives the trip unchanged.
    const fees = (lists) => lists.services.flatMap((s) => s.items.map((i) => `${i.name}=${i.price}`));
    assert.deepEqual(fees(body.lists), fees(DEFAULTS.lists));
    assert.equal(fees(body.lists).length, 122);
    assert.deepEqual(body.singles.settings.ticker, DEFAULTS.singles.settings.ticker);
    assert.equal(body.lists.articles.filter((a) => a.builtin).length, 4);
    assert.equal(body.lists.faqs.find((f) => f.key === 'online').a.includes('**100% paperless and online**'), true);
    assert.deepEqual(body.singles.deadlines.radar.find((r) => r.key === 'advance').months, 'Mar, Jun, Sep, Dec');

    const again = await c.get('/api/public/content', { origin: null, headers: { 'if-none-match': headers.get('etag') } });
    assert.equal(again.status, 304);
  });

  test('health check', async () => {
    const { status, body } = await client().get('/api/public/health');
    assert.equal(status, 200);
    assert.equal(body.ok, true);
  });
});

describe('signing in and security', () => {
  test('admin API needs a session', async () => {
    assert.equal((await client().get('/api/admin/schema')).status, 401);
    const session = await client().get('/api/auth/session');
    assert.equal(session.status, 200);
    assert.equal(session.body.user, null);
  });

  test('changes from other websites are refused', async () => {
    const c = client();
    assert.equal((await c.post('/api/auth/login', OWNER, { origin: 'https://evil.example' })).status, 403);
    assert.equal((await c.post('/api/auth/login', OWNER, { origin: null })).status, 403);
  });

  test('wrong password gives one vague message; right one signs in', async () => {
    const c = client();
    const bad = await c.post('/api/auth/login', { email: OWNER.email, password: 'nope nope nope' });
    assert.equal(bad.status, 401);
    const unknown = await c.post('/api/auth/login', { email: 'nobody@saifi.test', password: 'nope nope nope' });
    assert.equal(unknown.body.error, bad.body.error);
    const ok = await c.post('/api/auth/login', { email: ` ${OWNER.email.toUpperCase()} `, password: OWNER.password });
    assert.equal(ok.status, 200);
    assert.ok(c.hasCookie());
    assert.equal(ok.body.user.role, 'owner');
    assert.equal(ok.body.user.passwordHash, undefined);
  });

  test('account locks after repeated wrong passwords', async () => {
    await User.create({ name: 'Locky', email: 'lock@saifi.test', passwordHash: await hashPassword('correct horse battery') });
    const c = client();
    let last;
    for (let i = 0; i < 8; i++) last = await c.post('/api/auth/login', { email: 'lock@saifi.test', password: `wrong-${i}-xxxxx` });
    assert.match(last.body.error, /locked/);
    assert.equal((await c.post('/api/auth/login', { email: 'lock@saifi.test', password: 'correct horse battery' })).status, 429);
  });

  test('"$" keys in a request are stripped', async () => {
    const r = await client().post('/api/auth/login', { email: { $ne: '' }, password: { $ne: '' } });
    assert.equal(r.status, 400);
  });
});

describe('content editing', () => {
  const c = client();
  let photo;

  before(async () => {
    await c.post('/api/auth/login', OWNER);
  });

  test('schema lists every section with plain labels and compression choices', async () => {
    const { status, body } = await c.get('/api/admin/schema');
    assert.equal(status, 200);
    assert.ok(body.collections.find((x) => x.key === 'articles').fields.find((f) => f.type === 'richtext'));
    assert.ok(body.singles.find((s) => s.key === 'settings'));
    assert.deepEqual(Object.keys(body.quality), ['high', 'balanced', 'small']);
  });

  test('options from the content: every service with its fee, and article categories', async () => {
    const { body } = await c.get('/api/admin/sources');
    assert.equal(body.serviceItems.length, 122);
    assert.ok(body.serviceItems.find((o) => o.value === 'New Udyam Registration'));
    assert.deepEqual(body.hubCategories.map((o) => o.value), ['basics', 'forms', 'checklist', 'reconciliation']);
  });

  test('photo upload: shrunk, cleaned, WebP, with an automatic focus point', async () => {
    const big = await jpeg(4000, 3000);
    const r = await upload(c, [[big, 'IMG_2041.JPG']]);
    assert.equal(r.status, 201, JSON.stringify(r.body));
    [photo] = r.body.items;
    assert.equal(photo.width, 2560);
    assert.equal(photo.height, 1920);
    assert.ok(photo.bytes < big.length);
    assert.equal(photo.quality, 'balanced');
    assert.match(photo.lqip, /^data:image\/webp;base64,/);
    // The subject sits at 78% across, 72% down.
    assert.ok(Math.abs(photo.auto.x - 78) <= 8 && Math.abs(photo.auto.y - 72) <= 8, JSON.stringify(photo.auto));

    const file = await fetch(local(photo.url, 2560));
    assert.equal(file.headers.get('content-type'), 'image/webp');
    const meta = await sharp(Buffer.from(await file.arrayBuffer())).metadata();
    assert.equal(meta.format, 'webp');
    assert.equal(meta.exif, undefined);
  });

  test('“Smallest file” compression makes a smaller, narrower WebP', async () => {
    const src = await jpeg(3000, 2000);
    const [high, small] = await Promise.all([upload(c, [[src, 'h.jpg']], { quality: 'high' }), upload(c, [[src, 's.jpg']], { quality: 'small' })]);
    assert.equal(high.body.items[0].width, 3000);
    assert.equal(small.body.items[0].width, 1920);
    assert.ok(small.body.items[0].bytes < high.body.items[0].bytes);
    assert.equal(small.body.items[0].quality, 'small');
  });

  test('non-images and fake images are refused with a clear message', async () => {
    const r = await upload(c, [[Buffer.from('<script>alert(1)</script>'), 'cute.jpg']]);
    assert.equal(r.status, 400);
    assert.match(r.body.failed[0].error, /not a photo/i);
    const svg = await upload(c, [[Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"></svg>'), 'logo.svg', 'image/svg+xml']]);
    assert.match(svg.body.failed[0].error, /SVG/);
  });

  test('“Hide details” saves a covered copy and leaves the original alone', async () => {
    const none = await c.post(`/api/admin/media/${photo.id}/redact`, { boxes: [] });
    assert.equal(none.status, 400);
    const r = await c.post(`/api/admin/media/${photo.id}/redact`, { boxes: [{ x: 60, y: 50, w: 35, h: 45 }], style: 'solid' });
    assert.equal(r.status, 201, JSON.stringify(r.body));
    const copy = r.body.item;
    assert.notEqual(copy.id, photo.id);
    assert.equal(copy.redacted, true);
    assert.match(copy.originalName, /\(details hidden\)$/);
    // The red subject under the box is gone in the copy, still there in the original.
    const pixel = async (url) => {
      const buf = Buffer.from(await (await fetch(local(url, 2560))).arrayBuffer());
      const { data, info } = await sharp(buf).removeAlpha().raw().toBuffer({ resolveWithObject: true });
      const i = (Math.round(info.height * 0.72) * info.width + Math.round(info.width * 0.78)) * 3;
      return [data[i], data[i + 1], data[i + 2]];
    };
    const [orig, covered] = await Promise.all([pixel(photo.url), pixel(copy.url)]);
    assert.ok(orig[0] > 180 && orig[1] < 90, `original keeps its red subject ${orig}`);
    assert.ok(covered[0] < 80 && covered[1] < 80, `copy is covered ${covered}`);
  });

  let articleId; let updatedAt;
  test('an article is cleaned on save and made ready for the website', async () => {
    const dirty = [
      '<h1>Old regime or new?</h1>',
      '<p onclick="steal()">Choose <strong>wisely</strong> <a href="javascript:alert(1)">here</a> and <a href="https://incometax.gov.in">here</a>.</p>',
      '<script>alert(1)</script><style>p{}</style>',
      `<p><img src="http://x/a.webp" data-media="${photo.id}" data-crop="10,20,50,40" data-size="medium" alt="Tax slabs"></p>`,
      '<img src="https://other-site.example/pic.png">',
      '<h2>Old regime or new?</h2>',
      '<table><colgroup><col style="min-width:25px"></colgroup><tbody><tr><th colspan="1" rowspan="1"><p>Income</p></th><th><p>Tax</p></th></tr><tr><td><p>₹12 lakh</p></td><td><p>Nil</p></td></tr></tbody></table>',
      '<blockquote><p>Keep Form 16 ready.</p></blockquote>',
    ].join('');
    const r = await c.post('/api/admin/c/articles', {
      title: 'New Tax Regime vs Old Regime in 2026',
      highlight: 'Old Regime in 2026',
      category: 'basics',
      excerpt: 'Which one saves more tax for salaried people this year.',
      date: '2026-11-10T10:00:00+05:30',
      cover: { media: photo.id, focal: { x: 70, y: 60 } },
      body: dirty,
      faqs: [{ q: 'Can I switch every year?', a: 'Salaried people can.' }],
      published: true,
      builtin: 'itr-basics',
    });
    assert.equal(r.status, 201, JSON.stringify(r.body));
    const saved = r.body.item;
    assert.equal(saved.slug, 'new-tax-regime-vs-old-regime-in-2026');
    assert.equal(saved.builtin, undefined, 'built-in ids cannot be set from the panel');
    assert.doesNotMatch(saved.body, /script|onclick|javascript:|style|other-site|<h1/);
    assert.match(saved.body, /<h2>Old regime or new\?<\/h2>/);
    assert.match(saved.body, new RegExp(`data-media="${photo.id}"`));
    assert.match(saved.body, /<a href="https:\/\/incometax\.gov\.in" target="_blank" rel="noopener">here<\/a>/);
    articleId = saved._id;
    updatedAt = saved.updatedAt;

    const a = (await content()).lists.articles.find((x) => x.id === articleId);
    assert.deepEqual(a.body.toc.map((t) => t.id), ['old-regime-or-new', 'old-regime-or-new-2']);
    assert.match(a.body.html, /<figure class="gfig gfig--medium"><img src="[^"]+" srcset="[^"]+480w[^"]*" sizes="[^"]+" width="1280" height="768" alt="Tax slabs"/);
    assert.match(a.body.html, /<div class="gtable"><table>/);
    assert.doesNotMatch(a.body.html, /<p>\s*<figure/);
    assert.ok(a.body.words > 10);
    assert.equal(a.cover.pos, '70% 60%');
  });

  test('article categories must exist; drafts stay off the website', async () => {
    const bad = await c.post('/api/admin/c/articles', { title: 'X', category: 'nope', excerpt: 'x', date: new Date().toISOString(), body: '<p>Hi</p>' });
    assert.equal(bad.status, 400);
    assert.ok(bad.body.details.category);
    const empty = await c.post('/api/admin/c/articles', { title: 'Empty', category: 'forms', excerpt: 'x', date: new Date().toISOString(), body: '<p></p>' });
    assert.equal(empty.body.details.body, 'Please write the article');

    const draft = await c.post('/api/admin/c/articles', { title: 'New Tax Regime vs Old Regime in 2026', category: 'forms', excerpt: 'Draft', date: new Date().toISOString(), body: '<p>Soon</p>', published: false });
    assert.equal(draft.status, 201);
    assert.equal(draft.body.item.slug, 'new-tax-regime-vs-old-regime-in-2026-2');
    assert.ok(!(await content()).lists.articles.some((x) => x.id === draft.body.item._id));
  });

  test('original guides keep their address and may have no body', async () => {
    const list = await c.get('/api/admin/c/articles?limit=50');
    const g = list.body.items.find((x) => x.builtin === 'itr-forms');
    const { body } = await c.get(`/api/admin/c/articles/${g._id}`);
    const put = await c.put(`/api/admin/c/articles/${g._id}`, { ...body.item, _updatedAt: body.item.updatedAt, slug: 'something-else', title: 'Which ITR Form? (edited)', builtin: 'hacked' });
    assert.equal(put.status, 200, JSON.stringify(put.body));
    assert.equal(put.body.item.slug, 'itr-forms');
    assert.equal(put.body.item.builtin, 'itr-forms');
    assert.equal(put.body.item.title, 'Which ITR Form? (edited)');
  });

  test('two people editing: the second, older save is stopped', async () => {
    const first = await c.get(`/api/admin/c/articles/${articleId}`);
    const item = { ...first.body.item, _updatedAt: updatedAt, title: 'Edited once' };
    assert.equal((await c.put(`/api/admin/c/articles/${articleId}`, item)).status, 200);
    const stale = await c.put(`/api/admin/c/articles/${articleId}`, { ...item, title: 'Edited from an old tab' });
    assert.equal(stale.status, 409);
    assert.equal(stale.body.code, 'STALE');
  });

  test('fees change everywhere; built-in service pages keep their address', async () => {
    const list = await c.get('/api/admin/c/services?limit=50');
    const gst = list.body.items.find((s) => s.key === 'gst');
    const { body } = await c.get(`/api/admin/c/services/${gst._id}`);
    const items = body.item.items.map((i) => (i.name === 'New GST Registration — Individual' ? { ...i, price: 'Starting from ₹1,699' } : i));
    const put = await c.put(`/api/admin/c/services/${gst._id}`, { ...body.item, _updatedAt: body.item.updatedAt, items, slug: 'goods-tax', key: 'hack' });
    assert.equal(put.status, 200, JSON.stringify(put.body));
    assert.equal(put.body.item.slug, 'gst');
    assert.equal(put.body.item.key, 'gst');
    const s = (await content()).lists.services.find((x) => x.key === 'gst');
    assert.equal(s.items.find((i) => i.name === 'New GST Registration — Individual').price, 'Starting from ₹1,699');

    const added = await c.post('/api/admin/c/services', { name: 'Startup Registrations', tab: 'Startup', desc: 'DPIIT, Startup India and more.', from: 'Starting from ₹2,999', code: 'SU', seoTitle: 'Startup India Registration', items: [{ name: 'DPIIT Recognition', price: 'Starting from ₹2,999' }], published: true });
    assert.equal(added.status, 201, JSON.stringify(added.body));
    assert.equal(added.body.item.slug, 'startup-registrations');
    const missing = await c.post('/api/admin/c/services', { name: 'Empty', tab: 'E', desc: 'x', from: 'x', code: 'E', seoTitle: 'x', items: [] });
    assert.ok(missing.body.details.items);
  });

  test('certificate previews: photo, or a real PDF only', async () => {
    const list = await c.get('/api/admin/c/certificates?limit=50');
    const gst = list.body.items.find((x) => x.key === 'gst');
    const { body } = await c.get(`/api/admin/c/certificates/${gst._id}`);

    const noPhoto = await c.put(`/api/admin/c/certificates/${gst._id}`, { ...body.item, _updatedAt: body.item.updatedAt, preview: 'image' });
    assert.equal(noPhoto.body.details.image, 'Please choose a photo');

    const fake = new FormData();
    fake.append('file', new Blob([Buffer.from('not really a pdf')], { type: 'application/pdf' }), 'cert.pdf');
    assert.match((await c.post('/api/admin/files', fake)).body.error, /not a PDF/);

    const form = new FormData();
    form.append('file', new Blob([Buffer.from('%PDF-1.4\n1 0 obj << /Type /Page >> endobj\n%%EOF\n', 'latin1')], { type: 'application/pdf' }), 'GST REG-06 redacted.pdf');
    const up = await c.post('/api/admin/files', form);
    assert.equal(up.status, 201, JSON.stringify(up.body));

    const put = await c.put(`/api/admin/c/certificates/${gst._id}`, { ...body.item, _updatedAt: body.item.updatedAt, preview: 'pdf', pdf: { file: up.body.item.id }, image: { media: photo.id } });
    assert.equal(put.status, 200, JSON.stringify(put.body));
    assert.equal(put.body.item.image, undefined, 'the hidden photo field is not stored');

    const cert = (await content()).lists.certificates.find((x) => x.key === 'gst');
    assert.equal(cert.pdf.pages, 1);
    const open = await fetch(local(cert.pdf.url));
    assert.equal(open.headers.get('content-type'), 'application/pdf');
    assert.match((await fetch(local(cert.pdf.download))).headers.get('content-disposition'), /attachment/);
  });

  test('a photo used inside an article can’t be deleted', async () => {
    const blocked = await c.del(`/api/admin/media/${photo.id}`);
    assert.equal(blocked.status, 409);
    assert.ok(blocked.body.details.usedIn.some((u) => u.area === 'articles'));
  });

  test('business details are checked', async () => {
    const { body } = await c.get('/api/admin/s/settings');
    const bad = await c.put('/api/admin/s/settings', { ...body.item, whatsapp: '95489-32631', postal: '2480', hours: [{ from: 'Monday', to: 'Saturday', opens: '25:00', closes: '19:00' }] });
    assert.equal(bad.status, 400);
    assert.ok(bad.body.details.whatsapp && bad.body.details.postal && bad.body.details['hours.0.opens']);
    const ok = await c.put('/api/admin/s/settings', { ...body.item, hours: [{ from: 'Monday', to: 'Saturday', opens: '10:00', closes: '19:00' }], instagram: 'https://instagram.com/saifitax', googleBusiness: 'javascript:alert(1)' });
    assert.equal(ok.status, 400);
    assert.ok(ok.body.details.googleBusiness);
    const fine = await c.put('/api/admin/s/settings', { ...body.item, hours: [{ from: 'Monday', to: 'Saturday', opens: '10:00', closes: '19:00' }], instagram: 'https://instagram.com/saifitax' });
    assert.equal(fine.status, 200, JSON.stringify(fine.body));
    assert.equal((await content()).singles.settings.instagram, 'https://instagram.com/saifitax');
  });

  test('a new article category gets its own id', async () => {
    const { body } = await c.get('/api/admin/s/hub');
    const put = await c.put('/api/admin/s/hub', { ...body.item, categories: [...body.item.categories, { label: 'GST Updates' }] });
    assert.equal(put.status, 200, JSON.stringify(put.body));
    assert.equal(put.body.item.categories.at(-1).key, 'gst-updates');
    const { body: src } = await c.get('/api/admin/sources');
    assert.ok(src.hubCategories.some((o) => o.value === 'gst-updates'));
  });

  test('dashboard summarises everything', async () => {
    const { status, body } = await c.get('/api/admin/dashboard');
    assert.equal(status, 200);
    assert.equal(body.counts.articles, 6);
    assert.equal(body.drafts.length, 1);
    assert.equal(body.certificatesWithout, 7);
    assert.ok(body.recent.length > 0);
    assert.equal(body.website.configured, false);
  });
});

describe('people and permissions', () => {
  const owner = client();
  const editor = client();

  before(async () => {
    await owner.post('/api/auth/login', OWNER);
  });

  test('owner adds an editor with a temporary password', async () => {
    assert.equal((await owner.post('/api/admin/users', { name: 'Ed', email: 'ed@saifi.test', password: '123' })).status, 400);
    const r = await owner.post('/api/admin/users', { name: 'Ed Itor', email: 'ed@saifi.test', role: 'editor', password: 'temporary pass 2026' });
    assert.equal(r.status, 201);
    assert.equal(r.body.item.mustChangePassword, true);
  });

  test('editor must choose a password first, and cannot manage people', async () => {
    await editor.post('/api/auth/login', { email: 'ed@saifi.test', password: 'temporary pass 2026' });
    const blocked = await editor.get('/api/admin/schema');
    assert.equal(blocked.status, 403);
    assert.equal(blocked.body.code, 'PASSWORD_CHANGE_REQUIRED');
    const changed = await editor.post('/api/auth/password', { current: 'temporary pass 2026', next: 'my own secret phrase' });
    assert.equal(changed.status, 200, JSON.stringify(changed.body));
    assert.equal((await editor.get('/api/admin/schema')).status, 200);
    assert.equal((await editor.get('/api/admin/users')).status, 403);
  });

  test('the last owner can’t remove themselves', async () => {
    const me = await owner.get('/api/auth/me');
    assert.equal((await owner.del(`/api/admin/users/${me.body.user.id}`)).status, 400);
  });

  test('switching someone off signs them out immediately', async () => {
    const list = await owner.get('/api/admin/users');
    const ed = list.body.items.find((u) => u.email === 'ed@saifi.test');
    await owner.patch(`/api/admin/users/${ed.id}`, { active: false });
    assert.equal((await editor.get('/api/admin/schema')).status, 401);
  });

  test('sign out clears the session', async () => {
    const c = client();
    await c.post('/api/auth/login', OWNER);
    await c.post('/api/auth/logout', {});
    assert.equal((await c.get('/api/admin/schema')).status, 401);
  });
});
