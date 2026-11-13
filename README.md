# Saifi Tax Solutions

Marketing website for Saifi Tax Solutions, Dehradun, with a website management panel so the firm can change everything on it themselves. The site is built with React and Vite, then prerendered to static HTML so every page is fully readable by search engines, answer engines and AI crawlers before any JavaScript runs.

Designed and built by [Code Hyphen](https://www.codehyphen.in).

```
saifi/
├── client/   The public website (React + Vite, prerendered) and the admin panel at /admin (client/src/admin)
│             Deployed on Vercel with Root Directory = client
├── server/   The website management API (Node.js + Express + MongoDB, photos and PDFs on Cloudinary)
│             Deployed on Render from render.yaml
├── render.yaml
└── package.json   Helper scripts that run the commands inside client/ and server/
```

The built-in content lives in `client/src/content/defaults.json`. The site falls back to it, and `npm run seed` copies it into the database, so the two always match.

## Website management (`/admin`)

The firm's staff manage the website at `https://www.saifitaxsolutions.site/admin`, from a phone or a computer, in plain English:

| Area in the panel | What they can change |
| --- | --- |
| Blog → Articles & guides | Write tax guides and blog posts in a word-processor style editor: headings, bold, lists, links, tables, note boxes and photos. Each article gets its own page, Google title and description, questions & answers, cover photo and WhatsApp box. Drafts stay hidden until published. The four original guides keep their designed layout; their text, questions and buttons are editable |
| Blog → Knowledge Hub page | Heading, article categories (filter buttons), the "Reviewed by" box |
| Services → Services & fees | All 12 categories, every service and fee, Google titles, card photos. New categories get their own page |
| Services → Certificate previews | Upload a real certificate as a photo, scan or PDF. "Hide details" covers names, PAN, GSTIN, QR codes and signatures for good |
| Services → Fee schedule page | The summary price table |
| Home page | Top banner and numbers, questions & answers, client reviews, compliance plans, governance cards, deadlines and due dates, how it works, notice desk, registrations & licences, section headings |
| Pages → Dehradun page | The local landing page |
| Settings → Business details | Phone, WhatsApp number, email, address, map pin, opening hours, Google Business and social profiles, alert bar, moving services strip, welcome pop-up |
| Photo library, Activity log, People & access, Help | Every photo with where it is used, who changed what, owner and editor accounts |

Deliberately not in the panel: layout, colours, fonts, page structure and the calculators' tax logic. Those are design and code, and changing them by accident would break the site.

### Photos

Every upload is checked from its contents (not its name), turned upright, stripped of hidden data (GPS location, camera serials) and saved as **WebP**. The uploader chooses the compression: *High quality* (q90, up to 3200 px), *Balanced* (q82, up to 2560 px, the default) or *Smallest file* (q70, up to 1920 px). Phone photos are also shrunk in the browser before upload, so uploading on mobile data is quick.

**Crops are never baked in.** The original stays on Cloudinary, and the crop and a *focus point* are stored with each use of the photo. On upload the server finds the most interesting spot of the photo (sharp's attention strategy). That spot becomes the automatic focus point, and **Auto crop** fits any chosen shape around it. The admin can still tap their own focus point, use the nine quick positions, and see live previews for wide, card, square and phone frames. The site fills each frame with `object-fit: cover` and keeps the focus point in view. Each screen downloads only the size it needs (`srcset`, `f_auto` on Cloudinary).

**Hide details** draws boxes over parts of a photo and saves a new copy with those parts covered (solid block or heavy pixelation). The covered copy is a different file, so nothing underneath can be recovered from it. The original stays in the photo library until someone deletes it.

### How it works

```
 Admin (/admin) ──saves──▶ API (server/) ──stores──▶ MongoDB (text, settings, photo details)
                              │  └──uploads──▶ Cloudinary (WebP photos, PDFs)
                              │
                              └── ~2 min after the last change: Vercel Deploy Hook
                                               │
 Vercel build: client/scripts/fetch-content.mjs ◀─────┘ reads /api/public/content
             → client/src/generated/content.json → prerendered pages, sitemap, llms.txt
```

* **One file describes every editable thing:** `server/src/content/schemas.js`. The database models, the validation of every save and the admin forms all come from it. The site reads the same fields in `client/src/content/*.js`.
* **Visitors never wait on the API.** Content is baked into static pages at build time. If the API is down, the live site is untouched.
* **The build refuses to publish the wrong content.** If `VITE_API_URL` is set but the API can't be reached (after retries for a sleeping server), the Vercel build stops and the previous version stays live.
* **Without an API** (local development, or before setup) the site builds from `client/src/content/defaults.json`, which is exactly what `npm run seed` puts in the database. The two always match.
* Articles are cleaned on save (`server/src/content/richtext.js`): only safe tags remain, scripts and event handlers are dropped, and pictures pasted from other websites are left out. On publish each article photo gets a `srcset`, headings get anchors for "On this page", and tables scroll on phones.

### Manual setup, once, in this order

| # | Where | What to do | Value you get → where it goes |
|---|-------|-----------|-------------------------------|
| 1 | **MongoDB Atlas** | Free **M0** cluster, region **Mumbai (ap-south-1)**. *Database Access*: user `saifi-admin`, strong password, *Read and write to any database*. *Network Access*: `0.0.0.0/0` (Render has no fixed IP). *Connect → Drivers*: copy the string, replace `<password>`, add `/saifi` before `?`. | `MONGODB_URI` → Render and your local `server/.env` |
| 2 | **Cloudinary** | *Dashboard* shows Cloud name, API Key, API Secret. Keep *Settings → Security → Strict transformations* **off** (sizes and crops are made on request). Switch **on** *Allow delivery of PDF and ZIP files* (certificate PDFs; new accounts block PDFs). | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` → Render |
| 3 | **Render** | *New → Blueprint* → this repository (`render.yaml`, service `saifi-api`). *Starter* keeps it awake; *Free* works but sleeps after 15 minutes (the first admin load then takes about a minute). `JWT_SECRET` is generated for you. | Render address like `saifi-api.onrender.com` |
| 4 | **Domain DNS** | **CNAME** `api` → `saifi-api.onrender.com`. In Render → *Settings → Custom Domains* add `api.saifitaxsolutions.site`. | API address: `https://api.saifitaxsolutions.site` |
| 5 | **Render → Environment** | `CLIENT_URL` = `https://www.saifitaxsolutions.site` · `CORS_ORIGINS` = `https://saifitaxsolutions.site` (plus any Vercel preview URL you want to test the admin on) · `PUBLIC_URL` = `https://api.saifitaxsolutions.site` | Save → Render redeploys |
| 6 | **Your computer** | `cd server && npm install`, copy `.env.example` to `.env`, paste the **same** `MONGODB_URI` and Cloudinary keys, then `npm run seed` (copies the current website content into the database), `npm run create-admin` (your owner login) and `npm run check` (every line should show ✓). | An owner account for `/admin` |
| 7 | **Vercel** | *Settings → General → Root Directory* = `client`. *Environment Variables*: `VITE_API_URL` = `https://api.saifitaxsolutions.site`. Node.js 22. Redeploy. | The site now builds from the database |
| 8 | **Vercel → Settings → Git → Deploy Hooks** | Create a hook named `content` for branch `main` and copy the URL. | `DEPLOY_HOOK_URL` → Render. Edits now publish by themselves |
| 9 | **The admin panel** | Sign in at `/admin` → *People & access* → *Add a person* for the client (Owner or Editor). Give them the temporary password shown; they choose their own on first sign-in. | The client runs the site |

**Costs:** Atlas M0 free · Cloudinary free plan · Vercel Hobby free · Render Starter $7/month (or free with sleeping).

The API sits on the `api.` subdomain rather than `*.onrender.com` so the sign-in cookie is first-party, which keeps Safari and iPhone sign-ins working.

### Security

* Passwords hashed with scrypt; sessions in an `httpOnly`, `Secure`, `SameSite` cookie. Sessions end on password change, deactivation or "Sign out everywhere".
* Every change must come from the site's own origin (cross-site request forgery guard), with a strict CORS allow-list. Login rate limit and an account lock after 8 wrong passwords. Same message for unknown email and wrong password.
* Owner and Editor roles; temporary passwords must be replaced on first sign-in; there is always at least one owner.
* Every save is validated against `schemas.js`. Unknown fields and `$`/`.` keys are dropped. Links can only be `https://`, `mailto:`, `tel:` or site paths. Article HTML is sanitised on the server.
* Uploads: real image and real PDF checks, SVG refused, pixel-bomb limit, size limits, small batches.
* If two people edit the same thing, the older save is stopped instead of silently overwriting.
* Built-in pages keep their web address (services, the original guides), so links and Google rankings never break. Photos still in use (including inside articles) can't be deleted. "Hide" is offered everywhere as the safe alternative to delete.
* Activity log of who changed what (kept one year). `noindex` on `/admin`.

## Commands

From the repository root (each one runs inside `client/` or `server/`):

| Command | What it does |
| --- | --- |
| `npm run install:all` | Install the website's and the API's dependencies |
| `npm run dev:client` | Website and admin with live reload at `localhost:5173` (admin at `/admin`); `/api` goes to `localhost:4000`. Uses the local API's content when it is running, otherwise the built-in content |
| `npm run dev:server` | The API with live reload at `localhost:4000` (needs `server/.env`) |
| `npm run build` | Reads the published content (if `VITE_API_URL` is set), then the production build into `client/dist/site` |
| `npm run verify` | Release checks against `client/dist/site` (see below) |
| `npm test` | 28 end-to-end API tests on an in-memory MongoDB |
| `npm run seed` | Fill an **empty** database with the built-in content (`npm --prefix server run seed -- --force` wipes content and starts again; people and photos are kept) |
| `npm run create-admin` | Create an owner account |
| `npm run check` | Check the database, Cloudinary keys and settings; prints ✓ / ✖ |

Inside `client/`: `npm run preview` serves the production build at `localhost:4173`, `npm run og` regenerates favicons and social images (needs a local Chrome), and `npm run indexnow` asks Bing and other IndexNow engines to recrawl every page after a production deploy.
Inside `server/`: `npm run reset-password -- --email someone@example.com` sets a new password for an account and unlocks it.

Locally, leave Cloudinary empty in `server/.env` and photos are stored in `server/uploads` and resized by the API itself.

## Deploying

Configured for Vercel through `client/vercel.json`: build command `npm run build`, output directory `dist/site`. Import the repository in Vercel, set *Root Directory* to `client`, and the rest is picked up automatically. The API deploys to Render from `render.yaml`.

`client/vercel.json` also redirects the old article URLs (`/itr-basics.html` and others) to their new addresses with 301s, enforces trailing slashes, serves the admin panel for every `/admin/...` address, and sets caching and security headers (`noindex` on `/admin`).

Do not add a catch-all rewrite to `index.html`. Every route is a prerendered file, so refreshing any page already works, and a catch-all would turn real 404s into soft 404s that hurt search rankings. Unknown URLs get `404.html` with a true 404 status.

## Environment variables (website, set in Vercel)

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | The API address. The admin panel talks to it, and the build reads the published content from it. Empty = built-in content |
| `CONTENT_API_URL` | Optional: a different address for the build to read content from |
| `VITE_GA_ID` | Google Analytics 4 ID. Calls, WhatsApp clicks and enquiries are sent as `generate_lead` events |
| `VITE_GOOGLE_SITE_VERIFICATION` | Search Console ownership tag |
| `VITE_BING_SITE_VERIFICATION` | Bing Webmaster Tools ownership tag, which also feeds Copilot |

The API's settings are listed in `server/.env.example`.

## Where things live in the code

| To change | Edit |
| --- | --- |
| Anything the admin panel offers | The admin panel. Its fields are defined in `server/src/content/schemas.js` |
| Built-in content (seed and fallback) | `client/src/content/defaults.json` |
| How the site reads the content | `client/src/content/*.js` (`data.js` picks the published content or the built-in one) |
| Which guides, due dates and plans each built-in service page links to | `LINKS` in `client/src/content/services.js` |
| Original guide layouts | `client/src/pages/guideBodies.jsx` |
| Calculator and checker copy and logic | `client/src/content/tools.js`, `client/src/components/Tools.jsx` |
| Card photos used when nothing is uploaded | `client/src/content/cardImages.js`; files in `client/src/assets/cards/` |
| Titles, descriptions, structured data, llms.txt | `client/src/seo/meta.js` |
| Colours, type scale, spacing | `client/src/styles/tokens.css` |
| Admin panel | `client/src/admin/` (its own bundle through `client/admin.html`) |

### Adding something new to the admin

1. Add the field (or a new section) to `server/src/content/schemas.js`. It appears in the panel, is validated, stored and sent to the site.
2. Read it in the matching `client/src/content/*.js` file and use it in the component.
3. Add its starting value to `client/src/content/defaults.json`, so the seed and the fallback include it.

## First-visit experience

Once per browser session, visitors see a short logo intro that fills from left to right (`client/index.html`), then a welcome popup (`client/src/components/WelcomeModal.jsx`). The intro is plain CSS, so it never waits for JavaScript. The popup renders only on the client, so no indexable content sits behind it.

The popup can be switched off in the admin panel (Business details). To change its services, edit `CHIPS` in `WelcomeModal.jsx`. To change its timing, edit the delay in the same file.

## Page structure

The home page follows the arrangement of the client's original site, in rounded cards with centred section heads. The sequence is documented in `client/src/pages/Home.jsx`.

1. Header: statutory alert bar, then a sticky header with the services marquee on top, the main navigation, a **Knowledge Hub** button and **Talk to Expert**
2. Hero
3. Our Services: search, category pills and an expandable card per category with every fee
4. Compliance Radar: four key deadlines, with the next one flagged live
5. Full-Lifecycle Business Governance: three cards that open a pop-up with required documents and key benefits
6. Certificate Preview: eight certificates, each opening a pop-up with issuer, validity, uses and fee
7. ITR & Tax Checker, Compliance Plans, Reviews, numbers, How It Works
8. Notice Desk, Due Dates, Licences, Presumptive Estimator, FAQ

The Knowledge Hub is reached from the header only, not from the home page.

### Certificate previews

This section shows real certificates the firm has delivered, never made-up samples. They are added in the admin panel (Services → Certificate previews) as a photo, scan or PDF, with "Hide details" to cover personal data. Images placed in `client/src/assets/certificates/`, named after the certificate's id, still work as a fallback:

| id | Certificate |
| --- | --- |
| `gst` | GST Registration Certificate (REG-06) |
| `udyam` | Udyam (MSME) Registration Certificate |
| `itr` | ITR Acknowledgement (ITR-V) |
| `coi` | Certificate of Incorporation |
| `fssai` | FSSAI Registration |
| `tm` | Trademark Registration Certificate |
| `iec` | Import Export Code (IEC) |
| `deed` | Partnership Deed (first page) |

Use `.jpg`, `.png` or `.webp`, about 1200px wide. Before adding an image, hide the client's name, address, PAN, GSTIN, registration numbers, QR codes and signatures, and have the client's permission. Until a certificate has an image, its card shows a topic photo and a "Real sample on request" button that asks for a redacted copy on WhatsApp. The section is always linked from the header, mobile menu and footer. Fees come from the service named in each entry's `service` field.

### Card photos

Cards carry a relevant photo under a dark overlay, either as a header strip or behind the whole card. The photos are WebP files in `client/src/assets/cards/` (about 30 KB each, lazy-loaded). `client/src/content/cardImages.js` maps each card to a photo. To change one, replace the file with another 880 × 550 WebP of the same name, or point the card at a different name. Every current photo is CC0 (free for commercial use, no attribution needed); sources are listed in `client/src/assets/cards/CREDITS.md`.

## Search, answer and generative engine optimisation

- **Indexable pages.** 30 static URLs. The old JavaScript pop-ups (fee schedule, tools, service details) are now real pages.
- **Structured data.** The home page also lists each certificate a registration delivers (issuer, validity, uses, fee) as `ItemList` of `Service`. Each page carries a JSON-LD graph generated from the same content shown on screen: `AccountingService`, `WebSite`, `WebPage`, `Service` with `OfferCatalog` prices, `Article`, `FAQPage`, `HowTo`, `WebApplication`, `BreadcrumbList`.
- **Answer engines.** Direct answers near the top of content pages, real tables, and FAQs that exist in the HTML even while collapsed.
- **Generative engines.** `llms.txt`, `llms-full.txt` (generated at build), and a `robots.txt` that explicitly welcomes AI crawlers. Business name, address and phone are identical everywhere.
- **Fast discovery.** The sitemap lists each page's share image, and `npm run indexnow` pings IndexNow after each deploy (the key file in `client/public/` must stay). Submit `sitemap.xml` in Google Search Console and Bing Webmaster Tools once.
- **Local search.** Dehradun address, service area and geo tags (`geo.position`, `ICBM`). `aggregateRating` and `Review` markup are left out on purpose, because Google does not accept self-published reviews on a business's own site as rich results.

## Release checks

`npm run verify` checks the build and fails on any of these:

- A service or fee from the content that was built (published or built-in) not shown exactly on the services page
- Broken internal links
- Missing, duplicate or overlong titles and descriptions
- A page without exactly one H1, a canonical URL or a social image
- Invalid structured data, or an FAQ in structured data that is not visible on its page
- Missing sitemap or answer-engine files, or a page without the Code Hyphen credit
