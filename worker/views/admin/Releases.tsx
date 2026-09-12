import type { FC } from "hono/jsx";

import type { AppConfig } from "@server/config/app.config";
import {
  PLATFORMS,
  ARCHITECTURES,
  CHANNELS,
  type ReleaseWithAssets,
} from "@server/schema/release.schema";
import { formatBytes, formatDateShort } from "@views/lib/utils";
import { Page, Container, Card, Badge, SubmitButton } from "@views/components/Ui";

/**
 * A field is a well cut into the clay, which is exactly what the client's own
 * Input component is: the fill sits below the surface and an inset shadow does
 * the rest, so a form reads as holes in the material rather than boxes drawn
 * on top of it.
 */
const FIELD_CLASS =
  "clay-field w-full px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background";

/** One release and its installers. Swapped whole when anything about it changes. */
export const ReleaseCard: FC<{ item: ReleaseWithAssets; app: AppConfig }> = ({ item, app }) => (
  <Card id={`release-${item.id}`} class="overflow-hidden p-0">
    <div class="flex flex-wrap items-center gap-3 border-b border-border bg-muted/50 px-5 py-4">
      <h2 class="font-mono text-lg font-bold tabular">{item.version}</h2>

      <Badge tone={item.channel === "beta" ? "warning" : "neutral"}>{item.channel}</Badge>

      {item.publishedAt ? (
        <Badge tone="success">
          <i data-lucide="circle-check" class="h-3 w-3" aria-hidden="true"></i>
          Live since {formatDateShort(item.publishedAt, app.locale)}
        </Badge>
      ) : (
        <Badge tone="neutral">Draft — nobody can see this</Badge>
      )}

      <div class="ml-auto flex flex-wrap items-center gap-2">
        <button
          type="button"
          hx-post={`/admin/releases/${item.id}/${item.publishedAt ? "unpublish" : "publish"}`}
          hx-target={`#release-${item.id}`}
          hx-swap="outerHTML"
          class="clay-press inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-[var(--radius-sm)] bg-primary px-3 text-xs font-semibold text-primary-foreground hover:brightness-110"
        >
          <i
            data-lucide={item.publishedAt ? "eye-off" : "upload"}
            class="h-3 w-3"
            aria-hidden="true"
          ></i>
          {item.publishedAt ? "Unpublish" : "Publish"}
        </button>

        <button
          type="button"
          hx-delete={`/admin/releases/${item.id}`}
          hx-target={`#release-${item.id}`}
          hx-swap="outerHTML"
          hx-confirm="Remove this release from the site? The installer files stay in R2."
          class="clay-press inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-[var(--radius-sm)] px-3 text-xs font-semibold text-destructive hover:bg-destructive/10"
        >
          <i data-lucide="trash-2" class="h-3 w-3" aria-hidden="true"></i>
          Remove
        </button>
      </div>
    </div>

    {/* ---------- assets ---------- */}
    {item.assets.length === 0 ? (
      <p class="px-5 py-6 text-sm text-muted-foreground">
        No installers yet. Publishing a release with nothing attached gives visitors a version
        number and no button, so add at least one below first.
      </p>
    ) : (
      <div class="overflow-x-auto">
        <table class="w-full min-w-[40rem] border-collapse text-left">
          <thead>
            <tr class="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
              <th scope="col" class="px-5 py-2.5 font-semibold">
                Platform
              </th>
              <th scope="col" class="px-5 py-2.5 font-semibold">
                File
              </th>
              <th scope="col" class="px-5 py-2.5 font-semibold">
                Size
              </th>
              <th scope="col" class="px-5 py-2.5 font-semibold">
                Downloads
              </th>
              <th scope="col" class="relative px-5 py-2.5 font-semibold">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {item.assets.map((asset) => (
              <tr id={`asset-${asset.id}`} class="border-b border-border last:border-0">
                <td class="px-5 py-3.5 text-sm font-medium whitespace-nowrap">
                  {asset.platform}
                  <span class="ml-1.5 text-xs text-muted-foreground">{asset.arch}</span>
                </td>
                <td class="max-w-[18rem] px-5 py-3.5">
                  <span class="block truncate font-mono text-xs">{asset.filename}</span>
                  {asset.sha256 ? (
                    <span class="mt-0.5 block truncate font-mono text-[0.625rem] text-muted-foreground">
                      {asset.sha256}
                    </span>
                  ) : null}
                </td>
                <td class="px-5 py-3.5 text-sm tabular whitespace-nowrap">
                  {formatBytes(asset.sizeBytes)}
                </td>
                <td class="px-5 py-3.5 text-sm tabular">{asset.downloadCount}</td>
                <td class="px-5 py-3.5 text-right">
                  <button
                    type="button"
                    hx-delete={`/admin/releases/assets/${asset.id}`}
                    hx-target={`#asset-${asset.id}`}
                    hx-swap="outerHTML"
                    hx-confirm="Delete this installer? The file is removed from R2 as well."
                    class="clay-press inline-flex h-7 cursor-pointer items-center rounded-[var(--radius-sm)] px-2 text-xs font-semibold text-destructive hover:bg-destructive/10"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}

    {/* ---------- upload ---------- */}
    <form
      hx-post={`/admin/releases/${item.id}/assets`}
      hx-encoding="multipart/form-data"
      hx-target={`#release-${item.id}`}
      hx-swap="outerHTML"
      hx-disabled-elt="find button[type='submit']"
      class="flex flex-wrap items-end gap-3 border-t border-border bg-muted/30 px-5 py-4"
    >
      <div>
        <label for={`platform-${item.id}`} class="block text-xs font-semibold">
          Platform
        </label>
        <select id={`platform-${item.id}`} name="platform" class={`${FIELD_CLASS} mt-1 w-36`}>
          {PLATFORMS.map((platform) => (
            <option value={platform}>{platform}</option>
          ))}
        </select>
      </div>

      <div>
        <label for={`arch-${item.id}`} class="block text-xs font-semibold">
          Architecture
        </label>
        <select id={`arch-${item.id}`} name="arch" class={`${FIELD_CLASS} mt-1 w-36`}>
          {ARCHITECTURES.map((arch) => (
            <option value={arch}>{arch}</option>
          ))}
        </select>
      </div>

      <div class="min-w-[14rem] flex-1">
        <label for={`file-${item.id}`} class="block text-xs font-semibold">
          Installer
        </label>
        <input
          id={`file-${item.id}`}
          name="file"
          type="file"
          required
          class={`${FIELD_CLASS} mt-1 file:mr-3 file:rounded-[var(--radius-xs)] file:border-0 file:bg-secondary file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-secondary-foreground`}
        />
      </div>

      <SubmitButton variant="secondary">
        <i data-lucide="upload" class="h-4 w-4" aria-hidden="true"></i>
        Upload
      </SubmitButton>
    </form>
  </Card>
);

export const ReleasesPage: FC<{
  releases: ReleaseWithAssets[];
  app: AppConfig;
  error?: string;
}> = ({ releases, app, error }) => (
  <Page>
    <Container size="wide" class="py-10">
      <div class="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Releases</h1>
          <p class="mt-1 text-muted-foreground">
            What the downloads page offers. A release stays invisible until you publish it.
          </p>
        </div>
        <a href="/admin/logs" class="text-sm font-medium text-primary underline underline-offset-4">
          System logs →
        </a>
      </div>

      {/* ---------- new release ---------- */}
      <Card class="mb-8 p-6">
        <h2 class="font-bold">New release</h2>
        <p class="mt-1 text-sm text-muted-foreground">
          Create it, attach the installers, then publish. Uploads go straight to R2 and are
          checksummed here as they stream past.
        </p>

        {error ? (
          <p
            role="alert"
            class="mt-4 rounded-[var(--radius-sm)] bg-destructive-subtle px-4 py-2.5 text-sm font-medium text-destructive-subtle-foreground"
          >
            {error}
          </p>
        ) : null}

        <form method="post" action="/admin/releases" class="mt-5 flex flex-wrap items-end gap-3">
          <div>
            <label for="version" class="block text-xs font-semibold">
              Version
            </label>
            <input
              id="version"
              name="version"
              type="text"
              required
              placeholder="0.2.0"
              class={`${FIELD_CLASS} mt-1 w-36 font-mono tabular`}
            />
          </div>

          <div>
            <label for="channel" class="block text-xs font-semibold">
              Channel
            </label>
            <select id="channel" name="channel" class={`${FIELD_CLASS} mt-1 w-32`}>
              {CHANNELS.map((channel) => (
                <option value={channel}>{channel}</option>
              ))}
            </select>
          </div>

          <div class="min-w-[16rem] flex-1">
            <label for="notes" class="block text-xs font-semibold">
              Release notes
            </label>
            <input
              id="notes"
              name="notes"
              type="text"
              placeholder="What changed, in a line or two"
              class={`${FIELD_CLASS} mt-1`}
            />
          </div>

          <SubmitButton>
            <i data-lucide="plus" class="h-4 w-4" aria-hidden="true"></i>
            Create
          </SubmitButton>
        </form>
      </Card>

      {/* ---------- existing ---------- */}
      {releases.length === 0 ? (
        <Card class="px-6 py-16 text-center">
          <span class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground shadow-inset">
            <i data-lucide="package" class="h-5 w-5" aria-hidden="true"></i>
          </span>
          <p class="mt-4 font-semibold">No releases yet</p>
          <p class="mt-1 text-sm text-muted-foreground">
            The downloads page is showing its "nothing published" state to visitors.
          </p>
        </Card>
      ) : (
        <div class="space-y-6">
          {releases.map((item) => (
            <ReleaseCard item={item} app={app} />
          ))}
        </div>
      )}
    </Container>
  </Page>
);
