// ─────────────────────────────────────────────────────────────
// Fills an empty database with the website's current content
// (client/src/content/defaults.json, the same words the site shows without a
// database), so the admin panel starts full.
//
//   npm run seed            → only if the database has no content yet
//   npm run seed -- --force → wipe ALL content and start again
//                             (people, photos and PDFs are kept)
// ─────────────────────────────────────────────────────────────

import fs from 'node:fs';
import mongoose from 'mongoose';
import env from '../config/env.js';
import { connectDb } from '../db.js';
import { contentModel } from '../models/content.js';
import Single from '../models/Single.js';
import { COLLECTION_MAP, SINGLE_MAP } from '../content/schemas.js';
import { validateFields } from '../content/validate.js';
import { args } from './_cli.js';

const D = JSON.parse(fs.readFileSync(new URL('../../../client/src/content/defaults.json', import.meta.url), 'utf8'));
const force = Boolean(args().force);

// The categories and services the content points at, for checking the defaults.
const sources = {
  serviceItems: D.lists.services.flatMap((s) => s.items.map((i) => i.name)),
  hubCategories: D.singles.hub.categories.map((c) => c.key),
};

function clean(label, fields, doc) {
  const { data, errors } = validateFields(fields, doc, { sources });
  if (errors) {
    console.error(`\n✖ Starting content for "${label}" doesn't pass the admin rules:`, errors);
    process.exit(1);
  }
  return data;
}

/** Fill the database. Exported for the tests. */
export async function seed({ wipe = false } = {}) {
  const existing = await Promise.all(Object.keys(COLLECTION_MAP).map((k) => contentModel(k).estimatedDocumentCount()));
  const hasContent = existing.some((n) => n > 0) || (await Single.estimatedDocumentCount()) > 0;
  if (hasContent && !wipe) return { skipped: true };
  if (wipe) await Promise.all([...Object.keys(COLLECTION_MAP).map((k) => contentModel(k).deleteMany({})), Single.deleteMany({})]);

  const report = [];
  for (const [key, data] of Object.entries(D.singles)) {
    const def = SINGLE_MAP[key];
    if (!def) throw new Error(`Unknown settings page in defaults: ${key}`);
    await Single.create({ key, data: clean(def.label, def.fields, data) });
    report.push(def.label);
  }
  for (const [key, docs] of Object.entries(D.lists)) {
    const def = COLLECTION_MAP[key];
    if (!def) throw new Error(`Unknown section in defaults: ${key}`);
    const rows = docs.map((d, i) => ({ ...clean(`${def.label} #${i + 1}`, def.fields, d), order: d.order ?? i }));
    await contentModel(key).insertMany(rows);
    report.push(`${def.label}: ${rows.length}`);
  }
  return { skipped: false, report };
}

const isMain = process.argv[1] && new URL(import.meta.url).pathname === fs.realpathSync(process.argv[1]);
if (isMain) {
  await connectDb(env.MONGODB_URI, { attempts: 2 });
  const result = await seed({ wipe: force });
  if (result.skipped) {
    console.log('\nThe database already has content, so nothing was changed.');
    console.log('To wipe all content and start again from the defaults, run:  npm run seed -- --force\n');
  } else {
    console.log('\nAdded the starting content:');
    result.report.forEach((r) => console.log(`  ✓ ${r}`));
    console.log('\n✓ Done. Next: create your admin account with  npm run create-admin\n');
  }
  await mongoose.disconnect();
}
