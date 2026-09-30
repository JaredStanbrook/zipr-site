# Zipr: customer-facing legal and compliance audit

**Date:** 30 September 2026
**Scope:** the public site (`/`, `/features`, `/pricing`, `/downloads`, `/security`,
`/contact`, `/report`), its footer, forms, cookies and browser storage, and the
download flow.

The desktop app and the API server live in private repositories and were not
available to this audit. Claims the site makes about them are marked **Unknown**
wherever the code could not be checked.

This is an engineering audit, not legal advice. The items marked **OUTSIDE CODE**
need a lawyer or a business decision.

**What the site actually collects** (traced from the code, and the basis for the
privacy notice):

| Data                                                                     | Where                                 | Notes                                                                   |
| ------------------------------------------------------------------------ | ------------------------------------- | ----------------------------------------------------------------------- |
| Bug reports: product, summary, detail; optional version, platform, email | `issue` table, `POST /report`         | Not published. Visible to admins only.                                  |
| IP address                                                               | `POST /report` rate limiter key       | Transient counter at the edge.                                          |
| Download count                                                           | `release_asset.download_count`        | A number per file. No visitor data.                                     |
| Request metadata (IP, user agent, URL)                                   | Cloudflare Workers observability logs | `wrangler.jsonc` → `observability.enabled`                              |
| Theme preference                                                         | `localStorage`                        | Stays on the device.                                                    |
| `auth_token` and `flash-toast` cookies                                   | Staff sign-in only                    | `ALLOWED_EMAILS` limits registration to staff. Visitors get no cookies. |
| Emails sent to the contact address                                       | Mail provider                         | `mailto:` links, not a form.                                            |

No analytics, advertising, third-party scripts or third-party fonts: fonts are
self-hosted under OFL 1.1, and icons are bundled. The site has no AI features.

---

## 1. Executive summary: top 5 risks

1. **There was no privacy notice anywhere, although the site collects personal
   data.** Bug reports can include an email address, and Cloudflare logs IP
   addresses. That breaches GDPR Articles 13–14, Australian Privacy Principle 1
   and CalOPPA as soon as the site is public. **Fixed in code:** `/privacy` is now
   linked from every page and from both collection points.
2. **No licence or EULA governs the free app, and no terms govern the paid
   service.** Anyone can download the installer without seeing a licence grant, a
   warranty disclaimer or a liability limit. A tool whose job is to run shell
   commands is exactly where those clauses matter. **OUTSIDE CODE:** the terms
   need drafting. The code hook is ready: set `LEGAL.licenceUrl`.
3. **The site doesn't identify a legal entity.** The footer said "© Zipr", and
   the only contact is a personal-domain address. If Zipr isn't a registered
   entity, "Zipr" is holding itself out as one. **Partly in code:** the operator
   name is now one constant (`LEGAL.operator`) used in the footer and the privacy
   notice. **OUTSIDE CODE:** set it to the real legal name and registration
   number.
4. **Technical and performance claims about code this audit couldn't see.**
   Examples: "No network request until you point it at a team server", "Nothing
   leaves your network, including the licence check", "Nothing runs on a server",
   "someone who should not see a catalogue cannot tell whether it exists", "A
   team of twenty fits comfortably on a small virtual machine", "Up in an
   afternoon". These are specific factual claims made to security reviewers. If
   any is wrong, it is misleading conduct (Australian Consumer Law s18, FTC Act
   s5). **OUTSIDE CODE:** verify each one against the app and API repositories
   before launch.
5. **Unsigned, unnotarised installers.** The site discloses this honestly. On
   current macOS, though, an unnotarised app can't be opened without a trip into
   System Settings, and many enterprise endpoints block it outright. That is
   more of a trust and distribution risk than a legal one, and it is the main
   blocker to adoption. **OUTSIDE CODE:** get an Apple Developer ID and a
   Windows code-signing certificate.

---

## 2. The 20 checks

