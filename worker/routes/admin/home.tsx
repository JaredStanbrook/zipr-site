import { Hono } from "hono";
import { isNull, sql } from "drizzle-orm";

import type { AppEnv } from "@server/types";
import { release } from "@server/schema/release.schema";
import { issue } from "@server/schema/issue.schema";
import { AdminHome } from "@views/admin/AdminHome";

/**
 * The admin landing page, behind the same role guard as everything else under
 * `/admin` — which is what makes `/admin` usable as the sign-in entry point:
 * a signed-out visit redirects to the form, and signing in comes back here.
 */
export const adminHomeRoute = new Hono<AppEnv>();

adminHomeRoute.get("/", async (c) => {
  const user = c.var.auth.user!;

  // One grouped count rather than two queries, since the only difference
  // between the two numbers is whether `published_at` is set.
  const [counts] = await c.var.db
    .select({
      published: sql<number>`sum(case when ${release.publishedAt} is not null then 1 else 0 end)`,
      draft: sql<number>`sum(case when ${release.publishedAt} is null then 1 else 0 end)`,
    })
    .from(release)
    .where(isNull(release.deletedAt));

  const [issues] = await c.var.db
    .select({
      waiting: sql<number>`sum(case when ${issue.status} = 'new' then 1 else 0 end)`,
    })
    .from(issue)
    .where(isNull(issue.deletedAt));

  return c.render(
    <AdminHome
      email={user.email ?? "an administrator"}
      publishedCount={Number(counts?.published ?? 0)}
      draftCount={Number(counts?.draft ?? 0)}
      newIssueCount={Number(issues?.waiting ?? 0)}
    />,
    { title: "Administration" },
  );
});
