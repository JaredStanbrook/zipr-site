# Zipr: SEO audit

**Site:** https://zipr.stanbrook.me

**Date:** 30 September 2026

**How it was done:** the live site was crawled as a search engine receives it
(server HTML, JavaScript off, every internal link plus every sitemap URL). HTTP,
www, trailing-slash, case and parameter variants were probed. The fixes were then
verified on a production build running under Wrangler: the same runtime,
bundling and asset layer as `wrangler deploy`.

**Summary.** The foundations were already sound: every page is server-rendered,
has a self-referencing canonical, sits in the sitemap, and is allowed by
`robots.txt`. The real problems were:

- the same page served at two URLs (HTTP and HTTPS);
- trailing-slash URLs returning 404;
- a blank 404 page;
- no share image anywhere;
- no structured data;
- a home-page title of just "Zipr";
- descriptions that overran the snippet length;
- skipped heading levels;
- assets re-downloaded on every visit;
- staff-only JavaScript shipped to every visitor.

All of these are fixed here. The single biggest remaining problem is not code:
**`/downloads` has no published release**, so every "Download" call to action on
the site ends at "Not quite yet".

---

## 1. Crawl inventory

### Before (live site)

| URL                                                       | Status | Title               | Desc. length | H1                                                 | Canonical    | Indexable               | Words                | Share image | JSON-LD  |
| --------------------------------------------------------- | ------ | ------------------- | ------------ | -------------------------------------------------- | ------------ | ----------------------- | -------------------- | ----------- | -------- |
| `/`                                                       | 200    | Zipr                | **175**      | Turn the steps you keep explaining into one click. | self         | yes                     | 698                  | **none**    | **none** |
| `/features`                                               | 200    | Features · Zipr     | 105          | Build it once. Let anyone run it.                  | self         | yes                     | 739                  | none        | none     |
| `/pricing`                                                | 200    | Pricing · Zipr      | **171**      | Free for you. Paid for your team.                  | self         | yes                     | 877                  | none        | none     |
| `/downloads`                                              | 200    | Downloads · Zipr    | 131          | Install Zipr                                       | self         | yes                     | **172** (no release) | none        | none     |
| `/security`                                               | 200    | Security · Zipr     | **166**      | The short answers your reviewer wants              | self         | yes                     | 317                  | none        | none     |
| `/report`                                                 | 200    | Report a bug · Zipr | 93           | Something broken? Tell us.                         | self         | yes                     | 130                  | none        | none     |
| `/contact`                                                | 200    | Contact · Zipr      | 111          | Talk to a person                                   | self         | yes                     | 170                  | none        | none     |
| `/privacy`                                                | 200    | Privacy · Zipr      | 107          | Privacy notice                                     | self         | yes                     | 838                  | none        | none     |
| `/licence`                                                | 200    | Licence · Zipr      | 94           | Zipr Licence                                       | self         | yes                     | 628                  | none        | none     |
| `/contact?topic=…` (×3)                                   | 200    | Contact · Zipr      | 111          | Talk to a person                                   | → `/contact` | **noindex + canonical** | —                    | none        | none     |
| `/robots.txt`, `/sitemap.xml`, `/third-party-notices.txt` | 200    | —                   | —            | —                                                  | —            | —                       | —                    | —           | —        |

**Status codes:**

| URL                               | Status               | Problem                                                      |
| --------------------------------- | -------------------- | ------------------------------------------------------------ |
| `http://zipr.stanbrook.me/`       | **200**              | Should be a 301 to HTTPS; the whole site was reachable twice |
| `/features/` (any trailing slash) | **404**              | Should be a 301 to `/features`                               |
| `/nope` (any unknown URL)         | 404, **0-byte body** | No page, no links, a dead end                                |
| `/FEATURES`, `/index.html`        | 404                  | Correct; nothing links to them                               |
| `www.zipr.stanbrook.me`           | No DNS               | Correct; no duplicate host                                   |
| `/favicon.ico`                    | 404                  | Harmless; the SVG icon is declared                           |

**Other findings:**

- **Headings:**
  - `/pricing` jumped from H1 to H3 (the plan names).
  - `/downloads` did the same whenever a release is published (the platform cards).
  - Every other page had one H1 and a clean outline.
