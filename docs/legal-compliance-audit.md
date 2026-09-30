# Zipr: customer-facing legal and compliance audit

**Date:** 30 September 2026

**Scope:** the public site (`/`, `/features`, `/pricing`, `/downloads`, `/security`,
`/privacy`, `/contact`, `/report`), its footer, forms, cookies and browser storage,
and the download flow. Every claim the site makes about the product was checked
against the source of the desktop app (`zipr-client` at `f081dba`) and the server
(`zipr-api` at `69c6ade`).

This is an engineering audit, not legal advice. The items marked **OUTSIDE CODE**
need a lawyer or a business decision.

**What the site collects** (traced from the code, and the basis for the privacy
notice):

| Data                                                                     | Where                                 | Notes                                                                   |
| ------------------------------------------------------------------------ | ------------------------------------- | ----------------------------------------------------------------------- |
| Bug reports: product, summary, detail; optional version, platform, email | `issue` table, `POST /report`         | Not published. Visible to admins only.                                  |
| IP address                                                               | `POST /report` rate limiter key       | Transient counter at the edge.                                          |
| Download count                                                           | `release_asset.download_count`        | A number per file. No visitor data.                                     |
| Request metadata (IP, user agent, URL)                                   | Cloudflare Workers observability logs | `wrangler.jsonc` → `observability.enabled`                              |
| Theme preference                                                         | `localStorage`                        | Stays on the device.                                                    |
| `auth_token` and `flash-toast` cookies                                   | Staff sign-in only                    | `ALLOWED_EMAILS` limits registration to staff. Visitors get no cookies. |
| Emails sent to the contact address                                       | Mail provider                         | `mailto:` links, not a form.                                            |

**What the hosted service stores about people** (from `zipr-api`, and now in
the privacy notice):

| Data                                                                                   | Source                                                                                |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Email address and name                                                                 | `deploy/self-hosted/kratos/identity.schema.json` traits                               |
| Who changed what, and when                                                             | `audit_events`: no update or delete query exists, and the API exposes GET routes only |
| Who ran which item, when, on which device, with which app version, errors and duration | `analytics_events`, kept 180 days by default (`ANALYTICS_RETENTION_DAYS`)             |
| Billing                                                                                | Stripe (`/webhooks/stripe`)                                                           |
| A suspended organisation's data                                                        | Kept 30 days by default (`ZIPR_CLOUD_SUSPENSION_RETENTION_S`)                         |

The site has no analytics, advertising, third-party scripts or third-party
fonts: fonts are self-hosted under OFL 1.1 and icons are bundled. Neither the
site nor the product has AI features.

---

## 1. Executive summary: top 5 risks

1. **The app's own licence forbids using it.** `zipr-client/LICENSE.md` reads
   "No permission is granted to use, copy, … the Software … without the prior
   written permission of the copyright holder", and says the software is
   "provided only for authorised use by approved users". Meanwhile the site
   offers the same app as "free forever" to anyone. At best, a downloader has no
   written licence at all. At worst, the one document that exists says they
   aren't allowed to run it. No EULA is shown at download or install either.
   **OUTSIDE CODE:** a lawyer should draft an end-user licence for the free app.
   Ship it in the installer and set `LEGAL.licenceUrl` so the downloads page
   links it.
2. **The legal owner is an individual, and the site says it's "Zipr".** Both
   repositories state "Copyright (c) 2026 Jared Stanbrook". The site's footer
   said "© Zipr", which names someone who, on the evidence of the code, doesn't
   exist as a legal person. **Partly in code:** one constant, `LEGAL.operator`,
   now drives the footer and the privacy notice. **OUTSIDE CODE:** either form
   the company and assign the IP to it (a signed IP assignment from Jared
   Stanbrook), then set `LEGAL.operator` and `LEGAL.registration`; or set
   `LEGAL.operator` to "Jared Stanbrook" until then. I left this for you to
   decide, because it puts a person's name on every page.
