/**
 * Turns the client and server builds into a fully static site in dist/site:
 * one real HTML file per route, plus sitemap.xml, llms.txt and llms-full.txt.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { NodeHtmlMarkdown } from 'node-html-markdown';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const client = path.join(root, 'dist/client');
const out = path.join(root, 'dist/site');
const SITE = 'https://saifitaxsolutions.site';

fs.rmSync(out, { recursive: true, force: true });
fs.cpSync(client, out, { recursive: true });

const serverEntry = fs.readdirSync(path.join(root, 'dist/server')).find((f) => /^entry-server\.m?js$/.test(f));
const { render, ROUTES, buildLlms } = await import(pathToFileURL(path.join(root, 'dist/server', serverEntry)).href);

const template = fs.readFileSync(path.join(client, 'index.html'), 'utf8');

/* Preload the Latin subset of the variable font so the headline paints in its final face. */
const fontFile = fs
  .readdirSync(path.join(client, 'assets'))
  .find((f) => /host-grotesk-latin-wght-normal.*\.woff2$/.test(f));
const preload = fontFile
  ? `<link rel="preload" href="/assets/${fontFile}" as="font" type="font/woff2" crossorigin />`
  : '';

const page = (route) => {
  const { html, head } = render(route);
  return template
    .replace('<!--app-head-->', `${preload}\n    ${head}`)
    .replace('<!--app-html-->', html);
};

const writeRoute = (route, body) => {
  const dir = path.join(out, route);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), body);
};

const today = new Date().toISOString().slice(0, 10);
const llmsSections = [];
const nhm = new NodeHtmlMarkdown({ ignore: ['nav', 'script', 'style', 'svg'] });

for (const r of ROUTES) {
  const html = page(r.path);
  writeRoute(r.path, html);
  const main = html.match(/<main[^>]*>([\s\S]*?)<\/main>/);
  if (main) {
    const md = nhm.translate(main[1]).replace(/\n{3,}/g, '\n\n').trim();
    llmsSections.push(`# ${SITE}${r.path}\n\n${md}`);
  }
}

/* A real 404 document, served automatically by Vercel for unknown URLs. */
fs.writeFileSync(path.join(out, '404.html'), page('/page-not-found/'));

/* sitemap.xml */
const urls = ROUTES.map(
  (r) =>
    `  <url>\n    <loc>${SITE}${r.path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority.toFixed(2)}</priority>\n  </url>`,
).join('\n');
fs.writeFileSync(
  path.join(out, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
);

/* llms.txt and its full-text companion */
fs.writeFileSync(path.join(out, 'llms.txt'), buildLlms());
fs.writeFileSync(
  path.join(out, 'llms-full.txt'),
  `# Saifi Tax Solutions: full site text\n\nGenerated ${today}. Source: ${SITE}/\n\n${llmsSections.join('\n\n---\n\n')}\n`,
);

fs.rmSync(path.join(root, 'dist/client'), { recursive: true, force: true });
fs.rmSync(path.join(root, 'dist/server'), { recursive: true, force: true });

console.log(`Prerendered ${ROUTES.length} routes to dist/site`);
