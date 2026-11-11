/**
 * Saves what the client has published in the admin panel into the build.
 * Runs first in `npm run build` (and quietly before `npm run dev`).
 *
 *   CONTENT_API_URL (or VITE_API_URL) not set → built-in content (src/content/defaults.json)
 *   API answers                               → saved to src/generated/content.json
 *   API set but unreachable                   → the build STOPS on purpose, so Vercel keeps
 *                                                the current live site instead of publishing
 *                                                the built-in content over the client's edits
 *
 * --soft (used by `npm run dev`) never stops. With no API configured it looks for the API on this
 * computer (localhost:4000) and otherwise uses the built-in content.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(root, 'src/generated/content.json');
const soft = process.argv.includes('--soft');
const CONFIGURED = (process.env.CONTENT_API_URL || process.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
const API = CONFIGURED || (soft ? 'http://localhost:4000' : '');

fs.mkdirSync(path.dirname(OUT), { recursive: true });
const write = (data) => fs.writeFileSync(OUT, `${JSON.stringify(data)}\n`);
const wait = (ms) => new Promise((r) => { setTimeout(r, ms); });

/** The bundle must look like content before it replaces anything. */
function check(b) {
  const problems = [];
  if (!b || typeof b !== 'object') return ['not an object'];
  if (!b.singles || !b.lists) problems.push('missing singles or lists');
  for (const k of ['services', 'articles', 'faqs', 'certificates']) if (!Array.isArray(b.lists?.[k])) problems.push(`missing list "${k}"`);
  if (Array.isArray(b.lists?.services) && b.lists.services.length === 0) problems.push('no services published');
  if (!b.singles?.settings?.phone) problems.push('business details missing');
  return problems;
}

async function fetchBundle() {
  // Free hosting can take up to a minute to wake, so try a few times.
  let lastError;
  for (let attempt = 1; attempt <= (soft ? 1 : 6); attempt++) {
    try {
      const res = await fetch(`${API}/api/public/content`, { signal: AbortSignal.timeout(soft ? 4000 : 45_000), headers: { accept: 'application/json' } });
      if (!res.ok) throw new Error(`the API answered ${res.status}`);
      return await res.json();
    } catch (err) {
      lastError = err;
      if (!soft) console.warn(`[content] attempt ${attempt} failed: ${err.message}`);
      if (!soft && attempt < 6) await wait(attempt * 5000);
    }
  }
  throw lastError;
}

async function main() {
  if (!API) {
    write(null);
    if (process.env.VERCEL) console.warn('[content] ⚠ CONTENT_API_URL is not set on Vercel: building with the built-in content, not the admin panel’s.');
    else console.log('[content] no API configured: using the built-in content');
    return;
  }
  try {
    const bundle = await fetchBundle();
    const problems = check(bundle);
    if (problems.length) throw new Error(`the content from the API looks wrong (${problems.join('; ')})`);
    write(bundle);
    console.log(`[content] using published content ${bundle.version} (last change ${bundle.updatedAt})`);
  } catch (err) {
    if (soft) {
      if (!CONFIGURED) {
        write(null);
        console.log('[content] no local API running: using the built-in content');
      } else {
        if (!fs.existsSync(OUT)) write(null);
        console.warn(`[content] ${API} not reachable (${err.message}): using the last saved content`);
      }
      return;
    }
    console.error(`[content] ${err.message}. Build stopped so the current live site stays as it is.`);
    process.exit(1);
  }
}

main();
