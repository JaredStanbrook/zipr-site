// worker/schema/issue.schema.ts
//
// Bug reports, from anybody. The source repositories are private, so there is
// no public issue tracker to send people to — this is it.

import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

import { users } from "./auth.schema";
import { timestampColumns } from "./common";

/** Which half of the product is misbehaving. */
export const ISSUE_PRODUCTS = ["client", "api", "site"] as const;
export type IssueProduct = (typeof ISSUE_PRODUCTS)[number];

export const ISSUE_STATUSES = ["new", "confirmed", "fixed", "closed"] as const;
export type IssueStatus = (typeof ISSUE_STATUSES)[number];

export const ISSUE_PRODUCT_LABELS: Record<IssueProduct, string> = {
  client: "The desktop app",
  api: "A deployment",
  site: "This website",
};

export const issue = sqliteTable(
  "issue",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    product: text("product", { enum: ISSUE_PRODUCTS }).default("client").notNull(),
    summary: text("summary").notNull(),
    detail: text("detail").notNull(),
    /**
     * Optional on purpose. Requiring an address turns a thirty-second report
     * into a decision about whether you want to hear from us, and the reports
     * that get abandoned there are exactly the drive-by ones worth having.
     */
    email: text("email"),
    /** Free text — "0.2.0", "latest", or blank. Never parsed. */
    version: text("version"),
    platform: text("platform"),
    status: text("status", { enum: ISSUE_STATUSES }).default("new").notNull(),
    /** Internal note, never shown to the reporter. */
    note: text("note"),
    triagedBy: text("triaged_by").references(() => users.id, { onDelete: "set null" }),
    triagedAt: text("triaged_at"),
    deletedAt: text("deleted_at"),
    ...timestampColumns,
  },
  (table) => [
    index("issue_status_idx").on(table.status),
    index("issue_product_idx").on(table.product),
    index("issue_created_idx").on(table.createdAt),
  ],
);

export const issueRelations = relations(issue, ({ one }) => ({
  triager: one(users, {
    fields: [issue.triagedBy],
    references: [users.id],
  }),
}));

// ==========================================
// VALIDATION
// ==========================================

export const selectIssueSchema = createSelectSchema(issue);

/**
 * What the public form posts.
 *
 * Kept short deliberately. Every extra required field is another chance for
 * somebody to give up halfway and for the bug to go unreported.
 */
export const issueFormSchema = z.object({
  product: z.enum(ISSUE_PRODUCTS).optional().default("client"),
  summary: z.string().trim().min(4, "A few words on what went wrong").max(160),
  detail: z
    .string()
    .trim()
    .min(15, "What you did, and what happened instead — a sentence or two is plenty")
    .max(5_000),
  email: z
    .union([
      z.string().trim().toLowerCase().email("That does not look like an email address"),
      z.literal(""),
    ])
    .optional()
    .default("")
    .transform((v) => (v === "" ? null : v)),
  version: z.string().trim().max(40).optional().default(""),
  platform: z.string().trim().max(40).optional().default(""),
  /** Honeypot — see the route. */
  website: z.string().max(200).optional().default(""),
});

export const issueStatusSchema = z.object({
  status: z.enum(ISSUE_STATUSES),
});

export const issueFilterSchema = z.object({
  status: z
    .union([z.enum(ISSUE_STATUSES), z.literal("")])
    .optional()
    .default(""),
});

// ==========================================
// TYPES
// ==========================================

export type SelectIssue = z.infer<typeof selectIssueSchema>;
export type IssueForm = z.infer<typeof issueFormSchema>;
export type IssueFilter = z.infer<typeof issueFilterSchema>;
