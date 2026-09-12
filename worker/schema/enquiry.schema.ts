// worker/schema/enquiry.schema.ts
//
// What the contact form writes. Nobody owns an enquiry — it arrives from a
// signed-out visitor — so it carries timestamps but no `userId`, and the
// admin who deals with it is recorded separately.

import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

import { users } from "./auth.schema";
import { timestampColumns } from "./common";

export const ENQUIRY_TOPICS = ["licence", "self-hosting", "support", "security", "other"] as const;
export type EnquiryTopic = (typeof ENQUIRY_TOPICS)[number];

export const ENQUIRY_STATUSES = ["new", "open", "handled"] as const;
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

export const enquiry = sqliteTable(
  "enquiry",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    organisation: text("organisation"),
    topic: text("topic", { enum: ENQUIRY_TOPICS }).default("other").notNull(),
    /** Rough team size. Optional, because pressing for it loses enquiries. */
    seats: integer("seats"),
    message: text("message").notNull(),
    status: text("status", { enum: ENQUIRY_STATUSES }).default("new").notNull(),
    /** `set null`, so an enquiry outlives the account that handled it. */
    handledBy: text("handled_by").references(() => users.id, { onDelete: "set null" }),
    handledAt: text("handled_at"),
    deletedAt: text("deleted_at"),
    ...timestampColumns,
  },
  (table) => [
    index("enquiry_status_idx").on(table.status),
    index("enquiry_created_idx").on(table.createdAt),
  ],
);

export const enquiryRelations = relations(enquiry, ({ one }) => ({
  handler: one(users, {
    fields: [enquiry.handledBy],
    references: [users.id],
  }),
}));

// ==========================================
// VALIDATION
// ==========================================

export const selectEnquirySchema = createSelectSchema(enquiry);

/**
 * What the public form posts.
 *
 * `website` is a honeypot: it is rendered off-screen and hidden from
 * assistive technology, so a person never fills it in and a naive bot
 * always does. The route drops any submission that carries a value, and
 * answers 200 anyway — telling a bot it was caught only teaches it.
 */
export const enquiryFormSchema = z.object({
  name: z.string().trim().min(1, "Please tell us your name").max(120),
  email: z.string().trim().toLowerCase().email("That does not look like an email address").max(254),
  organisation: z.string().trim().max(160).optional().default(""),
  topic: z.enum(ENQUIRY_TOPICS).optional().default("other"),
  seats: z
    .string()
    .trim()
    .optional()
    .default("")
    .transform((v) => (v === "" ? null : Number(v)))
    .refine((v) => v === null || (Number.isInteger(v) && v > 0 && v <= 100_000), {
      message: "Give a whole number of people, or leave it blank",
    }),
  message: z.string().trim().min(10, "A sentence or two, so we can answer usefully").max(5_000),
  website: z.string().max(200).optional().default(""),
});

/** The admin inbox's status control. */
export const enquiryStatusSchema = z.object({
  status: z.enum(ENQUIRY_STATUSES),
});

/** The inbox's filter bar. */
export const enquiryFilterSchema = z.object({
  status: z
    .union([z.enum(ENQUIRY_STATUSES), z.literal("")])
    .optional()
    .default(""),
});

// ==========================================
// TYPES
// ==========================================

export type SelectEnquiry = z.infer<typeof selectEnquirySchema>;
export type EnquiryForm = z.infer<typeof enquiryFormSchema>;
export type EnquiryFilter = z.infer<typeof enquiryFilterSchema>;
