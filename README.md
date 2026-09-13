# zipr-site

The Zipr website: what the product is, what it costs, and where to download it.

A single Cloudflare Worker that server-renders every page — Hono for routing,
JSX for views, HTMX for the few things that swap in place, D1 for the release
catalogue, R2 for the installers themselves.

Two bindings, not three. There is no KV namespace, because the only thing the
template used it for was holding a WebAuthn challenge — so passkey sign-in is
off and `AUTH_METHODS` is `password,totp`. And there is no contact form:
contact is `mailto:`, which means this site has no public write surface at all.

Built on [frug-template](https://github.com/JaredStanbrook/frug-template); its
`frugal` skill in `.claude/skills/` still applies, and `architecture.md`,
`style.md` and `endpoints.md` are the template's own documentation.

## What is here

| Path              |                                                                     |
| ----------------- | ------------------------------------------------------------------- |
| `/`               | What Zipr is, where the commercial line falls, what it does         |
| `/features`       | The detail, ending with what the free client deliberately cannot do |
| `/downloads`      | Installers, served from R2 through the worker, with checksums       |
| `/pricing`        | Three tiers, the full comparison, and what the infrastructure costs |
| `/security`       | The short answers a security review wants                           |
| `/contact`        | Four `mailto:` routes, each with a subject already written          |
| `/report`         | Bug reports, straight into D1. The site is the tracker              |
| `/admin`          | Where signing in lands you: what is published, and where to go      |
| `/admin/releases` | Create a release, upload installers, publish                        |
| `/admin/issues`   | The bug tracker — triage, reply, close                              |
| `/admin/logs`     | The authentication audit trail                                      |

## Accounts

There are no customer accounts. The only reason anyone signs in is to publish a
release or read the sign-in log, so:

- **`/admin` is the front door.** Visiting it signed out redirects to the form;
  signing in comes back here. Nothing on the public site links to it.
- **The public pages advertise no sign-in at all** — a login link would imply
  an account a visitor cannot have.
- **`/register` exists only until the first admin does.** That page is how
  `BOOTSTRAP_ADMIN_EMAIL` makes the first account without a terminal; the
  moment an admin exists the bootstrap disarms itself, and so does the page,
  which then 404s. Further accounts are made with
  `npm run create-admin:remote`.

That last one is why `ALLOWED_EMAILS` matters less here than in the template:
the sign-up form is not standing open waiting for someone to remember to set
it. Set it anyway if you intend to register more than once.

## Deploying

The repo is configured. `wrangler.jsonc` carries the real values:

|        |                                    |
| ------ | ---------------------------------- |
| Worker | `zipr-site` on `zipr.stanbrook.me` |
| D1     | `zipr-db`                          |
| R2     | `zipr-r2`                          |
| Admin  | `jared@stanbrook.me`               |

Those resource ids are not secrets — they are useless without an API token for
the account — which is why they live in version control rather than in a
variable.

Three things are left, all in the Cloudflare dashboard:

1. **`JWT_SECRET`**, under **Settings → Variables and Secrets**, type
   **Secret**. It signs every session cookie. It is deliberately not in
   `wrangler.jsonc`: putting it there commits it to git.
2. **Connect the repo**, under **Settings → Builds**, with build
   `npm run build` and deploy `npm run deploy`. The deploy command applies D1
   migrations immediately before the new code goes live, so a schema change
   ships itself.
3. **Register once** on the live site at `/register` with
   `jared@stanbrook.me`. That address is `BOOTSTRAP_ADMIN_EMAIL`, so the
   account is granted `admin` on sign-up — and both the bootstrap and the page
   close behind you (see [Accounts](#accounts)). After that, sign in at
   `/admin`.

D1 migrations are forward-only, so a destructive change needs a forward fix
rather than a rollback. `docs/deploy.md` covers failures and rollback.

## Publishing a release

The downloads page renders whatever the database holds, and shows an honest
"nothing published yet" state when that is nothing.

1. **Create** the release at `/admin/releases` — version and channel. It starts
   as a draft that no visitor can see.
2. **Upload** an installer per platform. The worker checksums the bytes as they
   arrive and stores the file in R2; the hash shown on the downloads page is
   the one it computed, never one supplied with the upload.
3. **Publish.** Publishing is refused while a release has no installers, since
   that would offer visitors a version number and no button.

Installers are streamed back through the worker rather than served from a
public bucket, so downloads can be counted, a draft cannot be fetched by
guessing an id, and the storage layout stays private.

Windows and macOS are the platforms the client currently bundles. Linux is
listed and marked "build from source", because the client's Tauri config names
only `nsis`, `app` and `dmg` — an Ubuntu runner would compile the binary and
have nothing to upload.

## Where the content lives

Copy is data, not markup. Editing the words should never mean editing a layout:

- `worker/content/pricing.ts` — tiers, the comparison table, running costs, FAQ.
  Money is integer cents; `formatPrice` converts at the edge.
- `worker/content/features.ts` — the pillars, the twelve action types, the
  three-step journey, and what a team adds.
- `worker/content/site.ts` — the contact address, repository links, platform
  metadata, install notes, the public nav.

The contact page's four routes and their pre-filled subject lines live in
`worker/views/pages/Contact.tsx`, since each one is a link rather than data
anything else reads.

### Two rules for anything a visitor reads

**Say what they get, not how it works.** No stack names, no algorithms, no
internal vocabulary. The site went through one round of this already: it was
written like a design document, which flattered the people who built it and did
nothing for anyone deciding whether to spend four minutes installing something.
It also handed a competitor the blueprint. If a sentence would only impress an
engineer who already works here, it is the wrong sentence.

**Every claim stays true anyway.** Marketing voice, not marketing fiction — the
first thing a trial does is check. If a line stops being true, that is a bug in
the content file.

### Bug reports

Both source repositories are private, so there is no public tracker to link to
and the site carries its own. `/report` writes to D1; `/admin/issues` is where
they land. It is the only public write on the site, so it is rate-limited at
the edge with the same limiter the sign-in API uses, and honeypotted.

Contact stays `mailto:` — a mail client already solves that one.

## Styling

The palette is the desktop client's, copied verbatim from
`packages/ui-kit/src/styles/tokens.css` in `zipr-client` — warm clay surfaces,
paired highlight and shadow instead of borders. The site a visitor reads and
the app they download should not look like two products.

One thing is deliberately not the client's: the primary is the logo's orange
taken deep enough to carry white text (`#b83a0a`), not the client's clay
purple. The client has yet to follow.

Three token names also differ from the client's on purpose, and
`worker/index.css` says why at the top. The rule that matters: style with the semantic token
(`bg-card`, `text-muted-foreground`), never a raw colour, or it will be
unreadable in whichever theme you did not test.

### The clay vocabulary

Depth, not lines. There is deliberately no flat bordered card available — a
bordered box is the thing claymorphism replaces, and having one on hand is how
this site drifted back to looking like a Swiss grid with soft shadows.

| Class          | Is                          | Use for                        |
| -------------- | --------------------------- | ------------------------------ |
| `.clay`        | A surface above the page    | Cards, table frames, panels    |
| `.clay-raised` | The same at control scale   | Icon tiles, small raised bits  |
| `.clay-well`   | A surface cut into the page | Empty states, recessed regions |
| `.clay-field`  | A well shaped like an input | Every form control             |
| `.clay-press`  | A pixel down, shadow inward | Anything clickable             |

Two things differ from the client's own token file, both on purpose and both
commented where they are defined. Large surfaces use `--shadow-raised-lg`,
which is the same paired-highlight recipe cast wider — the client's elevation
is tuned for 28px controls and reads as a smudge on a 600px card. And
`--radius-lg`/`--radius-xl` are larger than the client's, because its own
comment explains that it caps low for density ("a 24px radius on a 28px-tall
table row is a pill"), which is an argument about tables rather than about the
style. Controls keep the client's exact scale.

The mark lives in two files. `public/logo.svg` is the logo itself, traced from
the supplied raster rather than redrawn: the original is 256x128 with two
colours and every edge on a 16px boundary, so it decodes to a 16x8 grid with
40 blocks filled, and the SVG is those blocks merged into runs — pixel for
pixel identical, at any size. `public/favicon.svg` is the square badge used in
the tab, the nav bar and the footer; it is a four-by-four crop of the same
grid, because the full mark is sixteen blocks wide and turns to mush in a
32px box.

Plus Jakarta Sans and JetBrains Mono are self-hosted in `public/fonts` (latin
and latin-ext, ~92KB) so first paint owes nothing to a third party and the site
still looks right on a network that blocks Google Fonts. Both are OFL 1.1; see
`public/fonts/OFL.txt`.

## Development

```sh
npm install
npx wrangler d1 migrations apply DB --local    # once
npm run dev                                    # vite, on :5173
```

`.dev.vars` needs `JWT_SECRET` and `ORIGIN=http://localhost:5173` — copy
`.dev.vars.example`. Note that `npm run dev` serves on Vite's port, not the
`dev.port` in `wrangler.jsonc`, which only applies to `wrangler dev`.

To get an account locally:

```sh
npm run create-admin:local -- --email you@example.com --password 'Secret123!'
```

Before pushing:

```sh
npm run build     # wrangler types → tsc → client and server bundles
npm run test
npm run lint
```

Two things behave differently under `vite dev` than in production, and both are
handled rather than left to surprise you: the static-asset binding is a stub
that cannot serve a 404, and `executionCtx.waitUntil` does not run its promise.
`worker/index.ts` and the download route fall back in both cases.
