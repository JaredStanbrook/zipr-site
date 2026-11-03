import type { FC } from "hono/jsx";

import type { AppConfig } from "@server/config/app.config";
import type { ReleaseWithAssets, Platform } from "@server/schema/release.schema";
import { PLATFORM_INFO, FILE_FORMATS, ARCH_LABELS, MAC_ARCH_LABELS } from "@server/content/site";
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
 * The download card for one platform: its name, what it runs on, and a
 * button per file, each with one short line saying what the file is. Written
 * for someone who just wants the app, so no checksums or file names here;
 * those are in the "Earlier versions" table for anyone who wants them.
 *
 * Linux can have more than one file (AppImage, .deb, .rpm); the first is the
 * loud button. A Mac build says which processor it is for, because an
 * Apple-silicon disk image will not open on an Intel Mac. `quiet` makes every
 * button an outline one, for the experimental builds.
 */
const PlatformCard: FC<{
  info: (typeof PLATFORM_INFO)[number];
  assets: Asset[];
  highlighted: boolean;
  quiet?: boolean;
}> = ({ info, assets, highlighted, quiet = false }) => (
  <Card class="flex h-full flex-col p-7">
    <div class="flex items-start justify-between gap-3">
      <IconTile icon={info.icon} size="lg" />
      {highlighted ? <Badge tone="primary">Your system</Badge> : null}
    </div>

    <h2 class="mt-5 text-2xl">{info.name}</h2>
    <p class="mt-1 text-sm text-muted-foreground">{info.requirement}</p>

    {assets.length > 0 ? (
      <ul class="mt-6 flex flex-1 flex-col justify-end gap-4">
        {assets.map((asset, index) => {
          const { format, arch } = describeFile(asset);
          return (
            <li>
              <LinkButton
                href={`/downloads/${asset.id}`}
                size={index === 0 && !quiet ? "lg" : "default"}
                variant={index === 0 && !quiet ? undefined : "outline"}
                class="w-full"
              >
                <i data-lucide="download" class="h-4 w-4" aria-hidden="true"></i>
                {assets.length === 1 ? <>Download for {info.name}</> : <>Download {format}</>}
              </LinkButton>
              <p class="mt-1.5 text-center text-xs text-muted-foreground">
                {assets.length === 1 ? <span>{format}</span> : null}
                {arch ? (
                  <>
                    {assets.length === 1 ? " · " : null}
                    <span>{arch}</span>
                  </>
                ) : null}
                {assets.length === 1 || arch ? " · " : null}
                <span class="tabular" translate="no">
                  {formatBytes(asset.sizeBytes)}
                </span>
              </p>
            </li>
          );
        })}
      </ul>
    ) : (
      <>
        <p class="mt-5 flex-1 text-sm leading-relaxed text-muted-foreground text-pretty">
          Not available yet.
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
              {rel.publishedAt ? formatDateShort(rel.publishedAt, app.locale) : "Not yet"}
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
      moment there's something to install: no list, no newsletter, just the one email.
    </p>
    <div class="mt-7 flex flex-wrap justify-center gap-3">
      <LinkButton href="/contact?topic=support" size="lg">
        Tell me when it's ready
      </LinkButton>
      <LinkButton href="/toolbox" variant="outline" size="lg">
        See what it does
      </LinkButton>
    </div>
  </Card>
);

/**
 * Experimental builds: one sentence on what they are, then the same plain
 * cards as the stable build, with quieter buttons. When there is none, the
 * section says so in a line rather than disappearing, so a link to
 * `#experimental` always lands somewhere.
 */
const ExperimentalSection: FC<{ build: ReleaseWithAssets | undefined; app: AppConfig }> = ({
  build,
  app,
}) => (
  <Section id="experimental" tone="muted">
    <Container size="wide">
      <SectionHeading
        eyebrow="Experimental"
        title="Try new features early"
        lede="These builds have the newest features, but they may have bugs. If you’re not sure, use the version at the top of this page."
      />

      {build ? (
        <>
          <p class="mb-6 text-sm text-muted-foreground">
            Version{" "}
            <span class="tabular" translate="no">
              {build.version}
            </span>
            {build.publishedAt ? (
              <>
                {" · "}
                <span translate="no">{formatDateShort(build.publishedAt, app.locale)}</span>
              </>
            ) : null}
          </p>

          <div class="grid gap-6 md:grid-cols-3">
            {PLATFORM_INFO.map((info) => (
              <PlatformCard
                info={info}
                assets={assetsFor(build.assets, info.id)}
                highlighted={false}
                quiet
              />
            ))}
          </div>

          <p class="mt-8 text-sm text-muted-foreground">
            Found a problem?{" "}
            <a
              href="/contact?topic=support"
              class="font-medium text-primary underline underline-offset-4"
            >
              Tell us
            </a>
            .
          </p>
        </>
      ) : (
        <p class="text-sm text-muted-foreground">No experimental build right now.</p>
      )}
    </Container>
  </Section>
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
          lede="Free, with no account needed. It takes about a minute."
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

            {/* The one thing worth saying before someone opens it: the
                installers are not signed yet, so the first launch shows a
                warning, and someone who is not technical will stop there
                unless told it is expected. */}
            <p class="mt-8 text-center text-sm text-muted-foreground text-pretty">
              The first time you open Zipr, your computer may ask if you’re sure. That’s normal:
              choose to open it.
            </p>

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

            {experimental[0] ? (
              <p class="mt-4 text-center text-sm">
                <a
                  href="#experimental"
                  class="font-medium text-primary underline underline-offset-4"
                >
                  Want new features early? Try an experimental build.
                </a>
              </p>
            ) : null}
          </>
        ) : (
          <NoReleases />
        )}
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
            lede="Only if you need to go back to an older version."
          />

          <ReleaseArchive releases={previous} app={app} />
        </Container>
      </Section>
    ) : null}

    {/* ================= EXPERIMENTAL ================= */}
    <ExperimentalSection build={experimental[0]} app={app} />

    <CtaBand
      title="That’s it. Nothing else to do."
      body="No sign-up, no licence key, no clock counting down. Come back the day your team wants what you’ve built."
      primary={{ href: "/toolbox", label: "What it can do" }}
      secondary={{ href: "/pricing", label: "What a team costs" }}
    />
  </Page>
);