3. **The self-hosted licence contradicts the pricing page.** `zipr-api/LICENSE`
   limits a self-hosted deployment to "the number of licensed users". The
   pricing page says self-hosting "counts nobody" and has "No user limit". The
   code enforces no seat limit on self-hosted (seats exist only on the managed
   cloud), so the site is right and the licence text is the outlier.
   **OUTSIDE CODE:** make the licence and the written agreement match the offer,
   or change the offer.
4. **There was no privacy notice, and the product records per-person usage.**
   The site collects personal data, and the hosted service records who ran what,
   when, and on which device. **Fixed in code:** `/privacy` covers both, and is
   linked from every page and every collection point. **OUTSIDE CODE:** the
   hosted agreement should require customers to tell their staff that usage is
   recorded, because some jurisdictions regulate workplace monitoring.
5. **The installers are unsigned, and ship no licence or third-party notices.**
   `package.yml` builds unsigned artefacts on purpose, and the site says so
   honestly. The Tauri bundle config sets no licence file, and the app bundles
   open-source Rust and npm code without a notices screen. **OUTSIDE CODE:**
   code signing and notarisation, plus a notices file in the client build.

---

## 2. The 20 checks

| #   | Check                           | Status                                              | Risk       | Finding and exact fix                                                                                                                                                                                                                                                                                                                                                                                                                           |
| --- | ------------------------------- | --------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Entity ownership                | **Partial**                                         | High       | Copyright in both repos is held by "Jared Stanbrook"; the site said "© Zipr". _Fixed:_ one source (`LEGAL.operator` in `worker/content/legal.ts`) drives the footer and privacy notice. **OUTSIDE CODE:** form the entity, sign an IP assignment to it, and set `operator` and `registration`; or name the individual meanwhile (risk 2).                                                                                                       |
| 2   | IP ownership / licence grant    | **Missing**                                         | Critical   | The site never claims users own Zipr's code, and the export copy correctly implies users keep their content. But the only licence (`zipr-client/LICENSE.md`) grants **no** right to use the app. **OUTSIDE CODE:** an EULA granting a limited, non-exclusive licence, covering who owns plugins users write. Replace `LICENSE.md` in the installer, and set `LEGAL.licenceUrl`.                                                                 |
| 3   | Third-party / OSS attribution   | **Site: Compliant** (was Missing). **App: Missing** | Medium     | _Fixed on the site:_ `public/third-party-notices.txt`, generated by `npm run notices`, linked in the footer, with CI failing if it goes stale. Fonts are covered by `/fonts/OFL.txt`. **App repo:** the app bundles MIT, Apache and BSD crates and npm packages with no notices; `notices.rs` is a UI error channel, not licences. Add a generator such as `cargo about` and `license-checker` to the client build.                             |
| 4   | App store / platform signals    | **N/A / Partial**                                   | Medium     | Not distributed through app stores. The platform requirements and unsigned-installer warning on the site match `package.yml`. **OUTSIDE CODE:** code signing and notarisation.                                                                                                                                                                                                                                                                  |
| 5   | Terms / EULA / clickwrap        | **Missing**                                         | Critical   | No EULA, service terms or website terms, and no acceptance step. The Tauri bundle sets no licence to show at install. **OUTSIDE CODE:** (a) the EULA, shown in the installer or on first run; (b) a hosted service agreement and DPA; (c) optionally, short website terms. _Code ready:_ `LEGAL.licenceUrl` shows "By downloading or installing it, you agree to its terms" beside the installers.                                              |
| 6   | Privacy policy                  | **Compliant** (was Missing)                         | High → Low | _Fixed:_ `/privacy`, written from both codebases (tables above). It includes the hosted service's per-person usage records and their 180-day default retention, and Stripe for billing. Linked from every page, the report form and the contact page.                                                                                                                                                                                           |
| 7   | Data-protection rights          | **Compliant** (was Missing)                         | Low        | _Fixed:_ lawful basis, the rights to access, correct, delete and object, the right to complain to a regulator, a one-month response time, and non-discrimination. Nothing is sold, so no "Do Not Sell" link is needed.                                                                                                                                                                                                                          |
| 8   | Children's privacy              | **Compliant**                                       | Low        | A B2B tool with no public accounts. _Added:_ not aimed at children, no knowing collection under 16, and deletion on request.                                                                                                                                                                                                                                                                                                                    |
| 9   | AI disclosures                  | **N/A**                                             | —          | No AI features in the site, the client or the API.                                                                                                                                                                                                                                                                                                                                                                                              |
| 10  | Training-data rights            | **N/A**                                             | —          | No models are trained.                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 11  | Accessibility                   | **Compliant** (was Partial)                         | Low        | Axe (WCAG 2.1 A/AA): **0 violations** on every public page in both themes. _Fixed:_ the numeral contrast, a skip link, `aria-current`, the mobile menu as a dialog with Escape and focus return, and report-field error ARIA. **Not done:** a manual screen-reader pass.                                                                                                                                                                        |
| 12  | Subscriptions / renewal         | **Partial**                                         | Medium     | Pricing shows the price per person, yearly and monthly options, the minimum team size, currency and "excluding tax". There's no self-serve checkout: every paid plan is quoted. The hosted billing lifecycle (Stripe `customer.subscription.*` events, past-due, suspend, then 30-day retention) needs stating in the agreement. **OUTSIDE CODE:** the agreement must cover the term, renewal and notice, cancellation, and that 30-day window. |
| 13  | Marketing claims                | **Mostly compliant** (was Unknown)                  | Medium     | Checked against both codebases; see the claims table below. 14 of 16 are true as written. _Fixed:_ the unsupported sizing claim ("a team of twenty fits comfortably on a small VM"), an over-broad sign-in claim, "works the first time", and an unstated retention window. **Remaining:** "Free forever" and "Always will be" are promises about the future. Keep them only if you're committed to them.                                       |
| 14  | Trademark / branding            | **Unknown**                                         | Medium     | Consistent use. Third-party marks are used nominatively and acknowledged in the notices file. **OUTSIDE CODE:** a clearance search for "Zipr" (IP Australia, USPTO, EUIPO; classes 9 and 42).                                                                                                                                                                                                                                                   |
| 15  | User-generated content          | **N/A / Partial**                                   | Low        | Nothing submitted is published. Hosted catalogues and plugins are private to each organisation. **OUTSIDE CODE:** an acceptable-use clause in the hosted agreement.                                                                                                                                                                                                                                                                             |
| 16  | Security / breach signals       | **Compliant** (was Missing)                         | Low        | No "military-grade" style claims. _Added:_ the privacy notice covers encryption in transit, restricted access and breach notification as the law requires.                                                                                                                                                                                                                                                                                      |
| 17  | Third-party services            | **Compliant**                                       | Low        | The site uses only Cloudflare. The hosted service uses Stripe, named in the notice; its other providers are to be listed in the agreement. The app has no telemetry, updater or crash reporter, and no CDN: its only network target is the server a user configures. **Verify:** Cloudflare dashboard analytics or Zaraz are switched off.                                                                                                      |
| 18  | Export / sanctions              | **Low risk** (was Unknown)                          | Low        | The client uses standard TLS through `reqwest`. The server signs licences with Ed25519. Nothing beyond mass-market cryptography was found. **OUTSIDE CODE:** a sanctions clause in the hosted agreement.                                                                                                                                                                                                                                        |
| 19  | Industry-specific rules         | **N/A**                                             | —          | Not a regulated domain. The closest is workplace monitoring through usage records (risk 4).                                                                                                                                                                                                                                                                                                                                                     |
| 20  | Versioning / acceptance records | **Partial** (was Missing)                           | Medium     | _Fixed:_ the privacy notice shows a version and date, and keeps a change log (`PRIVACY_VERSIONS`); git holds every earlier text. **App repo:** once the EULA exists, record the accepted version and time in the client's settings store.                                                                                                                                                                                                       |

