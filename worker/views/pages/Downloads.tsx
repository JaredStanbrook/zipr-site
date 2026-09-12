import type { FC } from "hono/jsx";

import type { AppConfig } from "@server/config/app.config";
import type { ReleaseWithAssets, Platform } from "@server/schema/release.schema";
import { PLATFORM_INFO, INSTALL_NOTES, REPOS } from "@server/content/site";
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
} from "@views/components/Ui";

interface DownloadsProps {
  latest: ReleaseWithAssets | null;
  previous: ReleaseWithAssets[];
  /** Guessed from the user-agent so the right card leads. Never trusted. */
  detected: Platform | null;
  app: AppConfig;
}

/**
 * The download card for one platform.
 *
 * The checksum is shown rather than hidden behind a "verify" link, because the
 * installers are unsigned: the hash is the only way a person can tell they got
 * what we published, and a verification step nobody can see is one nobody does.
 */
const PlatformCard: FC<{
  info: (typeof PLATFORM_INFO)[number];
  asset: ReleaseWithAssets["assets"][number] | undefined;
  highlighted: boolean;
}> = ({ info, asset, highlighted }) => (
  <Card class={`flex h-full flex-col p-6 ${highlighted ? "ring-2 ring-primary" : ""}`}>
    <div class="flex items-start justify-between gap-3">
      <span class="flex h-11 w-11 items-center justify-center rounded-[var(--radius-sm)] bg-primary-subtle text-primary-subtle-foreground">
        <i data-lucide={info.icon} class="h-5 w-5" aria-hidden="true"></i>
      </span>
      {highlighted ? <Badge tone="primary">Looks like your system</Badge> : null}
    </div>

    <h3 class="mt-4 text-lg font-bold">{info.name}</h3>
    <p class="mt-1 text-sm text-muted-foreground">{info.requirement}</p>

    <div class="mt-5 flex-1">
      {asset ? (
        <dl class="space-y-1.5 text-sm">
          <div class="flex justify-between gap-3">
            <dt class="text-muted-foreground">Format</dt>
            <dd class="font-medium">{info.format}</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-muted-foreground">Size</dt>
            <dd class="font-medium tabular">{formatBytes(asset.sizeBytes)}</dd>
          </div>
          {asset.sha256 ? (
            <div class="pt-2">
              <dt class="text-xs text-muted-foreground">SHA-256</dt>
              <dd class="mt-1 wrap-anywhere font-mono text-xs leading-relaxed text-muted-foreground">
                {asset.sha256}
              </dd>
            </div>
          ) : null}
        </dl>
      ) : (
        <p class="text-sm leading-relaxed text-muted-foreground text-pretty">
          {info.available
            ? "No build published for this platform yet."
            : "There is no installer for Linux. The client builds and runs there — the desktop bundle simply has no Linux target configured, so there is nothing to hand you. Build it from source and it works."}
        </p>
      )}
    </div>

    {asset ? (
      <LinkButton href={`/downloads/${asset.id}`} size="lg" class="mt-6 w-full">
        <i data-lucide="download" class="h-4 w-4" aria-hidden="true"></i>
        Download for {info.name}
      </LinkButton>
    ) : info.available ? (
      <LinkButton href="/contact?topic=support" variant="outline" class="mt-6 w-full">
        Tell us you need it
      </LinkButton>
    ) : REPOS.showRepoLinks ? (
      <LinkButton
        href={REPOS.client}
        variant="outline"
        class="mt-6 w-full"
        rel="noopener noreferrer"
        target="_blank"
      >
        Build from source
        <i data-lucide="external-link" class="h-4 w-4" aria-hidden="true"></i>
      </LinkButton>
    ) : null}
  </Card>
);

