import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import type * as z from "zod/mini";

// Reports table — the core entity of Bad Drivers of America
export const reports = sqliteTable("reports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  licensePlate: text("license_plate").notNull(),
  make: text("make"),
  model: text("model"),
  location: text("location").notNull(),
  state: text("state"),
  mediaType: text("media_type").notNull().default("photo"), // "photo" | "video"
  mediaData: text("media_data"), // base64 data URL
  incidentType: text("incident_type").notNull().default("reckless"), // reckless, speeding, parking, texting, road-rage, other
  authorName: text("author_name").notNull().default("Anonymous Driver"),
  upvotes: integer("upvotes").notNull().default(0),
  downvotes: integer("downvotes").notNull().default(0),
  views: integer("views").notNull().default(0),
  commentCount: integer("comment_count").notNull().default(0),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

// Comments table
export const comments = sqliteTable("comments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  reportId: integer("report_id").notNull(),
  authorName: text("author_name").notNull().default("Anonymous Driver"),
  content: text("content").notNull(),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

// Plate lookups table — track how many times a plate has been reported
export const plateLookups = sqliteTable("plate_lookups", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  licensePlate: text("license_plate").notNull(),
  lookupCount: integer("lookup_count").notNull().default(0),
  lastLookedUp: text("last_looked_up").notNull().default(new Date().toISOString()),
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  upvotes: true,
  downvotes: true,
  views: true,
  commentCount: true,
  createdAt: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
});

export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;
export type PlateLookup = typeof plateLookups.$inferSelect;