### Claims checked against the product code

| Claim on the site                                                      | Verdict                                       | Evidence                                                                                                                                                                                                          |
| ---------------------------------------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The app makes no network request until you connect it to a server      | **True**                                      | No updater, telemetry or crash-reporter crate. Every request goes to the configured deployment (`crates/zipr-api`, `discovery.rs`).                                                                               |
| Nothing runs on a server                                               | **True**                                      | The only `exec` in the API is `atlas migrate` during cloud provisioning, never customer content.                                                                                                                  |
| Self-hosted doesn't call home; the licence verifies offline            | **True**                                      | Ed25519 key compiled in (`deploy/tools/LICENSING.md`). No hardcoded Zipr host is contacted; `zipr.dev/problems/*` are identifiers only.                                                                           |
| Expired licence: reads work, writes refused, a month's warning         | **True**                                      | `internal/selfhosted/license/guard.go`: `expiryWarning = 30 days`, then writes get 402.                                                                                                                           |
| People can't tell whether a catalogue they can't see exists            | **True**                                      | "404, not 403" guardrail in the revision, SSE and audit query services.                                                                                                                                           |
| The audit trail is written by the server and not editable from clients | **True**                                      | No UPDATE or DELETE on `audit_events`; audit endpoints are GET-only.                                                                                                                                              |
| Google, Microsoft Entra and Okta sign-in                               | **True**                                      | `SELF_HOSTING.md` §SSO.                                                                                                                                                                                           |
| Sign-in happens in the browser; the app never handles a password       | **Over-broad → fixed**                        | True of the _Zipr_ sign-in (`SignIn.tsx`). But the app does collect passwords for connected systems and "Require a re-auth" steps (`auth.tsx`, `WorkflowAuth.tsx`). Now reads "never handles your Zipr password". |
| Twelve step types                                                      | **True**                                      | `ActionType` in `crates/zipr-api/src/domains/items.rs` has 12 variants matching the site's list.                                                                                                                  |
| Plugins are kept apart, so a bad one can't take the app down           | **True**                                      | Supervised plugin processes (`crates/zipr-plugins`).                                                                                                                                                              |
| Self-hosting counts nobody; no user limit                              | **True in code, contradicted by the licence** | Seats are cloud-only (`guard.go`: "Seats are a managed-cloud concept"). `zipr-api/LICENSE` says otherwise (risk 3).                                                                                               |
| Export works even while suspended                                      | **True**                                      | `internal/cloud/gateway/gateway.go`: "Its administrators can still export its data."                                                                                                                              |
| One command brings it up                                               | **True**                                      | `docker compose up -d` (`SELF_HOSTING.md`). It also needs a domain, a TLS proxy and SMTP, which the copy now says.                                                                                                |
| "A team of twenty fits comfortably on a small virtual machine"         | **Unsupported → removed**                     | No sizing, benchmark or load test anywhere. Replaced with what the docs support: one Compose stack on one machine.                                                                                                |
| Installers are unsigned; every download has a checksum                 | **True**                                      | `package.yml` builds unsigned artefacts on purpose. The site stores SHA-256 per asset.                                                                                                                            |
| Nothing updates itself underneath you                                  | **True**                                      | No updater plugin in `src-tauri/Cargo.toml`.                                                                                                                                                                      |