- **Images:** the only `<img>` elements are the favicon mark next to the word
  "Zipr", correctly `alt=""` with explicit width and height. The hero is drawn in
  HTML and CSS, not an image, so there was nothing to compress or convert. The
  missing piece was the share image.
- **Links:** no broken internal links, and no external links to check. Every
  page is one click from every other (nav plus footer), with descriptive anchor
  text. There are no orphan pages.
- **Crawl noise that is not a site problem:** the crawl also returned about 15
  `/cdn-cgi/content?id=…` pages on unrelated subjects (disk storage, fungicides,
  tribology). That's Cloudflare's **AI Labyrinth**: hidden, `noindex, nofollow`
  decoy links injected only for clients Cloudflare suspects are unverified bots.
  My crawler used a Googlebot user agent from an ordinary IP, so it got them.
  Real, verified Googlebot does not. No action is needed, but if you ever see
  these URLs in a third-party crawler's report, this is why.

### After (production build under Wrangler)

| URL          | Title                                                | Title len. | Desc. len. | H1s | Skipped levels | Share image | JSON-LD                       |
| ------------ | ---------------------------------------------------- | ---------- | ---------- | --- | -------------- | ----------- | ----------------------------- |
| `/`          | Desktop launcher for commands, links and apps · Zipr | 52         | 148        | 1   | 0              | yes         | WebSite + SoftwareApplication |
| `/features`  | Features: step types, sharing and history · Zipr     | 48         | 116        | 1   | 0              | yes         | —                             |
| `/pricing`   | Pricing: free app, team plans from $6 · Zipr         | 44         | 154        | 1   | 0              | yes         | FAQPage                       |
| `/downloads` | Download for Windows and macOS · Zipr                | 37         | 146        | 1   | 0              | yes         | —                             |
| `/security`  | Security and data handling · Zipr                    | 33         | 139        | 1   | 0              | yes         | FAQPage                       |
| `/report`    | Report a bug · Zipr                                  | 19         | 93         | 1   | 0              | yes         | —                             |
| `/contact`   | Contact: team setup, quotes and support · Zipr       | 46         | 125        | 1   | 0              | yes         | —                             |
| `/privacy`   | Privacy notice · Zipr                                | 21         | 107        | 1   | 0              | yes         | —                             |
| `/licence`   | Licence for the desktop app · Zipr                   | 34         | 94         | 1   | 0              | yes         | —                             |

| Variant                        | After                                                                           |
| ------------------------------ | ------------------------------------------------------------------------------- |
| `http://…`                     | 301 → `https://…` (same path and query), plus HSTS                              |
| `/features/`, `/features/?a=1` | 301 → `/features`, `/features?a=1`                                              |
| Unknown URL                    | 404 with a real page (`noindex`, links to Home, Features, Download and Pricing) |
| `/contact?topic=cloud`         | Indexable, with a canonical to `/contact` (no more conflicting `noindex`)       |

---

## 2–4. Titles, descriptions and headings

- **Titles.** The home page said only "Zipr", which tells a searcher who has
  never heard of Zipr nothing. Every title now names what the page is, in words
  a person would search for, in 19–52 characters, and no two are the same. The
  pricing title's figure comes from the pricing data, so it can't drift from
  the page.
- **Descriptions.** Three overran Google's ~155–160-character snippet (175, 171
  and 166). Every description is now unique and 93–154 characters, and says what
  the page contains, with no invented claims.
- **Headings.** The plan names on `/pricing` and the platform cards on
  `/downloads` are now H2 instead of H3. Their styling is unchanged because it
  comes from classes. The footer's column labels stay as H2s: they label
  navigation, and changing them would help nothing.

A test (`tests/seo-site.test.ts`) now fails if any main page gets a duplicate
title, a title over 65 characters, or a description outside 70–160 characters.

## 5. URL structure

The URLs are short, readable and flat: `/features`, `/pricing`, `/downloads`,
`/security`, `/contact`, `/report`, `/privacy`, `/licence`. **None were
changed.** Only the variants now redirect: HTTP → HTTPS, and trailing slash →
none. The two parameters in use (`?topic=` on contact and `?product=` on report)
only highlight part of the page, and both now canonicalise to the bare path.