| #   | Check                           | Status                      | Risk         | Finding and exact fix                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| --- | ------------------------------- | --------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Entity ownership                | **Partial**                 | High         | The footer said "© Zipr" and the contact address is on a personal domain. _Fixed:_ the operator name now comes from `LEGAL.operator` (`worker/content/legal.ts`), with an optional `registration` for the company or ABN number. The footer and privacy notice both read from it. **OUTSIDE CODE:** set it to the registered legal name and number.                                                                                                                                                              |
| 2   | IP ownership / licence grant    | **Missing**                 | High         | The site never claims users own Zipr's code. The export copy implies users keep their own content, which is correct. But no licence grant exists anywhere. **OUTSIDE CODE:** an EULA with a limited, revocable, non-exclusive licence, including who owns plugins users write. Then set `LEGAL.licenceUrl`.                                                                                                                                                                                                      |
| 3   | Third-party / OSS attribution   | **Compliant** (was Missing) | Medium       | The client bundle includes MIT, ISC and BSD code (lit, lucide, htmx, qrcode, hono, tailwind), and minification strips its licence comments. _Fixed:_ `public/third-party-notices.txt` is generated by `npm run notices`, linked in the footer, and ends with a line on third-party trademarks. Fonts are covered by `/fonts/OFL.txt`. **OUTSIDE CODE:** the desktop installer needs its own notices, in the app repo.                                                                                            |
| 4   | App store / platform signals    | **N/A / Partial**           | Medium       | Not distributed through app stores, so there are no privacy labels. The download page's platform requirements and unsigned-installer warning are accurate. **OUTSIDE CODE:** code signing and macOS notarisation (see risk 5).                                                                                                                                                                                                                                                                                   |
| 5   | Terms / EULA / clickwrap        | **Missing**                 | High         | No terms of use, EULA or service terms, and no acceptance step. Paid plans are sold by written agreement after a conversation, which covers them if that agreement contains the terms. **OUTSIDE CODE:** (a) an EULA for the free app, accepted in the installer or on first run; (b) a hosted service agreement and DPA; (c) optionally, short website terms. _Code ready:_ setting `LEGAL.licenceUrl` shows "By downloading or installing it, you agree to its terms" beside the installers.                   |
| 6   | Privacy policy                  | **Compliant** (was Missing) | High → Low   | _Fixed:_ `/privacy`, written from the code (see the table above). Linked from the footer on every page, from the report form and from the contact page.                                                                                                                                                                                                                                                                                                                                                          |
| 7   | Data-protection rights          | **Compliant** (was Missing) | Medium → Low | _Fixed:_ the notice gives the lawful basis (legitimate interests, and your request when you ask for a reply), the rights to access, correct, delete and object, the right to complain to a regulator, a one-month response time, and non-discrimination. Nothing is sold or shared for advertising, so no CCPA "Do Not Sell" link is needed.                                                                                                                                                                     |
| 8   | Children's privacy              | **Compliant**               | Low          | A B2B tool with no public accounts. _Added:_ a statement that it isn't aimed at children, with no knowing collection under 16 and deletion on request. No age gate needed.                                                                                                                                                                                                                                                                                                                                       |
| 9   | AI disclosures                  | **N/A**                     | —            | There are no AI features on the site or in the product as described. Re-check if any are added.                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 10  | Training-data rights            | **N/A**                     | —            | No models are trained. If that ever changes, it needs opt-in consent and an update to the privacy notice.                                                                                                                                                                                                                                                                                                                                                                                                        |
| 11  | Accessibility                   | **Compliant** (was Partial) | Medium → Low | Axe (WCAG 2.1 A/AA) now reports **0 violations** on all 8 public pages in light and dark mode. _Fixed:_ the step numerals had 1.2:1 contrast; there was no skip link, no `aria-current` on nav links, and the mobile menu wasn't announced as a dialog and couldn't be closed with Escape; two report fields had errors not tied to their inputs. **Not done:** a manual screen-reader pass, and the admin pages, which aren't customer-facing.                                                                  |
| 12  | Subscriptions / renewal         | **Partial**                 | Medium       | Pricing shows the per-person price, the yearly and monthly options, the minimum team size, currency and "excluding tax". There is no self-serve checkout, and every paid plan goes through a quote, so auto-renewal disclosure laws for online consumer sign-ups mostly don't apply. **OUTSIDE CODE:** the service agreement must state the term, the renewal mechanism and notice, and cancellation. If you ever add self-serve checkout, it needs renewal terms and a cancellation path shown before purchase. |
| 13  | Marketing claims                | **Partial**                 | High         | _Fixed:_ "works the first time" is now "runs", because it was an unqualified guarantee. The "stated window" for hosted data retention was stated nowhere; it now points to the agreement. **OUTSIDE CODE:** verify the claims in risk 4. "Free forever" and "The app is free. Always will be." are promises about the future: keep them only if you're committed, because the Australian Consumer Law requires reasonable grounds for them.                                                                      |
| 14  | Trademark / branding            | **Unknown**                 | Medium       | The name is used consistently, and the logo is original. Third-party marks (Google, Microsoft Entra, Okta, Windows, macOS) are used nominatively, and are now acknowledged in the notices file. **OUTSIDE CODE:** run a trademark clearance search for "Zipr" in your markets and software classes (for example IP Australia, USPTO and EUIPO, class 9 and 42), and consider registering it.                                                                                                                     |
| 15  | User-generated content          | **N/A / Partial**           | Low          | Nothing users submit is published: bug reports are private. Hosted customers store their own catalogues and plugins, visible only inside their organisation. Reporting routes exist (`/report` and the security email). **OUTSIDE CODE:** put an acceptable-use clause in the hosted agreement. No DMCA process is needed while nothing is hosted publicly.                                                                                                                                                      |
| 16  | Security / breach signals       | **Compliant** (was Missing) | Low          | There are no "military-grade" or similar claims. _Added:_ the privacy notice covers encryption in transit, staff-only access and breach notification "as the law requires". The security page's disclosure process and SHA-256 checksums already existed.                                                                                                                                                                                                                                                        |
| 17  | Third-party services            | **Compliant**               | Low          | The only processor is Cloudflare (hosting, D1, R2, logs), now disclosed along with international processing. There's no analytics and no payment processor on the site. No cookie banner is needed: visitors get no cookies, and theme storage is a strictly functional preference. **Verify:** that Cloudflare Web Analytics or Zaraz isn't switched on in the dashboard, because either would inject a script this code doesn't show.                                                                          |
| 18  | Export / sanctions              | **Unknown**                 | Low          | Anyone can download the installer, with no geo-blocking. The app presumably uses only standard encryption (TLS, passkeys), which usually counts as mass-market. **OUTSIDE CODE:** confirm the app's encryption classification. Hosted-service contracts should include a standard sanctions clause.                                                                                                                                                                                                              |
| 19  | Industry-specific rules         | **N/A**                     | —            | A general productivity tool. No health, finance, employment or high-risk AI use.                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 20  | Versioning / acceptance records | **Partial** (was Missing)   | Medium       | _Fixed:_ the privacy notice shows a version and last-updated date and keeps a change log (`PRIVACY_VERSIONS`), and git holds every earlier text. There are no public accounts, so there's nothing to record acceptance against on the site. **OUTSIDE CODE / app repo:** once the EULA exists, record the accepted version and a timestamp in the app. Hosted agreements are signed documents, so keep them.                                                                                                     |

