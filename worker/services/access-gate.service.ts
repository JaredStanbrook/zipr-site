import { and, eq, gt, isNull } from "drizzle-orm";

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
 * Open a link: the first visit starts its clock, later visits leave it alone.
 *
 * The `isNull(firstVisitedAt)` in the update is what keeps a second visit from
 * restarting the timer, including two visits racing each other.
 */
export async function openLink(db: Db, token: string, now = new Date()) {
  const [current] = await db.select().from(accessLink).where(eq(accessLink.token, token));
  if (!current) return null;

  if (!current.firstVisitedAt && !current.revokedAt) {
    const expiresAt = new Date(now.getTime() + current.durationHours * 3_600_000).toISOString();
    await db
      .update(accessLink)
      .set({ firstVisitedAt: now.toISOString(), expiresAt, updatedAt: now.toISOString() })
      .where(and(eq(accessLink.id, current.id), isNull(accessLink.firstVisitedAt)));
  }

  const [link] = await db.select().from(accessLink).where(eq(accessLink.id, current.id));
  return link ?? null;
}

/** A token that is opened, not revoked and not expired. */
export async function liveLink(db: Db, token: string, now = new Date()) {
  const [link] = await db
    .select()
    .from(accessLink)
    .where(
      and(
        eq(accessLink.token, token),
        isNull(accessLink.revokedAt),
        gt(accessLink.expiresAt, now.toISOString()),
      ),
    );
  return link ?? null;
}
