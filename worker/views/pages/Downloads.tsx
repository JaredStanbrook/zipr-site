import type { FC } from "hono/jsx";

import type { AppConfig } from "@server/config/app.config";
import type { ReleaseWithAssets, Platform } from "@server/schema/release.schema";
import {
  PLATFORM_INFO,
  INSTALL_NOTES,
  FILE_FORMATS,
  ARCH_LABELS,
  MAC_ARCH_LABELS,
  EXPERIMENTAL_NOTES,
} from "@server/content/site";
import { LEGAL } from "@server/content/legal";
import { formatBytes, formatDateShort } from "@views/lib/utils";
import {
  Page,
  Section,
  Container,
  SectionHeading,
  Card,
  Badge,
  LinkButton,
  CtaBand,
  Disclosure,
  IconTile,
  TableFrame,
} from "@views/components/Ui";

type Asset = ReleaseWithAssets["assets"][number];

interface DownloadsProps {
  /** The newest **stable** release: the one the page leads with. */
  latest: ReleaseWithAssets | null;
  previous: ReleaseWithAssets[];
  /**
   * Published experimental builds, newest first. Shown in their own section
   * further down, never in the cards at the top.
   */
  experimental: ReleaseWithAssets[];
  /** Guessed from the user-agent so the right card leads. Never trusted. */
  detected: Platform | null;
  app: AppConfig;
}

const extensionOf = (filename: string) => filename.split(".").pop()?.toLowerCase() ?? "";

/** A platform's files in the order the card offers them. */
const assetsFor = (assets: Asset[], platform: Platform) =>
  assets
    .filter((asset) => asset.platform === platform)
    .sort((a, b) => {
      const rank = (asset: Asset) => {
        const index = FILE_FORMATS.findIndex((f) => f.extension === extensionOf(asset.filename));
        return index === -1 ? FILE_FORMATS.length : index;
      };
      return rank(a) - rank(b) || a.filename.localeCompare(b.filename);
    });

/** What a file is, in the reader's terms: its format, and its processor where that matters. */
const describeFile = (asset: Asset) => {
  const format =
    FILE_FORMATS.find((f) => f.extension === extensionOf(asset.filename))?.label ?? asset.filename;
  const arch =
    asset.platform === "macos"
      ? MAC_ARCH_LABELS[asset.arch]
      : asset.arch === "x64"
        ? null
        : ARCH_LABELS[asset.arch];
  return { format, arch };
};

/**
 * The download card for one platform.
 *
 * The checksum is shown rather than hidden behind a "verify" link, because the
 * installers are unsigned: the hash is the only way a person can tell they got
 * what we published, and a verification step nobody can see is one nobody does.
 *
 * A platform can have more than one file — Linux has an AppImage, a .deb and
 * an .rpm — and each gets its own size, checksum and button, the first one
 * loudest. A Mac build says which processor it is for, because an
 * Apple-silicon disk image will not open on an Intel Mac.
 */
const PlatformCard: FC<{
  info: (typeof PLATFORM_INFO)[number];
  assets: Asset[];
  highlighted: boolean;
}> = ({ info, assets, highlighted }) => (
  <Card
    tone={highlighted ? "floating" : "raised"}
    lift
    class={`flex h-full flex-col p-7 ${
      highlighted ? "outline-2 outline-offset-4 outline-primary/40 outline-dashed" : ""
    }`}
  >
    <div class="flex items-start justify-between gap-3">
      <IconTile icon={info.icon} size="lg" />
      {highlighted ? <Badge tone="primary">Looks like your system</Badge> : null}
    </div>

    <h2 class="mt-5 text-2xl">{info.name}</h2>
    <p class="mt-1 text-sm text-muted-foreground">{info.requirement}</p>

    {assets.length > 0 ? (
      <ul class="mt-5 flex flex-1 flex-col gap-4">
        {assets.map((asset, index) => {
          const { format, arch } = describeFile(asset);
          return (
            <li class="flex flex-col gap-3">
              <dl class="clay-well space-y-1.5 rounded-[1.1rem] p-4 text-sm">
                <div class="flex justify-between gap-3">
                  <dt class="text-muted-foreground">Format</dt>
                  <dd class="text-right font-medium">{format}</dd>
                </div>
                {arch ? (
                  <div class="flex justify-between gap-3">
                    <dt class="text-muted-foreground">For</dt>
                    <dd class="text-right font-medium">{arch}</dd>
                  </div>
                ) : null}
                <div class="flex justify-between gap-3">
                  <dt class="text-muted-foreground">Size</dt>
                  <dd class="font-medium tabular" translate="no">
                    {formatBytes(asset.sizeBytes)}
                  </dd>
                </div>
                {asset.sha256 ? (
                  <div class="pt-2">
                    <dt class="text-xs text-muted-foreground">SHA-256</dt>
                    <dd
                      class="mt-1 wrap-anywhere font-mono text-xs leading-relaxed text-muted-foreground"
                      translate="no"
                    >
                      {asset.sha256}
                    </dd>
                  </div>
                ) : null}
              </dl>
              <LinkButton
                href={`/downloads/${asset.id}`}
                size={index === 0 ? "lg" : "default"}
                variant={index === 0 ? undefined : "outline"}
                class="w-full"
              >
                <i data-lucide="download" class="h-4 w-4" aria-hidden="true"></i>
                {assets.length === 1 ? <>Download for {info.name}</> : <>Download {format}</>}
              </LinkButton>
            </li>
          );
        })}
      </ul>
    ) : (
      <>
        <p class="mt-5 flex-1 text-sm leading-relaxed text-muted-foreground text-pretty">
          No build up for this one yet.
        </p>
        <LinkButton href="/contact?topic=support" variant="outline" class="mt-6 w-full">
          Tell us you need it
        </LinkButton>
      </>
    )}
  </Card>
);

