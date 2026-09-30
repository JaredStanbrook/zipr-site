# Zipr website: clarity and conversion review

This review covers the public marketing pages: Home, Features, Pricing, Security,
Downloads and Contact. It goes with the copy and structure changes on branch
`claude/website-clarity-cro-rltzil`. Every rewritten line comes from copy that was
already on the site. It adds no new capabilities, figures, customers or testimonials.

**Word count, as rendered (from `scripts/copy-export.mjs`, before → after):**

| Page      | Before | After | Change |
| --------- | -----: | ----: | -----: |
| Home      |  1,054 |   709 |   −33% |
| Features  |    965 |   767 |   −21% |
| Pricing   |  1,753 | 1,379 |   −21% |
| Security  |    843 |   611 |   −27% |
| Downloads |    217 |   217 |      — |
| Contact   |    202 |   202 |      — |

Downloads and Contact were already short and task-focused, so they stay as they were.

---

## A. Executive assessment

**Current strengths**

- **Honest to an unusual degree.** The site admits unsigned installers, has no fake
  trial, explains what happens if you stop paying and says who can reach your data.
  For a technical buyer this honesty is the site's strongest trust signal. Keep it.
- **The business model is simple and generous:** the app is free and complete, and
  you pay only to share. Few competitors can say that, and it removes a lot of
  friction.
- **The best explanatory assets already exist.** The hero illustration (a catalogue
  of runnable items), the twelve step-type "keycaps" and the before/after scenes all
  show the product concretely.
- **The Security page is written for the real approver:** properties first, then an
  FAQ.

**Main content problems**

