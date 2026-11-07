# Saifi Tax Solutions

Marketing website for Saifi Tax Solutions, Dehradun. Built with React and Vite, then prerendered to static HTML so every page is fully readable by search engines, answer engines and AI crawlers before any JavaScript runs.

Designed and built by [Code Hyphen](https://www.codehyphen.in).

## Commands

| Command | What it does |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Local development server |
| `npm run build` | Production build into `dist/site` |
| `npm run preview` | Serve the production build at `localhost:4173` |
| `npm run verify` | Release checks against `dist/site` (see below) |
| `npm run og` | Regenerate favicons and social images (needs a local Chrome) |

## Deploying

Configured for Vercel through `vercel.json`: build command `npm run build`, output directory `dist/site`. Import the repository in Vercel and the settings are picked up automatically.

`vercel.json` also redirects the old article URLs (`/itr-basics.html` and others) to their new addresses with 301s, enforces trailing slashes, and sets caching and security headers.

Do not add a catch-all rewrite to `index.html`. Every route is a prerendered file, so refreshing any page already works, and a catch-all would turn real 404s into soft 404s that hurt search rankings. Unknown URLs get `404.html` with a true 404 status.

## Environment variables (optional)

Set these in the Vercel project. Nothing is loaded when they are empty.

| Variable | Purpose |
| --- | --- |
| `VITE_GA_ID` | Google Analytics 4 ID. Calls, WhatsApp clicks and enquiries are sent as `generate_lead` events |
| `VITE_GOOGLE_SITE_VERIFICATION` | Search Console ownership tag |
| `VITE_BING_SITE_VERIFICATION` | Bing Webmaster Tools ownership tag, which also feeds Copilot |

## Where to edit things

| To change | Edit |
| --- | --- |
| Phone, email, address, map pin, opening hours, social profiles, footer credit | `src/content/site.js` |
| Dehradun landing page copy and FAQs | `src/content/local.js` |
| Service names and fees | `src/content/services.raw.json` |
| Service page titles and URLs | `src/content/services.js` |
| Home page copy, plans, reviews, due dates, FAQs, fee schedule | `src/content/home.js` |
| Guide metadata and FAQs | `src/content/guides.js` |
| Guide article body | `src/pages/guideBodies.jsx` |
| Calculator and checker copy | `src/content/tools.js` |
| Titles, descriptions, structured data, llms.txt | `src/seo/meta.js` |
| Colours, type scale, spacing | `src/styles/tokens.css` |

After changing a service name or guide title, run `npm run og` so its social image matches.

## First-visit experience

Once per browser session, visitors see a short logo intro that fills from left to right (`index.html`), then a welcome popup (`src/components/WelcomeModal.jsx`). The intro is plain CSS, so it never waits for JavaScript. The popup renders only on the client, so no indexable content sits behind it. On phones it opens as a bottom sheet, which keeps the page visible above it.

To change the popup's services, edit `CHIPS` in `WelcomeModal.jsx`. To change its timing, edit the delay in the same file.

## Page structure

The home page follows the AIDA model. The sequence is documented in `src/pages/Home.jsx`.

| Stage | Sections | Job |
| --- | --- | --- |
| Attention | Hero, live Compliance Radar, ticker, proof numbers | State the promise and show a real deadline |
| Interest | Setup Engine, Practice Verticals, Service Index | Answer "what applies to me?" |
| Desire | Process, Reviews, Compliance Plans, ITR Checker, Presumptive Estimator | Show it is painless, trusted and worth money |
| Action | Notice Desk, Due Dates, Licences, FAQ, Knowledge Hub, final call to action | Give urgent triggers, remove objections, make one clear ask |

## Search, answer and generative engine optimisation

- **Indexable pages.** 30 static URLs. The old JavaScript pop-ups (fee schedule, tools, service details) are now real pages.
- **Structured data.** Each page carries a JSON-LD graph generated from the same content shown on screen: `AccountingService`, `WebSite`, `WebPage`, `Service` with `OfferCatalog` prices, `Article`, `FAQPage`, `HowTo`, `WebApplication`, `BreadcrumbList`.
- **Answer engines.** Direct answers near the top of content pages, real tables, and FAQs that exist in the HTML even while collapsed.
- **Generative engines.** `llms.txt`, `llms-full.txt` (generated at build), and a `robots.txt` that explicitly welcomes AI crawlers. Business name, address and phone are identical everywhere.
- **Local search.** Dehradun address, service area and geo tags. `aggregateRating` and `Review` markup are left out on purpose, because Google does not accept self-published reviews on a business's own site as rich results.

## Release checks

`npm run verify` compares the build with `legacy-site/` and fails on any of these:

- Text from the original site missing from the new one
- Any of the 122 service fees not matching exactly
- Broken internal links
- Missing, duplicate or overlong titles and descriptions
- A page without exactly one H1, a canonical URL or a social image
- Invalid structured data, or an FAQ in structured data that is not visible on its page

## Repository notes

`legacy-site/` is an untouched copy of the original website, kept as the reference for the content checks. It is not deployed.
