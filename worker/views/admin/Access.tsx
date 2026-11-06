import type { FC } from "hono/jsx";

import type { AppConfig } from "@server/config/app.config";
import {
  ACCESS_DURATIONS,
  type AccessLinkState,
  type SelectAccessLink,
} from "@server/schema/access.schema";
import { linkState } from "@server/services/access-gate.service";
import { formatDateShort } from "@views/lib/utils";
import { Page, Container, Card, Badge, SubmitButton } from "@views/components/Ui";

const STATE: Record<AccessLinkState, { tone: "neutral" | "success" | "warning"; label: string }> = {
  unused: { tone: "warning", label: "Not opened yet" },
  active: { tone: "success", label: "Active" },
  expired: { tone: "neutral", label: "Expired" },
  revoked: { tone: "neutral", label: "Revoked" },
};

const FIELD_CLASS =
  "clay-field h-11 w-full px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background";

const durationLabel = (hours: number) =>
  ACCESS_DURATIONS.find((d) => d.hours === hours)?.label ??
  (hours % 24 === 0 ? `${hours / 24} days` : `${hours} hours`);

const dateTime = (iso: string, app: AppConfig) =>
  new Date(iso).toLocaleString(app.locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: app.timezone,
  });

export const AccessLinkRow: FC<{ link: SelectAccessLink; app: AppConfig }> = ({ link, app }) => {
  const state = linkState(link);
  const url = `${app.origin}/a/${link.token}`;

  return (
    <div id={`access-${link.id}`} class="border-b border-border px-5 py-4 last:border-0">
      <div class="flex flex-wrap items-center gap-3">
        <span class="min-w-0 flex-1 truncate font-semibold">{link.label}</span>
        <Badge tone={STATE[state].tone}>{STATE[state].label}</Badge>
      </div>

      <p class="mt-1 text-sm text-muted-foreground">
        {durationLabel(link.durationHours)} from first visit · created{" "}
        {formatDateShort(link.createdAt, app.locale)}
        {link.firstVisitedAt ? ` · opened ${dateTime(link.firstVisitedAt, app)}` : ""}
        {link.expiresAt && state !== "revoked"
          ? ` · ${state === "active" ? "expires" : "expired"} ${dateTime(link.expiresAt, app)}`
          : ""}
      </p>

      {state === "unused" || state === "active" ? (
        <div class="mt-3 flex flex-wrap items-center gap-2">
          <label for={`access-url-${link.id}`} class="sr-only">
            Link for {link.label}
          </label>
          <input
            id={`access-url-${link.id}`}
            type="text"
            readonly
            value={url}
            onfocus="this.select()"
            class={`${FIELD_CLASS} min-w-0 flex-1 font-mono text-xs`}
          />
          <button
            type="button"
            hx-post={`/admin/access/${link.id}/revoke`}
            hx-target={`#access-${link.id}`}
            hx-swap="outerHTML"
            hx-confirm="Revoke this link? Whoever holds it loses access straight away."
            class="clay-press inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-[var(--radius-sm)] px-3 text-sm font-semibold text-destructive hover:bg-destructive/10"
          >
            <i data-lucide="trash-2" class="h-4 w-4" aria-hidden="true"></i>
            Revoke
          </button>
        </div>
      ) : null}
    </div>
  );
};

interface AccessProps {
  links: SelectAccessLink[];
  app: AppConfig;
  gateEnabled: boolean;
}

export const AccessPage: FC<AccessProps> = ({ links, app, gateEnabled }) => (
  <Page>
    <Container size="wide" class="py-10">
      <div class="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Access links</h1>
          <p class="mt-1 max-w-2xl text-muted-foreground text-pretty">
            Send one to each person you want to see the site. Its clock starts the first time it is
            opened, not when you create it. After that, the visitor is sent to a "nothing to see
            here" page.
          </p>
        </div>
        <a href="/admin" class="text-sm font-medium text-primary underline underline-offset-4">
          ← Admin
        </a>
      </div>

      <p class="mb-6">
        <Badge tone={gateEnabled ? "success" : "warning"}>
          {gateEnabled
            ? "Gate on: the public site needs a link"
            : 'Gate off: the public site is open to everyone (ACCESS_GATE is not "true")'}
        </Badge>
      </p>

      <Card class="mb-8 p-5">
        <form method="post" action="/admin/access" class="grid gap-4 sm:grid-cols-[1fr_12rem_auto]">
          <div>
            <label for="label" class="block text-sm font-semibold">
              Who is it for?
            </label>
            <input
              id="label"
              name="label"
              type="text"
              required
              maxlength={120}
              placeholder="Alex at Example Co"
              class={`${FIELD_CLASS} mt-1.5`}
            />
          </div>
          <div>
            <label for="durationHours" class="block text-sm font-semibold">
              Lasts
            </label>
            <select id="durationHours" name="durationHours" class={`${FIELD_CLASS} mt-1.5`}>
              {ACCESS_DURATIONS.map((d) => (
                <option value={String(d.hours)} selected={d.hours === 168}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div class="flex items-end">
            <SubmitButton variant="primary" class="w-full">
              <i data-lucide="link" class="h-4 w-4" aria-hidden="true"></i>
              Create link
            </SubmitButton>
          </div>
        </form>
      </Card>

      <Card class="overflow-hidden p-0">
        {links.length === 0 ? (
          <div class="px-5 py-16 text-center">
            <p class="font-semibold">No links yet</p>
            <p class="mt-1 text-sm text-muted-foreground">Create one above to invite someone.</p>
          </div>
        ) : (
          links.map((link) => <AccessLinkRow link={link} app={app} />)
        )}
      </Card>
    </Container>
  </Page>
);