- **The hero never said what the product is.** The headline ("Some ideas can't be
  explained. They have to be _run._") and the lede talk about _ideas_. The words
  "desktop", "launcher" or "commands" appear nowhere above the fold. A visitor has to
  decode the illustration, or scroll to the fourth section, to learn that Zipr runs
  commands, links and apps.
- **The same message appears three or four times.** "One person's idea should be
  runnable by everyone" is in the hero, the manifesto, the pillar heading and the
  final CTA. "Free, no account" appears seven times on Home and Pricing. "Nothing runs
  on a server" appears four times across the site, including a whole section on
  Security.
- **Metaphor was doing the work of explanation.** Examples: "Out-of-the-box ideas have
  a habit of staying in one", "Five afternoons you have already had" and "Everything
  an idea needs to survive other people". These are clever, but a reader has to
  translate them before they learn anything.
- **Vocabulary drift.** The same concept is called "twelve verbs", "action types",
  "building blocks" and "things an item can do" on different pages.

**Main UX problems**

- **Eight equal benefit cards on Home,** mixing free and paid benefits with only a
  small badge to tell them apart. The same eight cards were repeated word for word on
  Features, so Home was doing Features' job.
- **No "how it works".** The page went from manifesto to benefits to step types
  without the simple sequence (build → run → share) that ties them together.
- **Long ledes.** Several section intros ran 40–60 words, three to four times longer
  than the heading they supported.

**Main conversion problems**

- **The value proposition arrived late.** First-time visitors decide whether to stay
  within seconds and scan rather than read. Nielsen Norman Group found users read
  about 20–28% of the words on a page. A hero that describes a feeling rather than a
  product loses the visitors who can't picture it.
- **The paid offer never appeared on Home with a price.** A team evaluator had to
  click through to Pricing to learn whether the offer was per person or per
  deployment, and roughly how much it cost.
- **No technical credibility on Home.** The security story, the main objection for a
  tool that holds commands, was only reachable through a ghost button.
- **One small factual error:** the Pricing meta description said the $6-per-person
  price was "on servers you control". The per-person price is for the _hosted_
  service; self-hosting is priced per deployment.

**Biggest opportunities**

1. A hero that names the product, the platform and the outcome in one read.
2. A three-step "Build it. Run it. Share it." section that explains the product and
   the pricing model at once.
3. The security facts and both prices, summarised on Home, each linking to the full
   page.
4. One term per concept, used everywhere.

---

## B. Content reduction plan

### Home

| Current section                                              | Recommendation                   | Action                                                                                                                                                                                                                                                                           | Reason                                                                                                                                                                                 |
| ------------------------------------------------------------ | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hero                                                         | **Shorten + rewrite**            | Headline now says what Zipr does ("Turn the steps you keep explaining into _one click._"). The lede names the category ("desktop launcher"), the platforms and the job. The microcopy gives system requirements instead of repeating "no account", which the badge already says. | A headline should answer "what is this?" before it tries to be memorable. The illustration stays: it is the best show-don't-tell on the site.                                          |
| Manifesto ("Every team has an idea only one person can run") | **Keep, reframe as the problem** | Two-line statement kept. The body now names where the knowledge lives (wiki, chat, someone's head) and the cost (explained, misread, explained again).                                                                                                                           | Once the hero is concrete, this is no longer a repeat. It becomes the problem statement the framework calls for.                                                                       |
| Pillars (8 cards)                                            | **Move**                         | Removed from Home; they live on Features, now grouped as free vs team.                                                                                                                                                                                                           | They were word for word the same as Features. Eight equal choices is too many for a first scan (Hick's law), and the next sections cover their substance.                              |
| Twelve verbs                                                 | **Keep, shorten intro**          | Renamed "Twelve step types". The intro went from 43 words to 28. The button now says "See all features".                                                                                                                                                                         | This is the most concrete proof of what the product does. It stays on Home.                                                                                                            |
| _(new)_ How it works                                         | **Combine**                      | Replaces "The honest version" journey. Build → Run → Share, badged Free / Free / Team.                                                                                                                                                                                           | The old journey ("Have the idea / Keep having them / Let one out") repeated "free" twice without explaining anything. The new three steps explain the product _and_ the pricing model. |
| Across the boundary                                          | **Shorten**                      | Two paragraphs cut to one. Checklist cut from 7 items to 6, and SSO added because it is a buying criterion. One CTA instead of two.                                                                                                                                              | "Nobody joins a team… Nobody gives up ownership…" restated the paragraph above it. The security link moved to its own section.                                                         |
| _(new)_ Security summary                                     | **Add from existing content**    | Four facts from the Security page, with a link to the full page.                                                                                                                                                                                                                 | Security is the main objection for a tool that stores commands. It now gets answered at the point of interest, not only for visitors who find a ghost button.                          |
| The honest version ("Free alone. Paid together.")            | **Rewrite**                      | Now two cards: the free app at $0, and a team server from $6 per person per month (hosted, billed yearly, minimum 5) or priced per deployment (self-hosted).                                                                                                                     | Showing the price removes a click and the uncertainty behind it. The heading is kept because it is the clearest statement of the model.                                                |
| Final CTA                                                    | **Shorten**                      | Body cut from 25 words to 10. The secondary CTA is now "Talk to us about a team" instead of a third "See pricing".                                                                                                                                                               | The pricing section sits directly above it, so that link was redundant. The team route is the real alternative action.                                                                 |

### Features

| Current section                                           | Recommendation        | Action                                                                                             | Reason                                                                                                                                             |
| --------------------------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hero ("Everything an idea needs to survive other people") | **Rewrite**           | "Build it once. Let anyone run it." The lede says what the page contains.                          | The old lede opened with "Being a launcher is the least interesting thing about Zipr", which talked down the one plain description of the product. |
| Pillars                                                   | **Keep, restructure** | Split into "In the free app" and "With a team server". Each body is one or two sentences.          | "What do I get for free?" is the question behind every card. A heading answers it faster than eight small badges.                                  |
| Five scenes                                               | **Keep, shorten**     | Before and after text trimmed by about 30%. Heading changed to "Five situations you'll recognise". | These are the use cases, and they are strong. Only the length needed work.                                                                         |
| Building blocks + extras                                  | **Keep, shorten**     | The heading now matches Home ("Twelve step types"). Each extra is one short sentence.              | Consistent vocabulary. The plugin isolation detail is already in the pillar above.                                                                 |
| CTA                                                       | **Rewrite**           | "Build your first item in minutes."                                                                | "Four minutes" disagreed with "about a minute" elsewhere. This version is accurate without a number.                                               |

### Pricing

| Current section      | Recommendation           | Action                                                                                                                                                     | Reason                                                                                                                                         |
| -------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Hero lede            | **Shorten**              | 40 words cut to 22.                                                                                                                                        | It restated the heading.                                                                                                                       |
| Tier cards           | **Shorten (Hosted)**     | Hosted features cut from 12 to 9. "Live updates" is merged into shared catalogues. "Tags" and "Share plugins internally" are left to the comparison table. | The card should hold the buying criteria; the table has the full list.                                                                         |
| Footnote under cards | **Shorten**              | One sentence plus the link.                                                                                                                                | Same facts, less text.                                                                                                                         |
| Comparison table     | **Keep, retitle**        | "Every feature, side by side". The lede went from 51 words to 23.                                                                                          | "Alone versus together, line by line" repeated its own eyebrow. The table stays complete, because technical buyers rely on it.                 |
| Running costs        | **Keep, shorten**        | The lede and closing note are cut to about half.                                                                                                           | This is valuable, rarely published information, so it stays. The defensive framing ("Self-hosted has a reputation…") goes.                     |
| FAQ                  | **Shorten + remove one** | All answers are 30–60% shorter. "Do you host it for us?" is removed.                                                                                       | The tier cards, the hosted-vs-self-hosted answer and the Security page already cover it. The long data-lifecycle answer now lives on Security. |
| CTA                  | **Shorten**              | Body cut from 36 words to 14.                                                                                                                              | It repeated the hero.                                                                                                                          |

### Security

| Current section                      | Recommendation        | Action                                                                                                                                                                                                                                        | Reason                                                                                                                                                                                  |
| ------------------------------------ | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hero lede                            | **Shorten**           | 30 words cut to 15.                                                                                                                                                                                                                           | Same message.                                                                                                                                                                           |
| Six properties                       | **Combine + shorten** | "You choose who holds it" and "We only see what we operate" are merged into "Your data, where you choose". A new card, "Your data is never held hostage", uses the stop-paying facts already on the site. Every body is one or two sentences. | Both merged cards answered "where does our data sit and who can reach it". Export and lock-in are a standard reviewer question, and the site already answered it, just only on Pricing. |
| "The question behind all the others" | **Remove**            | Deleted. The "Nothing" answer is the first property.                                                                                                                                                                                          | This was the fourth time the site said "nothing runs on a server". A full-width section for a repeat pushed the FAQ down.                                                               |
| Review FAQ                           | **Keep, shorten**     | All 8 questions kept, and the answers tightened. The installer answer now says the checksum is SHA-256.                                                                                                                                       | This is where the nuance belongs, and reviewers need it.                                                                                                                                |
| Found something? / CTA               | **Shorten**           | Same facts in fewer words.                                                                                                                                                                                                                    | —                                                                                                                                                                                       |

### Shared

| Current section                             | Recommendation | Action                                                                                                                                     | Reason                                  |
| ------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------- |
| Footer tagline + badge + sign-off           | **Remove one** | "Made for people whose best idea is stuck in their own head." is removed.                                                                  | That made three taglines in one footer. |
| Footer link "Alone vs together"             | **Rename**     | "Compare plans".                                                                                                                           | A link label should say where it goes.  |
| Meta descriptions (Home, Features, Pricing) | **Rewrite**    | These are the text search results and link previews show. Each now says what Zipr is. The Pricing description's inaccurate claim is fixed. | —                                       |

---

## C. New information architecture

**Home** (main marketing page):

1. **Hero:** what it is (desktop launcher), who and what for (steps you keep
   explaining to colleagues), platforms. Primary CTA _Download for free_; secondary
   _See pricing_, because price is the first question for anyone evaluating for a
   team.
2. **The problem:** the one-person process every team has, and what it costs.
3. **How it works:** Build → Run → Share, labelled Free / Free / Team. This explains
   the product and the business model in one scan.
4. **Twelve step types:** concrete proof of what an item can do. Links to Features.
5. **For teams:** what a server adds and why it's the paid part. Links to Pricing.
6. **Security:** four facts. Links to Security. This is the technical credibility
   section.
7. **Pricing:** the two numbers. Links to Pricing.
8. **Final CTA:** download, or talk to us about a team.

_Trust and proof:_ there are no customers, testimonials or usage metrics to show, and
none were invented. For now the honest security facts and transparent pricing are
the proof.

**Features:** benefits (free, then team) → use cases (five scenes) → building blocks.

**Pricing:** tiers → full comparison → self-hosting effort → FAQ.

**Security:** properties → reviewer FAQ → disclosure → talk to us.

**Downloads / Contact:** unchanged. They are task pages, and already short.

The pattern is progressive disclosure: each Home section states one idea and links to
the page that holds the detail. Documentation is the next layer down (see F).

---

## D. Rewritten website copy

All of this is live in the branch. The complete rendered copy, in reading order, is
in `docs/site-copy.md`. The key blocks:

### Home

> **Badge:** Free forever, no account
>
> **H1:** Turn the steps you keep explaining into _one click._
>
> Zipr is a desktop launcher for Windows and macOS. Chain commands, links, apps and
> prompts into one named item — then hand it to a colleague instead of a walkthrough.
>
> **[Download for free]** [See pricing]
>
> Windows 10+ and macOS 12+. Installs in about a minute.

> **Every team has something only one person can run.**
> It is usually the _best_ thing.
>
> It lives in a wiki page, a chat thread or somebody's head — so it gets explained,
> misread and explained again. Zipr turns it into something anyone can run.

> **HOW IT WORKS: Build it. Run it. _Share it._**
> The first two are free, forever. The third is what teams pay for.
>
> **01 Build it** (Free): Chain the steps you would normally explain — commands,
> links, apps, files, questions — into one named item.
> **02 Run it** (Free): One click runs it on your machine, instantly and offline.
> Build as many as you like; nothing expires and no account is needed.
> **03 Share it** (Team): When the team needs it, publish it to a shared catalogue on a
> Zipr server — hosted by us, or run by you. Same app, nothing to relearn.

> **TWELVE STEP TYPES: If you can describe it, Zipr can _run_ it.**
> Chain steps in any order, ask a question midway and use the answer, and vary a step
> by operating system — all in one item. Plugins cover the rest.

> **FOR TEAMS: Knowledge _moves._ The org chart stays put.**
> Give your organisation a Zipr server and each team keeps its own workspace and
> rules. Work crosses between them as a published copy — attributed, current and safe
> to run — instead of a ticket or a meeting.
>
> - A workspace per team, with roles and visibility you control
> - Publish a copy to another team — your own stays exactly as it was
> - Everyone on the current version, updated as colleagues work
> - Full history, one-click rollback and an audit trail
> - Single sign-on with Google, Microsoft Entra or Okta
> - Usage figures showing which items people actually run

> **SECURITY: Built for your security review**
>
> - **Nothing runs on a server.** Zipr stores items. It only ever runs them on the
>   machine of the person who clicked.
> - **Your data, where you choose.** Hosted in a database of your own, or self-hosted
>   with nothing leaving your network.
> - **Your sign-in, your rules.** Single sign-on, and roles and visibility set by
>   your administrators.
> - **Never held hostage.** Export everything as one file at any time, even if an
>   account lapses.

> **PRICING: Free alone. _Paid together._**
> The free app is the whole app, not a trial. You pay only when an item has to be
> shared.
>
> **The app: $0.** Everything one person can do on one machine. No account, no card,
> no expiry.
> **A team server: from $6 / person / month.** Hosted by us, billed yearly, minimum
> 5 people. Or self-hosted on your own infrastructure, priced per deployment.

> **Start with the one you keep having to explain.**
> Free, no account, and the same app paying teams run.

### Features, Pricing, Security

See `docs/site-copy.md` for the full text. The source is `worker/content/*.ts` and
`worker/views/pages/*.tsx`.

---

## E. Before vs. after

**Hero headline**

- _Current:_ Some ideas can't be explained. They have to be _run._
- _Recommended:_ Turn the steps you keep explaining into _one click._
- _Why:_ The old line is a good brand line but doesn't say what the product does. The
  new one names the input (steps you explain), the output (one click) and the pain,
  and keeps the same idea.

**Hero supporting line**

- _Current:_ Zipr takes the thing you worked out — the sequence, the trick, the
  shortcut nobody believes until they've seen it — and turns it into something a
  colleague can run on the first try.
- _Recommended:_ Zipr is a desktop launcher for Windows and macOS. Chain commands,
  links, apps and prompts into one named item — then hand it to a colleague instead
  of a walkthrough.
- _Why:_ It gives the category, the platforms and the concrete inputs. "The thing you
  worked out" asked the reader to supply the meaning themselves.

**Pricing model on Home**

- _Current:_ Most tools hand you a hobbled free tier and wait for you to outgrow it.
  Zipr's free app is the whole app — have as many ideas as you like, forever. What
  costs money is the day one of them has to belong to more than you, and then you pick
  who runs the server. (Followed by three cards that said "free" twice.)
- _Recommended:_ Build it. Run it. Share it. The first two are free, forever. The
  third is what teams pay for. (Plus a two-card price summary.)
- _Why:_ The model now takes one line to read, and the steps explain the product at
  the same time. The comparison with other vendors was dropped; it made a point about
  competitors rather than about Zipr.

**Benefit card (example)**

- _Current:_ **No gap between thinking of it and doing it.** Everything is already on
  your machine, so Zipr opens instantly and works on a plane. That gap — the loading,
  the searching, the where-did-I-put-it — is where good intentions quietly go to die.
- _Recommended:_ **Instant, and it works offline.** Everything is already on your
  machine, so Zipr opens straight away and keeps working on a plane.
- _Why:_ The heading now states the benefit, and the second sentence was colour
  rather than information.

**Security property (merged)**

- _Current:_ two cards, "You choose who holds it" (50 words) and "We only see what we
  operate" (46 words).
- _Recommended:_ **Your data, where you choose.** Self-hosted, it never leaves your
  infrastructure and we have no copy. Hosted, it sits in a database belonging to your
  organisation alone — we operate it, so access is governed by contract and policy.
- _Why:_ Both cards answered one question. The honest admission, that on the hosted
  service Zipr can technically reach the data, is kept.

**Pricing FAQ: "What happens if we stop paying?"**

- _Current:_ 91 words covering the hosted and self-hosted sequences separately.
- _Recommended:_ 40 words: nothing deleted, reads work, writes refused, export at any
  time, a month's warning for self-hosted licences. The step-by-step version is on
  Security.
- _Why:_ A buyer on Pricing needs reassurance; a reviewer on Security needs the
  sequence.

---

## F. Content that should move elsewhere

What was trimmed from the marketing pages, and where it lives now or should live:

| Content                                                                                                            | Now                            | Recommended home                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------ | ------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| Eight benefit cards                                                                                                | Features only                  | — (done)                                                                                                           |
| Tags, internal plugin sharing, live updates as separate hosted bullets                                             | Pricing comparison table       | — (done)                                                                                                           |
| Hosted data lifecycle (readable → suspended → retained window → removal)                                           | Security FAQ                   | **Support / billing help article**, with the actual retention window stated                                        |
| "Do you host it for us?" (own database, per-customer restore)                                                      | Security FAQ + tier card       | — (done)                                                                                                           |
| Self-host sizing ("a team of twenty fits a small VM"), "one command" install, licence renewal and expiry behaviour | Pricing, running costs (short) | **Self-hosting guide** in documentation: requirements, install, upgrade, backup, licence renewal, air-gapped setup |
| Plugin model and isolation                                                                                         | One sentence on Features       | **Plugin developer docs**                                                                                          |
| Step-type identifiers and item format (deliberately removed from marketing earlier)                                | Not on site                    | **API / client reference**, for people writing against the server                                                  |
| Moving from hosted to self-hosted                                                                                  | Pricing FAQ                    | **Migration guide**, once a supported path exists                                                                  |
| Installer checksums, unsigned-build warnings                                                                       | Downloads (keep)               | Also a short **"Verifying your download"** help page with the commands for Windows and macOS                       |
| SSO providers, sign-in flow                                                                                        | Security FAQ                   | **Admin guide:** SSO setup per provider                                                                            |
| Security questionnaire, DPA                                                                                        | "Talk to us"                   | A downloadable **security overview PDF** once it exists                                                            |

---

## G. Final conversion recommendations

### High priority (done in this branch)

1. **A hero that states what Zipr is.** Name the category, the platforms and the
   outcome, and keep the illustration.
2. **Add "Build it. Run it. Share it."** It is the missing how-it-works section and
   explains the free/paid line.
3. **Remove the repeated content from Home:** the eight pillars (moved to Features),
   the old three-step journey, the second boundary paragraph and the repeated "free"
   lines.
4. **Summarise security and price on Home,** each linking to its full page.
5. **One term per concept:** "step types", not verbs, action types or building blocks.
6. **Fix the inaccurate Pricing meta description.**

### Medium priority (next)

1. **Replace or pair the hero illustration with a real screenshot or a 20–30 second
   clip** of building and running an item. The page currently says "An illustration,
   not a screenshot"; a real one would be stronger proof. (Not done: no screenshot
   is available.)
2. **Add genuine proof once it exists:** a pilot customer's quote, a named team, or
   a usage figure from the telemetry the team tier already collects. Do not add
   placeholders.
3. **Publish the self-hosting guide** (section F), and link "What self-hosting
   involves" to it rather than to an on-page anchor.
4. **Sign the installers.** OS warnings at install time are the biggest remaining
   drop-off risk after the download click. Once signed, remove the caveats on
   Downloads and Security.
5. **Measure it.** Track hero CTA clicks, scroll depth past "How it works",
   `/downloads` → installer clicks, and `/contact?topic=cloud` opens, to confirm
   these changes worked.

### Low priority (polish)

1. On mobile, collapse the Pricing comparison table's four groups into disclosures.
2. Add a one-line glossary tooltip for _item_, _catalogue_ and _workspace_ where each
   first appears.
3. Consider cutting the five Features scenes to three (share, onboard, undo), with
   the other two behind a "More" disclosure.
4. Make "For ideas that have to be run, not explained." the tagline everywhere, now
   that the hero no longer uses that line.

---

### Principles applied

- **Clarity over cleverness:** a headline should say what the product does.
  Memorable lines work as the eyebrow or tagline, not the H1.
- **Inverted pyramid / progressive disclosure:** conclusion first, detail on demand
  (Nielsen Norman Group).
- **Scanning behaviour:** users read a small fraction of the words on a page, so
  headings and first sentences have to carry the meaning on their own.
- **Hick's law:** fewer, clearer choices per section. That means one CTA per mid-page
  section, and 3–6 items per list instead of 7–12.
- **Don't manufacture proof:** where genuine social proof is missing, verifiable
  facts do the job. Invented testimonials cost more trust than they win with a
  technical audience.