---

## 3. Code changes made

In order of priority. All are on the site.

1. `worker/content/legal.ts` (new): one source for the operator name,
   registration number, contact address, licence URL and privacy version history.
2. `worker/views/pages/Privacy.tsx` (new): the privacy notice, written from the
   site's and the API's actual data flows, with a version, date and change log.
3. `worker/routes/site.tsx`: registers `GET /privacy`.
4. `worker/routes/seo.ts`: adds `/privacy` to the sitemap.
5. `worker/views/components/SiteFooter.tsx`: the copyright line names the
   operator from `LEGAL`, and every page links Privacy and Open-source licences.
6. `worker/views/pages/Report.tsx`: a privacy link at the point of collection,
   and error ARIA on the version and platform fields.
7. `worker/views/pages/Contact.tsx`: a privacy link beside the email addresses.
8. `worker/views/pages/Downloads.tsx`: a licence-acceptance line that appears
   once `LEGAL.licenceUrl` is set.
9. `worker/content/pricing.ts`: the unsupported "team of twenty" sizing claim is
   replaced with the documented deployment shape, and the "one command" card now
   names its prerequisites.
10. `worker/views/pages/Security.tsx`: "never handles a password" becomes "never
    handles your Zipr password", and "a stated window" becomes "the period set
    out in your agreement".