## 6. Canonicals

Every page already had a self-referencing, absolute HTTPS canonical built from
`ORIGIN`, not the request host. That's correct, and it means a `*.workers.dev`
preview can never compete. The one conflict is fixed: parameter variants had
**both** `noindex` and a canonical. Google advises against combining them,
because `noindex` can win and the consolidation is lost. `/contact` and `/report`
now use the canonical alone. The template's default of `noindex` on query
strings is kept for other routes, because it's right for search-result pages
like `?q=`.

## 7. robots.txt

It's valid and appropriate, so there were no changes. It disallows only
`/login`, `/register`, `/join`, `/admin`, `/dev` and `/api`, blocks no CSS, JS,
images or fonts, and references the sitemap by absolute HTTPS URL. Non-production
environments are served `Disallow: /`.

## 8. Sitemap

It already listed exactly the 9 canonical, indexable pages, all with absolute
HTTPS URLs, and no redirects, 404s or noindexed pages. It's generated from
`STATIC_ROUTES` in `worker/routes/seo.ts`, so it stays current as long as new
pages are added there (the file says so).

**Changed:** `/privacy` and `/licence` now carry `<lastmod>` from their real
version dates. The other pages have no truthful date, so they get none. Google
ignores `lastmod` on sites where it's inaccurate, so stamping the build date on
every URL would do harm.

## 9. Internal linking

The structure is healthy: nav and footer on every page, contextual links from
Home to Features, Pricing and Security, and from Downloads to Features and
Pricing. There are no orphans, and anchors are descriptive, with no "click here".

**Added:** one contextual link where it was missing. `/security` answers "what
data do you hold?" but never pointed to `/privacy`, which lists it exactly. I
didn't add more: every page is already one click from every other.

## 10. Images

- **Share image:** there was none, so every shared link rendered as a bare card.
  **Added** `public/og.png` (1200×630, 192 KB). It's rendered from the site's own
  fonts, colours, logo and headline by `scripts/og-image.mjs`, so it can be
  regenerated when the brand changes. It's the default for every page, and a
  route can set its own.
- The layout also emits `og:image:width/height/alt`, `twitter:card =
summary_large_image`, `twitter:title` and `twitter:description`.
- The favicon marks are decorative (`alt=""`, next to the word "Zipr") and have
  explicit dimensions. There are no content images to compress, lazy-load or
  convert to WebP/AVIF.

## 11. Core Web Vitals and performance

Measured on the production build with mobile emulation, slow 4G (150 ms
latency, 1.6 Mbps) and 4× CPU throttling:

| Page        | LCP    | LCP element         | CLS | Render-blocking |
| ----------- | ------ | ------------------- | --- | --------------- |
| `/`         | 1.64 s | the H1              | 0   | `main.css` only |
| `/pricing`  | 1.04 s | the intro paragraph | 0   | `main.css` only |
| `/features` | 0.98 s | the intro paragraph | 0   | `main.css` only |

All are well inside "good" (LCP < 2.5 s, CLS < 0.1). What changed:

- **JavaScript on public pages cut by 39%:** 178 KB → 109 KB minified, and
  53.4 KB → 34.6 KB gzipped. The QR-code library, the WebAuthn client and the
  sign-in and profile components were loaded on every page but used only on
  `/login`, `/register` and `/profile`, all staff pages and all `noindex`. They
  now load on demand when their element is on the page (`ISLANDS` in
  `worker/components/main.ts`). Sign-in and registration were verified to load
  and define their components with no console errors.
- **Caching:** every file used to be served with `max-age=0, must-revalidate`,
  so returning visitors re-checked the stylesheet and fonts on every page view.
  `public/_headers` now caches fonts, the lazy chunks (content-hashed) and the
  stylesheet for a year:
  - The stylesheet's URL carries the deployment's ID (the new
    `CF_VERSION_METADATA` binding), so each deploy reaches every browser at once.
  - `client.js` deliberately keeps a single URL and revalidates, because the lazy
    chunks import it by that exact URL. Adding a version query made browsers run
    the bundle twice, which this work caught and fixed before shipping.