---

## 3. Code changes made

In order of priority:

1. `worker/content/legal.ts` (new): one source for the operator name,
   registration number, contact address, licence URL and privacy version
   history, so the footer and notices never disagree.
2. `worker/views/pages/Privacy.tsx` (new): the privacy notice, written from the
   actual data flows, with a version, date and change log.
3. `worker/routes/site.tsx`: registers `GET /privacy` so the notice is
   reachable.
4. `worker/routes/seo.ts`: adds `/privacy` to the sitemap so it can be found.
5. `worker/views/components/SiteFooter.tsx`: the copyright line names the
   operator from `LEGAL`, and every page links Privacy and Open-source licences.
6. `worker/views/pages/Report.tsx`: adds a privacy link at the point of
   collection, and ties the version and platform fields' errors to their inputs.
7. `worker/views/pages/Contact.tsx`: adds a privacy link beside the email
   addresses, which are a collection point.
8. `worker/views/pages/Downloads.tsx`: a licence-acceptance line that appears
   only once `LEGAL.licenceUrl` is set, rather than pointing at a document that
   doesn't exist.
9. `scripts/third-party-notices.mjs` (new), plus `npm run notices` in
   `package.json`: generates the OSS licence file from `node_modules`, so it
   can't drift from the bundle.
10. `public/third-party-notices.txt` (generated): the licence text of the 14
    packages shipped to browsers, plus the fonts and trademark acknowledgements.
