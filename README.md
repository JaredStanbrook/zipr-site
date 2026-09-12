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
| `/docs`           | Architecture, deployment shapes, and notes for client authors       |
| `/contact`        | Four `mailto:` routes, each with a subject already written          |
| `/admin`          | Where signing in lands you: what is published, and where to go      |
| `/admin/releases` | Create a release, upload installers, publish                        |
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

## Still to configure

Four things cannot be guessed and are left as placeholders. Find them with:

```sh
grep -rn "change.me\|0000000" wrangler.jsonc worker/content/site.ts
```

1. **A D1 database**, created in the Cloudflare dashboard (Storage &
   Databases → D1). Copy the Database ID, a UUID. No KV namespace is needed.
2. **An R2 bucket** for the installers. The downloads page needs it; the deploy
   fails if the binding is declared and the bucket does not exist.
3. **The domain**, which is also `ORIGIN` — the canonical URL every page
   declares and the base of `sitemap.xml`, so a wrong one is a live SEO bug.
4. **The contact addresses** in `worker/content/site.ts` — they currently point
   at `change-me.example.com`, so every mailto link on the site goes nowhere.

Then run, with your own values:

```sh
npm run configure -- \
  --name zipr-site --app-name "Zipr" \
  --tagline "One catalogue of the things your team launches." \
  --domain zipr.example.com \
  --d1-name zipr-site-db --d1-id <uuid> --no-kv \
  --r2-bucket zipr-site-downloads \
  --admin-email you@example.com \
  --locale en-AU --currency USD
```

Two more in the dashboard: add `JWT_SECRET` under **Settings → Variables and
Secrets** as a **Secret**, and connect the repo under **Settings → Builds**
with build `npm run build` and deploy `npm run deploy`. Register on the live
site with `--admin-email` to become the admin; that bootstrap disarms itself
once an admin exists.

Set `ALLOWED_EMAILS` to the staff addresses before the site is public, or
anyone can register an account.

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
  journey, and the local workspace's limits.
- `worker/content/site.ts` — contact addresses, repository links, platform
  metadata, install notes, the public nav.

The contact page's four routes and their pre-filled subject lines live in
`worker/views/pages/Contact.tsx`, since each one is a link rather than data
anything else reads.

Every claim in those files is traceable to something the client or the API
actually does. If one stops being true it is a bug in the content file.

## Styling

The palette is the desktop client's, copied verbatim from
`packages/ui-kit/src/styles/tokens.css` in `zipr-client` — warm clay surfaces,
paired highlight and shadow instead of borders, `#524bc4` primary. The site a
visitor reads and the app they download should not look like two products.

Three token names differ from the client's on purpose, and `worker/index.css`
says why at the top. The rule that matters: style with the semantic token
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

`.dev.vars` needs `JWT_SECRET` and `ORIGIN=http://localhost:5173`. To get an
account locally:

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
