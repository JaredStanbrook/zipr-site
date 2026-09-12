import type { FC } from "hono/jsx";

import { Page, Container, Card, LinkButton, Badge } from "@views/components/Ui";

/**
 * Where signing in lands you.
 *
 * This site has no customer accounts — the only reason anyone signs in is to
 * publish a release or read the audit log — so `/admin` is the front door
 * rather than a section reached from somewhere else, and it says what the two
 * things behind it are instead of assuming you remember.
 */

interface AdminHomeProps {
  email: string;
  /** Published releases, so the landing page answers the obvious question. */
  publishedCount: number;
  draftCount: number;
  /** Untriaged bug reports — the thing most likely to be waiting. */
  newIssueCount: number;
}

const DESTINATIONS = [
  {
    href: "/admin/issues",
    icon: "bug",
    title: "Bug reports",
    body: "Everything the public report form has taken. This is the tracker, since the repositories are private.",
  },
  {
    href: "/admin/releases",
    icon: "package",
    title: "Releases",
    body: "Create a version, upload an installer per platform, publish it. The downloads page renders whatever is published here.",
  },
  {
    href: "/admin/logs",
    icon: "shield-check",
    title: "Sign-in log",
    body: "Every authentication attempt against this site, successful or not. Written by the server; nothing here can edit it.",
  },
  {
    href: "/profile",
    icon: "user",
    title: "Your account",
    body: "Change your password, or set up an authenticator app as a second factor.",
  },
];

export const AdminHome: FC<AdminHomeProps> = ({
  email,
  publishedCount,
  draftCount,
  newIssueCount,
}) => (
  <Page>
    <Container class="py-12">
      <div class="mb-10">
        <Badge tone="primary" class="mb-4">
          <i data-lucide="circle-check" class="h-3 w-3" aria-hidden="true"></i>
          Signed in as {email}
        </Badge>
        <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">Site administration</h1>
        <p class="mt-3 max-w-2xl text-muted-foreground text-pretty">
          {publishedCount === 0 ? (
            <>
              Nothing is published yet, so the downloads page is showing visitors its "no build
              published" state.
              {draftCount > 0 ? (
                <>
                  {" "}
                  There {draftCount === 1 ? "is" : "are"}{" "}
                  <span class="tabular font-medium text-foreground">{draftCount}</span> draft
                  {draftCount === 1 ? "" : "s"} waiting.
                </>
              ) : null}
            </>
          ) : (
            <>
              <span class="tabular font-medium text-foreground">{publishedCount}</span> release
              {publishedCount === 1 ? "" : "s"} live on the downloads page
              {draftCount > 0 ? (
                <>
                  , and <span class="tabular font-medium text-foreground">{draftCount}</span> still
                  in draft
                </>
              ) : null}
              .
            </>
          )}
        </p>

        {newIssueCount > 0 ? (
          <p class="mt-4">
            <a
              href="/admin/issues?status=new"
              class="clay-press inline-flex items-center gap-2 rounded-[var(--radius-sm)] bg-warning-subtle px-3.5 py-2 text-sm font-semibold text-warning-subtle-foreground no-underline shadow-raised"
            >
              <i data-lucide="bug" class="h-4 w-4" aria-hidden="true"></i>
              <span class="tabular">{newIssueCount}</span> bug report
              {newIssueCount === 1 ? "" : "s"} waiting
            </a>
          </p>
        ) : null}
      </div>

      <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {DESTINATIONS.map((destination) => (
          <Card class="flex h-full flex-col p-6">
            <span class="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-primary-subtle text-primary-subtle-foreground shadow-raised">
              <i data-lucide={destination.icon} class="h-5 w-5" aria-hidden="true"></i>
            </span>
            <h2 class="mt-4 text-lg font-bold">{destination.title}</h2>
            <p class="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground text-pretty">
              {destination.body}
            </p>
            <LinkButton href={destination.href} variant="outline" class="mt-5 w-full">
              Open
              <i data-lucide="chevron-right" class="h-4 w-4" aria-hidden="true"></i>
            </LinkButton>
          </Card>
        ))}
      </div>
    </Container>
  </Page>
);