11. `worker/views/Layout.tsx`: a skip link, and a focusable `<main>` target
    (WCAG 2.4.1).
12. `worker/views/components/NavBar.tsx`: `aria-current` on the active link;
    the mobile menu gets `role="dialog"`, `aria-expanded` and `aria-controls`,
    closes on Escape, and returns focus.
13. `worker/views/pages/Home.tsx`: the step numerals change from 1.2:1 embossed
    text to readable contrast (WCAG 1.4.3), and are hidden from assistive tech
    because the `<ol>` already gives the order.
14. `worker/content/features.ts`: "works the first time" becomes "runs", because
    it was an unqualified guarantee.
15. `worker/views/pages/Security.tsx`: "a stated window" becomes "the period set
    out in your agreement", because no window was stated anywhere.
16. `tests/ui-pages.test.ts`: `/privacy` added to the public-page render test.
17. `scripts/copy-export.mjs` and `docs/site-copy.md`: the privacy page is
    included in the copy export, which has been regenerated.
18. `CHANGELOG.md`: records the above.

Verified with `npm run lint`, `npm run typecheck`, `npm run test` (22 passed)
and `npm run build`, plus an axe scan of every public page in both themes and a
keyboard check of the skip link and mobile menu in Chromium.

---

## 4. Must-do before launch vs later

### Must-do before launch

1. **Set `LEGAL.operator` and `LEGAL.registration`** to the registered legal
   entity. If there isn't one, decide whether to form one first. _(OUTSIDE CODE:
   entity formation. Then a two-line code change.)_
2. **Have the EULA drafted** (licence grant, plugin ownership, warranty
   disclaimer, liability cap, governing law), publish it, and set
   `LEGAL.licenceUrl`. Show it in the installer or on first run as well.
   _(OUTSIDE CODE.)_
3. **Put the hosted service agreement and DPA in place:** term, renewal,
   cancellation, data retention after suspension, acceptable use, sanctions.
   _(OUTSIDE CODE.)_
4. **Verify every technical claim in risk 4** against the app and API code, and
   change the copy where any isn't strictly true. _(Needs the private repos.)_
5. **Confirm no Cloudflare dashboard analytics are injected,** or disclose them
   in `/privacy` and add them to `PRIVACY_VERSIONS`.
6. **Have a lawyer review `/privacy`,** in particular the lawful-basis wording
   and whether the Australian notifiable-data-breaches scheme applies to you.

### Later

1. Code signing and macOS notarisation, then remove the unsigned-installer
   caveats from Downloads and Security.
2. A trademark clearance search and registration for "Zipr".
3. Once the EULA exists, record the accepted version in the desktop app.
4. A manual screen-reader pass (VoiceOver and NVDA) over Home, Downloads and
   Report.
5. Third-party notices inside the desktop installer.
6. Classify the app's encryption for export purposes.
7. Decide whether "free forever" is a commitment you will keep. If not, soften
   it to "free" before anyone relies on it.
8. Re-run `npm run notices` whenever client-side dependencies change. It could
   be added to CI.
