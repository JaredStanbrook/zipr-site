import type { FC } from "hono/jsx";

import type { AppConfig } from "@server/config/app.config";
import type { ReleaseWithAssets, Platform } from "@server/schema/release.schema";
import { PLATFORM_INFO, INSTALL_NOTES } from "@server/content/site";
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
      <IconTile icon={info.icon} />
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
            ? "No build up for this one yet."
            : "No Linux installer yet. It's on the list — tell us you want it and it moves up."}
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
    ) : (
      <LinkButton href="/contact?topic=support" variant="outline" class="mt-6 w-full">
        Ask us about Linux
      </LinkButton>
    )}
  </Card>
);

/** Shown before anything has ever been published. Honest, not a fake button. */
const NoReleases: FC = () => (
  <Card class="px-6 py-14 text-center">
    <span class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground shadow-inset">
      <i data-lucide="package" class="h-6 w-6" aria-hidden="true"></i>
    </span>
    <h2 class="mt-5 text-2xl font-bold">Not quite yet</h2>
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

export const DownloadsPage: FC<DownloadsProps> = ({ latest, previous, detected, app }) => (
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
            lede="In case you need to go back. Run the newest unless you have a reason not to."
          />

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
          </TableFrame>
        </Container>
      </Section>
    ) : null}

    <CtaBand
      title="That\u2019s it. Nothing else to do."
      body="No sign-up, no licence key, no clock counting down. Come back the day your team wants what you\u2019ve built."
      primary={{ href: "/features", label: "What it can do" }}
      secondary={{ href: "/pricing", label: "What a team costs" }}
    />
  </Page>
);
