import { Hono } from "hono";
import { and, desc, eq, isNull } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";

import type { AppEnv } from "@server/types";
import {
  issue,
  issueStatusSchema,
  issueFilterSchema,
  type IssueStatus,
} from "@server/schema/issue.schema";
import { AccessControl } from "@server/services/access.service";
import { htmxToast } from "@server/lib/htmx-helpers";
import { IssuesPage, IssueRow } from "@views/admin/Issues";

/**
 * The bug tracker. Mounted under the admin sub-app, which already requires the
 * admin role; the `authorize` calls are the second layer, so a narrower
 * per-user grant would behave correctly if one were ever issued.
 */
export const issuesRoute = new Hono<AppEnv>();

const access = new AccessControl();

/** Live rows only — a deleted report stays in the table and leaves the list. */
const live = () => isNull(issue.deletedAt);

issuesRoute.get("/", zValidator("query", issueFilterSchema), async (c) => {
  const user = c.var.auth.user!;
  access.authorize(user, "issues", "read");

  const { status } = c.req.valid("query");

  // Everything, then filtered and counted here. The counts have to be
  // unfiltered or the tabs collapse to the size of the current view, and at
  // tracker scale one query is cheaper than five.
  const all = await c.var.db.select().from(issue).where(live()).orderBy(desc(issue.createdAt));

  const countFor = (value: IssueStatus) => all.filter((row) => row.status === value).length;

  return c.render(
    <IssuesPage
      items={status ? all.filter((row) => row.status === status) : all}
      counts={{
        all: all.length,
        new: countFor("new"),
        confirmed: countFor("confirmed"),
        fixed: countFor("fixed"),
        closed: countFor("closed"),
      }}
      filter={status as IssueStatus | ""}
      app={c.var.app}
    />,
    { title: "Bug reports" },
  );
});

issuesRoute.post("/:id/status", zValidator("form", issueStatusSchema), async (c) => {
  const user = c.var.auth.user!;
  access.authorize(user, "issues", "update");

  const id = Number(c.req.param("id"));
  const { status } = c.req.valid("form");

  const [existing] = await c.var.db
    .select()
    .from(issue)
    .where(and(eq(issue.id, id), live()));

  if (!existing) return c.notFound();

  const [updated] = await c.var.db
    .update(issue)
    .set({
      status,
      // Who looked at it and when — only meaningful once it leaves "new".
      triagedBy: status === "new" ? null : user.id,
      triagedAt: status === "new" ? null : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(issue.id, id))
    .returning();

  htmxToast(c, `Marked ${status}`);
  return c.html(<IssueRow item={updated} locale={c.var.app.locale} />);
});

issuesRoute.delete("/:id", async (c) => {
  access.authorize(c.var.auth.user!, "issues", "delete");

  const id = Number(c.req.param("id"));

  const [existing] = await c.var.db
    .select()
    .from(issue)
    .where(and(eq(issue.id, id), live()));

  if (!existing) return c.notFound();

  await c.var.db
    .update(issue)
    .set({ deletedAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    .where(eq(issue.id, id));

  htmxToast(c, "Report removed");
  return c.body(null, 200);
});
