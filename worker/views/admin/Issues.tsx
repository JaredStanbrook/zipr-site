import type { FC } from "hono/jsx";

import type { AppConfig } from "@server/config/app.config";
import {
  ISSUE_STATUSES,
  ISSUE_PRODUCT_LABELS,
  type SelectIssue,
  type IssueStatus,
} from "@server/schema/issue.schema";
import { formatDateShort } from "@views/lib/utils";
import { Page, Container, Card, Badge } from "@views/components/Ui";

const STATUS_TONE: Record<IssueStatus, "warning" | "primary" | "success" | "neutral"> = {
  new: "warning",
  confirmed: "primary",
  fixed: "success",
  closed: "neutral",
};

/** One report. A native `<details>` so the body is findable with find-in-page. */
export const IssueRow: FC<{ item: SelectIssue; locale: string }> = ({ item, locale }) => (
  <details id={`issue-${item.id}`} class="group border-b border-border last:border-0">
    <summary class="flex cursor-pointer list-none items-center gap-4 px-5 py-4 marker:hidden hover:bg-accent/50 [&::-webkit-details-marker]:hidden">
      <i
        data-lucide="chevron-right"
        class="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90"
        aria-hidden="true"
      ></i>

      <span class="min-w-0 flex-1">
        <span class="block truncate font-semibold">{item.summary}</span>
        <span class="block truncate text-sm text-muted-foreground">
          {ISSUE_PRODUCT_LABELS[item.product]}
          {item.version ? ` · ${item.version}` : ""}
          {item.platform ? ` · ${item.platform}` : ""}
          {item.email ? ` · ${item.email}` : " · anonymous"}
        </span>
      </span>

      <span class="hidden shrink-0 text-sm text-muted-foreground md:block">
        {formatDateShort(item.createdAt, locale)}
      </span>

      <span class="shrink-0">
        <Badge tone={STATUS_TONE[item.status]}>{item.status}</Badge>
      </span>
    </summary>

    <div class="border-t border-border bg-muted/30 px-5 py-5 pl-14">
      <p class="whitespace-pre-wrap text-sm leading-relaxed">{item.detail}</p>

      <div class="mt-5 flex flex-wrap items-center gap-2">
        {ISSUE_STATUSES.map((status) => (
          <button
            type="button"
            hx-post={`/admin/issues/${item.id}/status`}
            hx-vals={JSON.stringify({ status })}
            hx-target={`#issue-${item.id}`}
            hx-swap="outerHTML"
            disabled={status === item.status}
            class="clay-press inline-flex h-8 cursor-pointer items-center rounded-[var(--radius-sm)] border border-border-strong bg-card px-3 text-xs font-semibold hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            {status}
          </button>
        ))}

        {item.email ? (
          <a
            href={`mailto:${item.email}?subject=${encodeURIComponent(`Re: ${item.summary}`)}`}
            class="clay-press inline-flex h-8 items-center gap-1.5 rounded-[var(--radius-sm)] bg-primary px-3 text-xs font-semibold text-primary-foreground no-underline hover:brightness-110"
          >
            <i data-lucide="send" class="h-3 w-3" aria-hidden="true"></i>
            Reply
          </a>
        ) : null}

        <button
          type="button"
          hx-delete={`/admin/issues/${item.id}`}
          hx-target={`#issue-${item.id}`}
          hx-swap="outerHTML"
          hx-confirm="Remove this report from the list? It stays in the database."
          class="clay-press ml-auto inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-[var(--radius-sm)] px-3 text-xs font-semibold text-destructive hover:bg-destructive/10"
        >
          <i data-lucide="trash-2" class="h-3 w-3" aria-hidden="true"></i>
          Delete
        </button>
      </div>

      {item.triagedAt ? (
        <p class="mt-4 text-xs text-muted-foreground">
          Marked {item.status} on {formatDateShort(item.triagedAt, locale)}.
        </p>
      ) : null}
    </div>
  </details>
);

interface IssuesProps {
  items: SelectIssue[];
  counts: Record<IssueStatus | "all", number>;
  filter: IssueStatus | "";
  app: AppConfig;
}

export const IssuesPage: FC<IssuesProps> = ({ items, counts, filter, app }) => {
  const tabs: Array<{ value: IssueStatus | ""; label: string; count: number }> = [
    { value: "", label: "All", count: counts.all },
    { value: "new", label: "New", count: counts.new },
    { value: "confirmed", label: "Confirmed", count: counts.confirmed },
    { value: "fixed", label: "Fixed", count: counts.fixed },
    { value: "closed", label: "Closed", count: counts.closed },
  ];

  return (
    <Page>
      <Container size="wide" class="py-10">
        <div class="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold tracking-tight">Bug reports</h1>
            <p class="mt-1 text-muted-foreground">
              Everything the public report form has taken. This is the tracker — the repositories
              are private.
            </p>
          </div>
          <a href="/admin" class="text-sm font-medium text-primary underline underline-offset-4">
            ← Admin
          </a>
        </div>

        <div class="mb-5 flex flex-wrap gap-2" role="group" aria-label="Filter by status">
          {tabs.map((tab) => {
            const active = filter === tab.value;
            return (
              <a
                href={tab.value ? `/admin/issues?status=${tab.value}` : "/admin/issues"}
                aria-current={active ? "page" : undefined}
                class={`clay-press inline-flex h-9 items-center gap-2 rounded-[var(--radius-sm)] px-3.5 text-sm font-semibold no-underline ${
                  active
                    ? "bg-primary text-primary-foreground shadow-raised"
                    : "border border-border-strong bg-card text-foreground shadow-raised hover:bg-muted"
                }`}
              >
                {tab.label}
                <span class="tabular opacity-70">{tab.count}</span>
              </a>
            );
          })}
        </div>

        <Card class="overflow-hidden p-0">
          {items.length === 0 ? (
            <div class="px-5 py-16 text-center">
              <span class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground shadow-inset">
                <i data-lucide="bug" class="h-5 w-5" aria-hidden="true"></i>
              </span>
              <p class="mt-4 font-semibold">Nothing here</p>
              <p class="mt-1 text-sm text-muted-foreground">No reports match this filter.</p>
            </div>
          ) : (
            items.map((item) => <IssueRow item={item} locale={app.locale} />)
          )}
        </Card>
      </Container>
    </Page>
  );
};