- **Fonts:** the display face (every H1, and the home page's LCP element) and
  the body face are now preloaded, so the headline paints in its real font
  rather than swapping late. `font-display: swap` was already set.
- **Already good:** Brotli compression on every response, fonts self-hosted (no
  third-party requests at all), no third-party scripts, and one stylesheet.
- **`theme-color`** is set for light and dark, matching the page background.

## 12. Open Graph and social

Every page now has `og:title`, `og:description`, `og:url` (the canonical),
`og:type`, `og:site_name`, `og:locale`, `og:image` with dimensions and alt, and
matching Twitter/X tags. The image is served with a one-day cache and returns
200 from the production asset layer.

## 13. Structured data

Only types the pages genuinely support, built in `worker/lib/structured-data.ts`:

- **Home:** `WebSite`, and `SoftwareApplication` for the desktop app. It has
  its name and description, `offers` with price 0 in the site currency,
  `operatingSystem` ("Windows 10 or later, macOS 12 or later"), `downloadUrl`,
  `license` → `/licence`, and publisher = **Person** Jared Stanbrook.
- **`/pricing` and `/security`:** `FAQPage`, generated from the same arrays the
  visible FAQ renders, so the markup can't disagree with the page. A test
  confirms every marked-up question is on the page.

**Deliberately absent:**

- `aggregateRating` and `review`: none exist. Google requires one of them before
  it shows a software rich result, so this markup will help search engines
  understand the app but **won't** produce star snippets until real reviews do.
- `Organization`: the owner is a person, not a company.
- `BreadcrumbList`: the site is one level deep, so breadcrumbs would add nothing.
- `Product`: the paid offering is a quoted service.

FAQ rich results are now shown only for authoritative government and health
sites. The FAQ markup is kept because it accurately describes the pages and is
used by other engines, not for a SERP feature.

The JSON-LD is escaped so that `</script>` in any string can't break out of the
element (tested). Every block parses as valid JSON (checked in the crawl).

**Recommended:** paste the home page URL into Google's Rich Results Test and the
Schema.org validator after deploying. I couldn't run external validators from
here.

## 14. Mobile

At 360 px width, every page (and the 404 page) has:

- no horizontal overflow;
- `width=device-width` viewport;
- full content parity with desktop;
- no interstitials.

**Fixed:** footer links were 18 px tall. They're now padded to at least 24 px
(WCAG 2.5.8), with tighter spacing so the column looks the same.

Some 11 px labels remain, such as the keycap numbers and the "WITHOUT ZIPR" tags.
They're short uppercase labels, not body text, so I left them as designed. All
body copy is 12 px or larger.

## 15. HTTPS and indexability

- **HTTP → HTTPS was not enforced.** Cloudflare served `http://` with a 200.
  **Fixed in code:** a 301 to HTTPS on the production host, plus
  `Strict-Transport-Security: max-age=31536000`
  (`worker/middleware/canonical-url.middleware.ts`).
  - It trusts Cloudflare's `CF-Visitor` header rather than the request URL,
    because `wrangler dev` presents the production hostname over plain HTTP and
    trusting the URL created a local redirect loop (tested).
  - **Also do this (owner action):** Cloudflare dashboard → your zone → SSL/TLS
    → Edge Certificates → turn on **Always Use HTTPS**. That redirects at the
    edge, before the Worker runs. The code redirect stays as the backstop.
- Canonicals, the sitemap and all internal links already used HTTPS or relative
  paths. There's no mixed content: every asset is same-origin.
- There's no `X-Robots-Tag` anywhere, and `noindex` is used only on staff pages,
  the new 404 page, and non-production environments. **All 9 public pages are
  indexable.**

## 16. JavaScript and rendering

Nothing to fix. Every page is server-rendered HTML (Hono JSX). The crawl ran
with JavaScript **disabled** and still got the full content, all metadata and
every link. Navigation is plain `<a href>`: HTMX's `hx-boost` enhances it but
doesn't replace it. SSR is already the architecture, so there is nothing to add.

## 17. Duplicate content

- **HTTP/HTTPS duplication:** fixed (301).
- **Trailing-slash duplicates:** these were 404s, so not duplicates, but lost
  links. Now 301s.
- **Parameter variants:** canonicalised.
- **Titles and descriptions:** now unique, with a test that keeps them so.
- **Home vs Features:** they overlap in topic but not in intent (overview vs
  detail), and Features is the only page with the full benefit list and use
  cases. There was no cannibalisation to fix.
- **Pricing vs Security:** both mention data handling; each answers its own
  reader's question and they link to each other.

## 18. Redirects

Before, there were none. There are now two permanent rules (HTTPS, and no
trailing slash), both single hops. HTTPS runs first, so
`http://…/features/` → `https://…/features/` → `https://…/features` is at most
two hops, and one once "Always Use HTTPS" is on at the edge. There are no loops
(tested, including the local-preview case). No URLs have ever moved, so no legacy
redirects are needed.

## 19. Search Console and analytics

**Not verified.** I can't verify ownership from here. What to do:

1. **Google Search Console:** go to search.google.com/search-console → Add
   property → **Domain** → `stanbrook.me` (or URL prefix
   `https://zipr.stanbrook.me/`). A Domain property is best: it covers HTTP,
   HTTPS and any subdomain. Google gives you a TXT record; add it in
   Cloudflare → DNS → Records → Add record → Type TXT, Name `@`, with Google's
   value. Then click Verify.
2. **Submit the sitemap:** Search Console → Sitemaps →
   `https://zipr.stanbrook.me/sitemap.xml`.
3. **Monitor:**
   - "Pages" (indexing) — expect 9 indexed;
   - "Core Web Vitals" (field data appears once there's enough traffic);
   - "Performance" (queries and clicks);
   - "Enhancements", where the structured data will be reported.
4. **Bing Webmaster Tools:** at bing.com/webmasters you can import the property
   straight from Search Console. That also covers DuckDuckGo and ChatGPT search,
   which use Bing's index.
5. **Analytics:** the privacy notice promises "No analytics, advertising or
   tracking cookies". Keep that promise:
   - Cloudflare's **zone analytics** (dashboard → Analytics & Logs) already
     counts requests server-side, with no script and no cookies.
   - Search Console covers search performance.
   - If you add a client-side tool later (even cookieless Cloudflare Web
     Analytics), update `/privacy` and add a `PRIVACY_VERSIONS` entry first.

## 20. Content and search intent

- **The biggest issue is not on-page.** `/downloads` on the live site shows "Not
  quite yet": no release is published. Every page's primary call to action
  ("Download for free") leads there. A searcher who lands and clicks Download
  hits a dead end, and Google sees a thin page (172 words) as the destination of
  the site's strongest internal links. **Publish a release** (Admin → Releases),
  or change the calls to action until one exists.
- **Terminology.** People looking for this kind of tool search for words like
  _launcher_, _runbook_, _shared scripts_, _command shortcuts_, and _onboarding_.
  The site now says "desktop launcher" in the title, the description and the
  hero. "Runbook" appears only inside the hero illustration. I didn't add
  keywords to existing copy; the right fix is real supporting content (below).
- **Where supporting content would genuinely help**, once there is substance to
  write, not before:
  - _How to turn a runbook into something your team can run_ — the core use
    case, with a worked example.
  - _Onboarding a new starter with a shared catalogue_ — expands the existing
    "new starter" scene.
  - _Self-hosting Zipr_ — the requirements, one-command install and licence
    renewal. This is what a self-hosting evaluator searches for, and the
    material already exists in `zipr-api/deploy/self-hosted/SELF_HOSTING.md`.
  - _Release notes_ per version — they already render on `/downloads`, and one
    page per release would give each version a crawlable, linkable URL.
- **Thin pages:**
  - `/report` (130 words) and `/contact` (170) are utility pages. They serve
    their intent and should stay indexable for brand searches.
  - `/downloads` is thin only because it's empty (see above).

## 21. Backlinks (legitimate)

Zipr is new, on a subdomain of a personal domain, with no inbound links yet.
Links worth earning:

- **Launch venues:** a _Show HN_ post (the architecture, a Tauri app and a Go
  server that never executes commands, is exactly what HN discusses), and
  **Product Hunt** on launch day.
- **Software directories people actually browse:** AlternativeTo (list it as an
  alternative to the launchers and runbook tools users compare it with),
  SaaSHub, and Slant. For the team product, G2 and Capterra, once there are real
  customers who can review it. **Not** awesome-selfhosted: it requires
  open-source software.
- **The ecosystems it's built on:** the _awesome-tauri_ list and the Tauri
  community showcase. These are relevant, earned and topical.
- **Original, linkable resources:** an engineering write-up of a genuinely
  interesting design choice. Examples: "why the server never runs your
  commands", the offline-first sync and merge, or verifying licences offline
  with Ed25519. Posts like these earn links from developers far more reliably
  than product pages.
- **Communities:** answering real questions in r/sysadmin, r/devops and
  relevant Discords, and linking only where it answers the question and the
  community's rules allow it.
- **Your own properties:** link Zipr from stanbrook.me, your GitHub profile
  README, and your LinkedIn.

Don't buy links, join link networks or PBNs, or use automated outreach. They
risk a manual action, and a new domain has little authority to absorb one.

---

## Changes made (file by file)

| File                                                                     | Change                                                                                                             | Why                                     |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------- |
| `worker/middleware/canonical-url.middleware.ts` (new)                    | HTTP → HTTPS 301, trailing slash → 301, HSTS                                                                       | One URL per page; lost links recovered  |
| `worker/index.ts`                                                        | Mounts the middleware; serves the 404 page for missed HTML requests                                                | Canonical URLs; no dead-end 404         |
| `worker/views/pages/NotFound.tsx` (new)                                  | A real 404 page: 404 status, `noindex`, links back in                                                              | UX and crawl paths                      |
| `worker/lib/seo.ts`                                                      | Default share image; `jsonLd` on `PageMeta`; safe JSON-LD serialiser                                               | Share cards; structured data            |
| `worker/lib/structured-data.ts` (new)                                    | WebSite, SoftwareApplication, FAQPage builders                                                                     | Accurate schema only                    |
| `worker/views/Layout.tsx`                                                | OG image size/alt, Twitter tags, JSON-LD, font preloads, theme-color, versioned CSS                                | Social, schema, LCP, caching            |
| `worker/lib/asset-version.ts` (new), `worker/types.ts`, `wrangler.jsonc` | `CF_VERSION_METADATA` binding versions `main.css` per deploy                                                       | Safe year-long caching                  |
| `public/_headers` (new)                                                  | Long cache for fonts, CSS and chunks; a day for og.png and the favicon                                             | Repeat-visit speed                      |
| `worker/components/main.ts`, `vite.config.ts`                            | Staff-page components load on demand, as hashed chunks                                                             | −39% JS on public pages                 |
| `worker/routes/site.tsx`                                                 | Titles, descriptions, JSON-LD per page; `noindex: false` on parameter variants                                     | Snippets, schema, canonical consistency |
| `worker/routes/seo.ts`                                                   | Real `lastmod` for the legal pages                                                                                 | An accurate sitemap                     |
| `worker/views/pages/Pricing.tsx`, `Downloads.tsx`                        | Card headings H3 → H2                                                                                              | No skipped levels                       |
| `worker/views/pages/Security.tsx`                                        | Link to `/privacy`; FAQ exported for schema                                                                        | Internal linking                        |
| `worker/views/components/SiteFooter.tsx`                                 | Larger tap targets                                                                                                 | Mobile usability                        |
| `public/og.png`, `scripts/og-image.mjs` (new)                            | The share image, and how to regenerate it                                                                          | Social previews                         |
| `tests/seo-site.test.ts` (new)                                           | 13 tests: redirects, the no-loop case, HSTS, the 404 page, schema honesty, title and description rules, canonicals | Keeps it fixed                          |

## Owner actions, in priority order

1. **Publish a release** so `/downloads` offers an installer. Every call to
   action depends on it.
2. **Turn on Always Use HTTPS** in Cloudflare (SSL/TLS → Edge Certificates).
3. **Verify the domain in Google Search Console** via a DNS TXT record, and
   submit the sitemap (section 19).
4. **Import the property into Bing Webmaster Tools.**
5. After deploying, **run the Rich Results Test** on the home page, and
   **share one URL** in Slack or LinkedIn to see the new preview card.
6. Start on backlinks with a Show HN and an AlternativeTo listing once a release
   is downloadable (section 21).