/** Shown before anything has ever been published. Honest, not a fake button. */
const NoReleases: FC = () => (
  <Card class="px-6 py-14 text-center">
    <span class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
      <i data-lucide="package" class="h-6 w-6" aria-hidden="true"></i>
    </span>
    <h2 class="mt-5 text-2xl font-bold">No build published yet</h2>
    <p class="mx-auto mt-3 max-w-lg leading-relaxed text-muted-foreground text-pretty">
      Zipr is early, and the installers are not up here yet. Leave us a note and we will mail you
      the moment there is something to install — or build it from source today.
    </p>
    <div class="mt-7 flex flex-wrap justify-center gap-3">
      <LinkButton href="/contact?topic=support" size="lg">
        Tell me when it is ready
      </LinkButton>
      {REPOS.showRepoLinks ? (
        <LinkButton
          href={REPOS.client}
          variant="outline"
          size="lg"
          rel="noopener noreferrer"
          target="_blank"
        >
          Build from source
          <i data-lucide="external-link" class="h-4 w-4" aria-hidden="true"></i>
        </LinkButton>
      ) : null}
    </div>
  </Card>
);

export const DownloadsPage: FC<DownloadsProps> = ({ latest, previous, detected, app }) => (
  <Page>
    <Section class="pt-12 sm:pt-20">
      <Container size="wide">
        <SectionHeading
          as="h1"
          align="center"
          eyebrow="Downloads"
          title="Install Zipr"
          lede="Free, no account, and no network request until you point it at a deployment. Everything you make stays on this machine until you decide otherwise."
        />

        {latest ? (
          <>
            <div class="mb-8 flex flex-wrap items-center justify-center gap-3">
              <Badge tone="success">
                <i data-lucide="circle-check" class="h-3 w-3" aria-hidden="true"></i>
                Version <span class="tabular">{latest.version}</span>
              </Badge>
              {latest.channel === "beta" ? <Badge tone="warning">Beta channel</Badge> : null}
              {latest.publishedAt ? (
                <span class="text-sm text-muted-foreground">
                  Released {formatDateShort(latest.publishedAt, app.locale)}
                </span>
              ) : null}
            </div>

            <div class="grid gap-6 md:grid-cols-3">
              {PLATFORM_INFO.map((info) => (
                <PlatformCard
                  info={info}
                  asset={latest.assets.find((a) => a.platform === info.id)}
                  highlighted={detected === info.id}
                />
              ))}
            </div>
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
            <Card tone="flat" class="p-6">
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
          <SectionHeading eyebrow="Release notes" title={`What changed in ${latest.version}`} />
          <Card class="p-7">
            <div class="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
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
            lede="Kept so a rollback is possible. Run the newest one unless you have a reason not to."
          />

          <div class="overflow-x-auto rounded-[var(--radius-lg)] border border-border bg-card">
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
                {previous.map((rel) => (
                  <tr class="border-b border-border last:border-0">
                    <th scope="row" class="px-5 py-3.5 font-mono text-sm font-semibold tabular">
                      {rel.version}
                      {rel.channel === "beta" ? (
                        <Badge tone="warning" class="ml-2">
                          beta
                        </Badge>
                      ) : null}
                    </th>
                    <td class="px-5 py-3.5 text-sm text-muted-foreground">
                      {rel.publishedAt ? formatDateShort(rel.publishedAt, app.locale) : "—"}
                    </td>
                    <td class="px-5 py-3.5">
                      <div class="flex flex-wrap gap-3">
                        {rel.assets.length === 0 ? (
                          <span class="text-sm text-muted-foreground">None</span>
                        ) : (
                          rel.assets.map((asset) => (
                            <a
                              href={`/downloads/${asset.id}`}
                              class="text-sm font-medium text-primary underline underline-offset-4"
                            >
                              {PLATFORM_INFO.find((p) => p.id === asset.platform)?.name ??
                                asset.platform}
                            </a>
                          ))
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </Section>
    ) : null}

    <CtaBand
      title="Installed it? There is nothing else to do."
      body="No sign-up, no licence key, no trial clock. When your team needs the same catalogue, that is when the API enters the picture."
      primary={{ href: "/features", label: "What it can do" }}
      secondary={{ href: "/pricing", label: "What a team costs" }}
    />
  </Page>
);