11. `worker/content/features.ts`: "works the first time" becomes "runs".
12. `scripts/third-party-notices.mjs` (new) and `npm run notices`: generates
    the OSS licence file from `node_modules`.
13. `public/third-party-notices.txt` (generated): the 14 packages shipped to
    browsers, plus fonts and trademark acknowledgements.
14. `.github/workflows/ci.yml`: fails if the notices file is stale.
15. `worker/views/Layout.tsx`: a skip link and a focusable `<main>` (WCAG 2.4.1).
16. `worker/views/components/NavBar.tsx`: `aria-current`; the mobile menu gets
    dialog semantics, `aria-expanded`, Escape to close and focus return.
17. `worker/views/pages/Home.tsx`: the step numerals get readable contrast (WCAG
    1.4.3).
18. `tests/ui-pages.test.ts`: `/privacy` added to the render test.
19. `scripts/copy-export.mjs` and `docs/site-copy.md`: the privacy page is
    included in the copy export.
20. `CHANGELOG.md`: records the above.

Verified with `npm run lint`, `npm run format`, `npm run typecheck`, `npm run
test` (22 passed) and `npm run build`, plus an axe scan of every public page in
both themes and a keyboard check of the skip link and mobile menu in Chromium.

Nothing was changed in `zipr-client` or `zipr-api`: every issue found there is a
legal-document or release-process decision, listed below.

---

## 4. Must-do before launch vs later

### Must-do before launch

1. **Replace the app's licence.** `zipr-client/LICENSE.md` currently forbids
   use. Get an EULA drafted (licence grant, plugin ownership, warranty
   disclaimer, liability cap, governing law). Ship it in the installer, show it
   on first run, and set `LEGAL.licenceUrl`. _(OUTSIDE CODE, then one line.)_
2. **Settle who owns Zipr.** Form the entity and sign an IP assignment from
   Jared Stanbrook, then set `LEGAL.operator` and `LEGAL.registration`. Or set
   the operator to the individual meanwhile. _(OUTSIDE CODE, then two lines.)_
3. **Make `zipr-api/LICENSE` match the offer.** Remove the per-user limit on
   self-hosted, or change the pricing page. _(OUTSIDE CODE.)_
4. **Put the hosted agreement and DPA in place:** term, renewal, cancellation,
   the 30-day post-suspension window, 180-day usage-record retention, the list
   of providers, acceptable use, a sanctions clause, and a duty on customers to
   inform staff about usage records. _(OUTSIDE CODE.)_
5. **Confirm no Cloudflare dashboard analytics or Zaraz are enabled,** or add
   them to `/privacy`.
6. **Have a lawyer review `/privacy`,** especially the lawful basis, the hosted
   processor and controller split, and whether the Australian notifiable
   data-breaches scheme applies.

### Later

1. Code signing and macOS notarisation, then remove the unsigned-installer
   caveats.
2. Third-party notices in the desktop app, generated in its build.
3. Record the accepted EULA version in the desktop app.
4. A trademark clearance search and registration for "Zipr".
5. A manual screen-reader pass (VoiceOver and NVDA) over Home, Downloads and
   Report.
6. Publish real sizing guidance for self-hosting once it has been measured.
7. Decide whether "free forever" is a commitment you will keep.