/** One row per release, every file linked. Shared by both download pages. */
const ReleaseArchive: FC<{ releases: ReleaseWithAssets[]; app: AppConfig }> = ({
  releases,
  app,
}) => (
  <TableFrame>
    <table class="w-full min-w-[32rem] border-collapse text-left">
      <thead>
        <tr class="border-b border-border bg-muted/60">
          <th scope="col" class="px-5 py-3 text-sm font-semibold">
            Version
          </th>
          <th scope="col" class="px-5 py-3 text-sm font-semibold">
            Released
          </th>
          <th scope="col" class="px-5 py-3 text-sm font-semibold">
            Installers
          </th>
        </tr>
      </thead>
      <tbody>
        {releases.map((rel) => (
          <tr class="border-b border-border last:border-0">
            <th
              scope="row"
              class="px-5 py-3.5 font-mono text-sm font-semibold tabular"
              translate="no"
            >
              {rel.version}
            </th>
            <td class="px-5 py-3.5 text-sm text-muted-foreground" translate="no">
              {rel.publishedAt ? formatDateShort(rel.publishedAt, app.locale) : "—"}
            </td>
            <td class="px-5 py-3.5">
              <div class="flex flex-wrap gap-3">
                {rel.assets.length === 0 ? (
                  <span class="text-sm text-muted-foreground">None</span>
                ) : (
                  PLATFORM_INFO.flatMap((info) =>
                    assetsFor(rel.assets, info.id).map((asset, index, all) => (
                      <a
                        href={`/downloads/${asset.id}`}
                        class="text-sm font-medium text-primary underline underline-offset-4"
                      >
                        {all.length === 1
                          ? info.name
                          : `${info.name} ${extensionOf(asset.filename) === "appimage" ? "AppImage" : `.${extensionOf(asset.filename)}`}`}
                      </a>
                    )),
                  )
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </TableFrame>
);

/** Shown before anything has ever been published. Honest, not a fake button. */
const NoReleases: FC = () => (
  <Card class="px-6 py-16 text-center">
    <span class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted text-muted-foreground shadow-inset">
      <i data-lucide="package" class="float h-8 w-8" aria-hidden="true"></i>
    </span>
    <h2 class="mt-6 text-4xl">
      Not <em>quite</em> yet
    </h2>
    <p class="mx-auto mt-3 max-w-lg leading-relaxed text-muted-foreground text-pretty">
      Zipr is early and the installers aren't up here yet. Leave us a line and we'll tell you the
      moment there's something to install — no list, no newsletter, just the one email.
    </p>
    <div class="mt-7 flex flex-wrap justify-center gap-3">
      <LinkButton href="/contact?topic=support" size="lg">
        Tell me when it's ready
      </LinkButton>
      <LinkButton href="/features" variant="outline" size="lg">
        See what it does
      </LinkButton>
    </div>
  </Card>
);

/**
 * Which build to have, as a switch under the heading — the way a distribution
 * offers its long-term release and its latest one side by side. Only when
 * there is an experimental build to switch to, and stable is the one already
 * chosen: the other is a jump to its section, not a second page.
 */
const ChannelSwitch: FC<{ stable: ReleaseWithAssets | null; experimental: ReleaseWithAssets }> = ({
  stable,
  experimental,
}) => (
  <nav
    aria-label="Which build"
    class="mx-auto mb-8 grid w-full max-w-md grid-cols-2 gap-1 rounded-[1.25rem] bg-muted p-1 text-sm shadow-inset"
  >
    <span
      aria-current="true"
      class="flex min-w-0 flex-col items-center rounded-2xl bg-surface px-3 py-2 shadow-sm"
    >
      <span class="inline-flex items-center gap-2 font-semibold">
        <i data-lucide="circle-check" class="h-3.5 w-3.5 text-success" aria-hidden="true"></i>
        Stable
      </span>
      {stable ? (
        <span
          class="max-w-full truncate font-mono text-xs text-muted-foreground tabular"
          translate="no"
        >
          {stable.version}
        </span>
      ) : null}
    </span>
    <a
      href="#experimental"
      class="flex min-w-0 flex-col items-center rounded-2xl px-3 py-2 text-muted-foreground transition hover:bg-surface/60 hover:text-foreground"
    >
      <span class="inline-flex items-center gap-2 font-medium">
        <i data-lucide="flask-conical" class="h-3.5 w-3.5 text-warning" aria-hidden="true"></i>
        Experimental
      </span>
      <span class="max-w-full truncate font-mono text-xs tabular" translate="no">
        {experimental.version}
      </span>
    </a>
  </nav>
);

/**
 * An experimental build's files as a table — platform, file, size, checksum,
 * a button — the way a project that ships many files lists them. Denser than
 * the stable cards on purpose: someone here knows what they want, and the
 * page should not make an experimental build look like the main event.
 */
const FileTable: FC<{ build: ReleaseWithAssets }> = ({ build }) => (
  <>
    {/* A table from tablet width up; a phone gets the same files as a stack
        of rows instead, because five columns do not fit in 390 pixels and a
        table that scrolls sideways hides the button. */}
    <div class="hidden md:block">
      <TableFrame>
        <table class="w-full min-w-[44rem] border-collapse text-left text-sm">
          <thead>
            <tr class="border-b border-border bg-muted/60">
              <th scope="col" class="px-5 py-3 font-semibold">
                Platform
              </th>
              <th scope="col" class="px-5 py-3 font-semibold">
                File
              </th>
              <th scope="col" class="px-5 py-3 font-semibold">
                Size
              </th>
              <th scope="col" class="px-5 py-3 font-semibold">
                SHA-256
              </th>
              <th scope="col" class="px-5 py-3">
                <span class="sr-only">Download</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {PLATFORM_INFO.flatMap((info) =>
              assetsFor(build.assets, info.id).map((asset, index) => {
                const { format, arch } = describeFile(asset);
                return (
                  <tr class="border-b border-border align-top last:border-0">
                    {index === 0 ? (
                      <th scope="row" class="px-5 py-3.5 font-semibold">
                        <span class="inline-flex items-center gap-2">
                          <i
                            data-lucide={info.icon}
                            class="h-4 w-4 text-muted-foreground"
                            aria-hidden="true"
                          ></i>
                          {info.name}
                        </span>
                      </th>
                    ) : (
                      <td class="px-5 py-3.5">
                        <span class="sr-only">{info.name}</span>
                      </td>
                    )}
                    <td class="px-5 py-3.5">
                      <div class="font-medium">{format}</div>
                      {arch ? <div class="text-xs text-muted-foreground">{arch}</div> : null}
                      <div class="mt-0.5 font-mono text-xs text-muted-foreground" translate="no">
                        {asset.filename}
                      </div>
                    </td>
                    <td
                      class="whitespace-nowrap px-5 py-3.5 tabular text-muted-foreground"
                      translate="no"
                    >
                      {formatBytes(asset.sizeBytes)}
                    </td>
                    <td class="px-5 py-3.5">
                      {asset.sha256 ? (
                        <code
                          class="block max-w-[16rem] wrap-anywhere font-mono text-xs leading-relaxed text-muted-foreground"
                          translate="no"
                        >
                          {asset.sha256}
                        </code>
                      ) : null}
                    </td>
                    <td class="px-5 py-3.5 text-right">
                      <LinkButton href={`/downloads/${asset.id}`} variant="outline">
                        <i data-lucide="download" class="h-4 w-4" aria-hidden="true"></i>
                        Download
                        {/* Which file, for a screen reader: its own name, which says
                          platform, version and format, and needs no translating. */}
                        <span class="sr-only" translate="no">
                          {" "}
                          {asset.filename}
                        </span>
                      </LinkButton>
                    </td>
                  </tr>
                );
              }),
            )}
          </tbody>
        </table>
      </TableFrame>
    </div>
    <ul class="grid gap-3 md:hidden">
      {PLATFORM_INFO.flatMap((info) =>
        assetsFor(build.assets, info.id).map((asset) => {
          const { format, arch } = describeFile(asset);
          return (
            <li>
              <Card class="p-4">
                {/* Name and format as separate elements, so each is translated
                    once rather than as a sentence per file. */}
                <div class="flex flex-wrap items-center gap-x-2 text-sm">
                  <i
                    data-lucide={info.icon}
                    class="h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  ></i>
                  <div class="font-semibold">{info.name}</div>
                  <div class="text-muted-foreground">{format}</div>
                </div>
                {arch ? <div class="mt-1 text-xs text-muted-foreground">{arch}</div> : null}
                <div class="mt-2 break-all font-mono text-xs text-muted-foreground" translate="no">
                  {asset.filename}
                </div>
                <dl class="mt-3 space-y-1 text-xs">
                  <div class="flex justify-between gap-3">
                    <dt class="text-muted-foreground">Size</dt>
                    <dd class="font-medium tabular" translate="no">
                      {formatBytes(asset.sizeBytes)}
                    </dd>
                  </div>
                  {asset.sha256 ? (
                    <div>
                      <dt class="text-muted-foreground">SHA-256</dt>
                      <dd
                        class="mt-0.5 wrap-anywhere font-mono leading-relaxed text-muted-foreground"
                        translate="no"
                      >
                        {asset.sha256}
                      </dd>
                    </div>
                  ) : null}
                </dl>
                <LinkButton href={`/downloads/${asset.id}`} variant="outline" class="mt-3 w-full">
                  <i data-lucide="download" class="h-4 w-4" aria-hidden="true"></i>
                  Download
                  <span class="sr-only" translate="no">
                    {" "}
                    {asset.filename}
                  </span>
                </LinkButton>
              </Card>
            </li>
          );
        }),
      )}
    </ul>
  </>
);

/**
 * Experimental builds, as a section of the downloads page rather than a page
 * of their own. What a person should know before installing one comes before
 * the files, not after; earlier builds fold away; and when there is none, the
 * section says so in a line rather than disappearing, so a link to
 * `#experimental` always lands somewhere.
 */
const ExperimentalSection: FC<{ builds: ReleaseWithAssets[]; app: AppConfig }> = ({
  builds,
  app,
}) => {
  const [latest, ...earlier] = builds;
  return (
    <Section id="experimental" tone="muted">
      <Container size="wide">
        <SectionHeading
          eyebrow="Experimental builds"
          title="Try what’s next"
          lede="Builds straight from development, put up as they’re made. They’re for trying things early and telling us what broke — the stable version at the top of this page is the one to install."
        />

        <ul class="mb-8 grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {EXPERIMENTAL_NOTES.map((note) => (
            <li class="flex items-start gap-3">
              <i
                data-lucide={note.icon}
                class="mt-0.5 h-5 w-5 shrink-0 text-warning"
                aria-hidden="true"
              ></i>
              <p class="text-sm leading-relaxed text-muted-foreground text-pretty">{note.text}</p>
            </li>
          ))}
        </ul>

        {latest ? (
          <>
            <div class="mb-4 flex flex-wrap items-center gap-3">
              <Badge tone="warning">
                <i data-lucide="flask-conical" class="h-3 w-3" aria-hidden="true"></i>
                Experimental{" "}
                <span class="tabular" translate="no">
                  {latest.version}
                </span>
              </Badge>
              {latest.publishedAt ? (
                <span class="text-sm text-muted-foreground">
                  Built{" "}
                  <span translate="no">{formatDateShort(latest.publishedAt, app.locale)}</span>
                </span>
              ) : null}
              {/* Written by the pipeline or whoever published it, and not the
                  site's own copy: left as written. */}
              {latest.notes ? (
                <span class="text-sm text-muted-foreground" translate="no">
                  {latest.notes}
                </span>
              ) : null}
            </div>

            <FileTable build={latest} />

            {earlier.length > 0 ? (
              <div class="mt-8">
                <Disclosure question="Earlier experimental builds">
                  <p class="mb-4 text-sm">
                    Kept so a problem can be traced to the build that brought it. Install the newest
                    unless you’re doing exactly that.
                  </p>
                  <ReleaseArchive releases={earlier} app={app} />
                </Disclosure>
              </div>
            ) : null}

            <p class="mt-8 text-sm text-muted-foreground text-pretty">
              Found something broken? That’s what these builds are for.{" "}
              <a
                href="/contact?topic=support"
                class="font-medium text-primary underline underline-offset-4"
              >
                Tell us
              </a>{" "}
              which build, which platform, and what you did. Settings in the app can save a
              diagnostics file that says exactly which build you’re running.
            </p>
          </>
        ) : (
          <Card class="flex items-center gap-4 p-6">
            <i
              data-lucide="flask-conical"
              class="h-6 w-6 text-muted-foreground"
              aria-hidden="true"
            ></i>
            <p class="text-sm leading-relaxed text-muted-foreground text-pretty">
              No experimental build right now. The stable version at the top of this page is the one
              to install.
            </p>
          </Card>
        )}
      </Container>
    </Section>
  );
};

export const DownloadsPage: FC<DownloadsProps> = ({
  latest,
  previous,
  experimental,
  detected,
  app,
}) => (
  <Page>
    <Section class="pt-12 sm:pt-20">
      <Container size="wide">
        <SectionHeading
          as="h1"
          align="center"
          eyebrow="Downloads"
          title="Install Zipr"
          lede="Free, no account, about a minute. Everything you make stays on your machine until you decide otherwise."
        />

        {experimental[0] ? <ChannelSwitch stable={latest} experimental={experimental[0]} /> : null}

        {latest ? (
          <>
            <div class="mb-8 flex flex-wrap items-center justify-center gap-3">
              <Badge tone="success">
                <i data-lucide="circle-check" class="h-3 w-3" aria-hidden="true"></i>
                Version{" "}
                <span class="tabular" translate="no">
                  {latest.version}
                </span>
              </Badge>
              {latest.publishedAt ? (
                <span class="text-sm text-muted-foreground">
                  Released{" "}
                  <span translate="no">{formatDateShort(latest.publishedAt, app.locale)}</span>
                </span>
              ) : null}
            </div>

            <div class="grid gap-6 md:grid-cols-3">
              {PLATFORM_INFO.map((info) => (
                <PlatformCard
                  info={info}
                  assets={assetsFor(latest.assets, info.id)}
                  highlighted={detected === info.id}
                />
              ))}
            </div>

            {/* Shown only once a licence exists — see LEGAL.licenceUrl. An
                acceptance line pointing at nothing would be worse than none. */}
            {LEGAL.licenceUrl ? (
              <p class="mt-6 text-center text-sm text-muted-foreground text-pretty">
                Zipr is licensed to you under the{" "}
                <a
                  href={LEGAL.licenceUrl}
                  class="font-medium text-primary underline underline-offset-4"
                >
                  Zipr licence
                </a>
                . By downloading or installing it, you agree to its terms.
              </p>
            ) : null}
          </>
        ) : (
          <NoReleases />
        )}
      </Container>
    </Section>

    {/* ================= BEFORE YOU INSTALL ================= */}
    <Section tone="muted">
      <Container>
        <SectionHeading eyebrow="Before you install" title="Three things worth knowing" />
        <div class="grid gap-5 md:grid-cols-3">
          {INSTALL_NOTES.map((note) => (
            <Card class="p-6">
              <i data-lucide="info" class="h-5 w-5 text-info" aria-hidden="true"></i>
              <p class="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">{note}</p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>

    {/* ================= RELEASE NOTES ================= */}
    {latest?.notes ? (
      <Section>
        <Container size="prose">
          <SectionHeading
            eyebrow="Release notes"
            title={
              <>
                What changed in <span translate="no">{latest.version}</span>
              </>
            }
          />
          <Card class="p-7">
            {/* Written by whoever published the release, in English, and not
                part of the site's own copy: it is left as written. */}
            <div
              class="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground"
              translate="no"
            >
              {latest.notes}
            </div>
          </Card>
        </Container>
      </Section>
    ) : null}

    {/* ================= OLDER ================= */}
    {previous.length > 0 ? (
      <Section>
        <Container>
          <SectionHeading
            eyebrow="Archive"
            title="Earlier versions"
            lede="In case you need to go back. Run the newest unless you have a reason not to."
          />

          <ReleaseArchive releases={previous} app={app} />
        </Container>
      </Section>
    ) : null}

    {/* ================= EXPERIMENTAL ================= */}
    <ExperimentalSection builds={experimental} app={app} />

    <CtaBand
      title="That’s it. Nothing else to do."
      body="No sign-up, no licence key, no clock counting down. Come back the day your team wants what you’ve built."
      primary={{ href: "/features", label: "What it can do" }}
      secondary={{ href: "/pricing", label: "What a team costs" }}
    />
  </Page>
);
