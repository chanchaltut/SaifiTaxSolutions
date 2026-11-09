/**
 * Tells Bing, Yandex, Seznam and other IndexNow search engines that every page
 * in the sitemap is new or updated, so they recrawl within hours instead of weeks.
 *
 * Run after a production deploy:  npm run indexnow
 * The key file public/d2449e27c7c0df535fdc1079609dd694.txt must stay deployed at the site root.
 */
const SITE = 'https://saifitaxsolutions.site';
const KEY = 'd2449e27c7c0df535fdc1079609dd694';

const sitemap = await fetch(`${SITE}/sitemap.xml`).then((r) => {
  if (!r.ok) throw new Error(`Could not read the live sitemap (HTTP ${r.status}). Deploy first.`);
  return r.text();
});
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).filter((u) => u.startsWith(SITE));

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: new URL(SITE).host, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList }),
});

console.log(`IndexNow: submitted ${urlList.length} URLs, response ${res.status} ${res.statusText}`);
if (res.status >= 400) process.exit(1);
