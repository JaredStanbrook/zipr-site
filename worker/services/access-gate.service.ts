import { and, eq, gt, isNull, sql } from "drizzle-orm";

import type { AppEnv } from "@server/types";
import { accessLink } from "@server/schema/access.schema";
import type { AccessLinkState, SelectAccessLink } from "@server/schema/access.schema";

type Db = AppEnv["Variables"]["db"];

/** The cookie that carries an opened link's token on later requests. */
export const ACCESS_COOKIE = "site_access";

/** Off unless the var says exactly "true", so a missing var never locks anyone out. */
export const isGateEnabled = (env: { ACCESS_GATE?: string }) => env.ACCESS_GATE === "true";

export const linkState = (link: SelectAccessLink, now = new Date()): AccessLinkState => {
  if (link.revokedAt) return "revoked";
  if (!link.expiresAt) return "unused";
  return link.expiresAt > now.toISOString() ? "active" : "expired";
};

/**
 * Open a link once. The first visit starts its clock and mints the session
 * token that goes in the browser's cookie; any later visit gets null.
 *
 * The `isNull(firstVisitedAt)` in the update makes the claim atomic, so two
 * visits racing each other cannot both win.
 */
export async function openLink(db: Db, token: string, now = new Date()) {
  const sessionToken = crypto.randomUUID() + crypto.randomUUID();
  const [link] = await db
    .update(accessLink)
    .set({
      firstVisitedAt: now.toISOString(),
      // The duration is read in SQL so the clock matches what the admin set.
      expiresAt: sql`strftime('%Y-%m-%dT%H:%M:%fZ', ${now.toISOString()}, '+' || ${accessLink.durationHours} || ' hours')`,
      sessionToken,
      updatedAt: now.toISOString(),
    })
    .where(
      and(
        eq(accessLink.token, token),
        isNull(accessLink.firstVisitedAt),
        isNull(accessLink.revokedAt),
      ),
    )
    .returning();
  return link ?? null;
}

/** A session cookie whose link is not revoked and not expired. */
export async function liveLink(db: Db, sessionToken: string, now = new Date()) {
  const [link] = await db
    .select()
    .from(accessLink)
    .where(
      and(
        eq(accessLink.sessionToken, sessionToken),
        isNull(accessLink.revokedAt),
        gt(accessLink.expiresAt, now.toISOString()),
      ),
    );
  return link ?? null;
}
