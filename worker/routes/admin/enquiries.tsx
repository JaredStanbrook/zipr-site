import { Hono } from "hono";
import { and, desc, eq, isNull } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";

import type { AppEnv } from "@server/types";
import {
  enquiry,
  enquiryStatusSchema,
  enquiryFilterSchema,
  type EnquiryStatus,
} from "@server/schema/enquiry.schema";
import { AccessControl } from "@server/services/access.service";
import { htmxToast } from "@server/lib/htmx-helpers";
import { EnquiriesPage, EnquiryRow } from "@views/admin/Enquiries";

/**
 * The contact form's inbox.
 *
 * Mounted under the admin sub-app, which already requires the admin role — the
 * `authorize` calls here are the second layer, so a narrower per-user grant
 * would behave correctly if one were ever issued.
 */
export const enquiriesRoute = new Hono<AppEnv>();

const access = new AccessControl();

/** Live rows only. A soft-deleted enquiry stays in the table and leaves the UI. */
const live = () => isNull(enquiry.deletedAt);

enquiriesRoute.get("/", zValidator("query", enquiryFilterSchema), async (c) => {
  const user = c.var.auth.user!;
  access.authorize(user, "enquiries", "read");

  const { status } = c.req.valid("query");

  // Everything, then filtered and counted in the worker. The counts have to be
  // unfiltered or the tabs collapse to the size of the current view, and at
  // inbox scale one query is cheaper than four.
  const all = await c.var.db.select().from(enquiry).where(live()).orderBy(desc(enquiry.createdAt));

  const counts = {
    all: all.length,
    new: all.filter((row) => row.status === "new").length,
    open: all.filter((row) => row.status === "open").length,
    handled: all.filter((row) => row.status === "handled").length,
  };

  return c.render(
    <EnquiriesPage
      items={status ? all.filter((row) => row.status === status) : all}
      counts={counts}
      filter={status as EnquiryStatus | ""}
      app={c.var.app}
    />,
    { title: "Enquiries" },
  );
});

enquiriesRoute.post("/:id/status", zValidator("form", enquiryStatusSchema), async (c) => {
  const user = c.var.auth.user!;
  access.authorize(user, "enquiries", "update");

  const id = Number(c.req.param("id"));
  const { status } = c.req.valid("form");

  const [existing] = await c.var.db
    .select()
    .from(enquiry)
    .where(and(eq(enquiry.id, id), live()));

  if (!existing) return c.notFound();

  const [updated] = await c.var.db
    .update(enquiry)
    .set({
      status,
      // Who dealt with it and when — only meaningful once it leaves "new".
      handledBy: status === "new" ? null : user.id,
      handledAt: status === "new" ? null : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(enquiry.id, id))
    .returning();

  htmxToast(c, `Marked ${status}`);
  return c.html(<EnquiryRow item={updated} locale={c.var.app.locale} />);
});

enquiriesRoute.delete("/:id", async (c) => {
  const user = c.var.auth.user!;
  access.authorize(user, "enquiries", "delete");

  const id = Number(c.req.param("id"));

  const [existing] = await c.var.db
    .select()
    .from(enquiry)
    .where(and(eq(enquiry.id, id), live()));

  if (!existing) return c.notFound();

  await c.var.db
    .update(enquiry)
    .set({ deletedAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    .where(eq(enquiry.id, id));

  htmxToast(c, "Enquiry deleted");
  // An empty body replaces the row this request targeted.
  return c.body(null, 200);
});
