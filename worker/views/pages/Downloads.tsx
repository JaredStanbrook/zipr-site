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
  IconTile,
  TableFrame,
} from "@views/components/Ui";

type Asset = ReleaseWithAssets["assets"][number];

interface DownloadsProps {
  /** The newest **stable** release. Experimental builds never lead here. */
  latest: ReleaseWithAssets | null;
  previous: ReleaseWithAssets[];
  /** The newest experimental build, if any, for the pointer to its page. */
  experimental: ReleaseWithAssets | null;
  /** Guessed from the user-agent so the right card leads. Never trusted. */
  detected: Platform | null;
  app: AppConfig;
}

interface ExperimentalProps {
  latest: ReleaseWithAssets | null;
  previous: ReleaseWithAssets[];
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
 * The way from the stable page to the experimental one: only when there is an
 * experimental build to go to, and worded so nobody mistakes it for the
 * version they should install.
 */
const ExperimentalPointer: FC<{ build: ReleaseWithAssets; app: AppConfig }> = ({ build, app }) => (
  <Card class="mt-10 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
    <div class="flex items-start gap-4">
      <IconTile icon="flask-conical" />
      <div>
        <p class="font-semibold">Want to try what’s next?</p>
        <p class="mt-1 text-sm leading-relaxed text-muted-foreground text-pretty">
          Experimental build{" "}
          <span class="font-mono tabular" translate="no">
            {build.version}
          </span>{" "}
          is up
          {build.publishedAt ? (
            <>
              {" "}
              since <span translate="no">{formatDateShort(build.publishedAt, app.locale)}</span>
            </>
          ) : null}
          . It’s unfinished, and not for work you can’t afford to lose.
        </p>
      </div>
    </div>
    <LinkButton href="/downloads/experimental" variant="outline" class="shrink-0">
      See experimental builds
      <i data-lucide="chevron-right" class="h-4 w-4" aria-hidden="true"></i>
    </LinkButton>
  </Card>
);

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

        {experimental ? <ExperimentalPointer build={experimental} app={app} /> : null}
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
      <Section tone={latest?.notes ? "muted" : "default"}>
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

    <CtaBand
      title="That’s it. Nothing else to do."
      body="No sign-up, no licence key, no clock counting down. Come back the day your team wants what you’ve built."
      primary={{ href: "/features", label: "What it can do" }}
      secondary={{ href: "/pricing", label: "What a team costs" }}
    />
  </Page>
);

/**
 * /downloads/experimental: builds from development, kept apart from the
 * stable page on purpose.
 *
 * What a person needs to know before installing one comes before the button,
 * not after it — that it is unfinished, that nothing carries over between
 * builds yet, that it is unsigned, and that nothing updates it. The page is
 * kept out of search results: nobody should land on an experimental build
 * looking for Zipr.
 */
export const ExperimentalDownloadsPage: FC<ExperimentalProps> = ({
  latest,
  previous,
  detected,
  app,
}) => (
  <Page>
    <Section class="pt-12 sm:pt-20">
      <Container size="wide">
        <SectionHeading
          as="h1"
          align="center"
          eyebrow="Experimental builds"
          title="Try what’s next"
          lede="Builds straight from development, put up as they’re made. They’re for trying things early and telling us what broke — the stable version is on the main downloads page."
        />

        <div class="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {EXPERIMENTAL_NOTES.map((note) => (
            <Card class="p-5">
              <i data-lucide={note.icon} class="h-5 w-5 text-warning" aria-hidden="true"></i>
              <p class="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">
                {note.text}
              </p>
            </Card>
          ))}
        </div>

        {latest ? (
          <>
            <div class="mb-8 flex flex-wrap items-center justify-center gap-3">
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
          <Card class="px-6 py-14 text-center">
            <span class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground shadow-inset">
              <i data-lucide="flask-conical" class="h-7 w-7" aria-hidden="true"></i>
            </span>
            <h2 class="mt-5 text-3xl">No experimental build right now</h2>
            <p class="mx-auto mt-3 max-w-lg leading-relaxed text-muted-foreground text-pretty">
              There’s nothing between releases up at the moment. The stable version is the one to
              install.
            </p>
            <div class="mt-6 flex justify-center">
              <LinkButton href="/downloads" size="lg">
                Go to downloads
              </LinkButton>
            </div>
          </Card>
        )}
      </Container>
    </Section>

    {latest?.notes ? (
      <Section tone="muted">
        <Container size="prose">
          <SectionHeading
            eyebrow="What’s in it"
            title={
              <>
                Notes for <span translate="no">{latest.version}</span>
              </>
            }
          />
          <Card class="p-7">
            {/* Written by the pipeline or whoever published it, and not the
                site's own copy: left as written. */}
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

    {previous.length > 0 ? (
      <Section tone={latest?.notes ? "default" : "muted"}>
        <Container>
          <SectionHeading
            eyebrow="Archive"
            title="Earlier experimental builds"
            lede="Kept so a problem can be traced to the build that brought it. Install the newest unless you’re doing exactly that."
          />
          <ReleaseArchive releases={previous} app={app} />
        </Container>
      </Section>
    ) : null}

    <CtaBand
      title="Found something broken?"
      body="That’s what these builds are for. Tell us which build, which platform, and what you did. Settings in the app can save a diagnostics file that says exactly which build you’re running."
      primary={{ href: "/contact?topic=support", label: "Report a problem" }}
      secondary={{ href: "/downloads", label: "Back to the stable version" }}
    />
  </Page>
);
