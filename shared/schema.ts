import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import type * as z from "zod/mini";

// Current version of the Terms & Conditions. Bump this whenever the terms
// change so stored acknowledgments remain auditable against what was shown.
export const TERMS_VERSION = "2026-10-04";

// Users table — authentication
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name").notNull().default("Anonymous Driver"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

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
  userId: integer("user_id"), // nullable foreign key to users
  latitude: real("latitude"), // optional GPS coordinates
  longitude: real("longitude"), // optional GPS coordinates
  upvotes: integer("upvotes").notNull().default(0),
  downvotes: integer("downvotes").notNull().default(0),
  views: integer("views").notNull().default(0),
  commentCount: integer("comment_count").notNull().default(0),
  // Safety acknowledgments — recorded at submission time (see TERMS_VERSION)
  acknowledgedNotDriving: integer("acknowledged_not_driving", { mode: "boolean" })
    .notNull()
    .default(false),
  acknowledgedNoPersonalInfo: integer("acknowledged_no_personal_info", { mode: "boolean" })
    .notNull()
    .default(false),
  termsVersion: text("terms_version"),
  acknowledgedAt: text("acknowledged_at"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

// Comments table
export const comments = sqliteTable("comments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  reportId: integer("report_id").notNull(),
  authorName: text("author_name").notNull().default("Anonymous Driver"),
  userId: integer("user_id"),
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

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  passwordHash: true,
  createdAt: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  upvotes: true,
  downvotes: true,
  views: true,
  commentCount: true,
  createdAt: true,
  userId: true,
  // Server-stamped at submission time, never client-supplied
  termsVersion: true,
  acknowledgedAt: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
  userId: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;
export type PlateLookup = typeof plateLookups.$inferSelect;

// Safe user (without password hash) for API responses
export function safeUser(user: User): Omit<User, "passwordHash"> {
  const { passwordHash: _ph, ...rest } = user;
  return rest;
}
