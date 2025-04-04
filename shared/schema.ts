import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// YouTube summary schema
export const summaries = pgTable("summaries", {
  id: serial("id").primaryKey(),
  videoId: text("video_id").notNull(),
  videoUrl: text("video_url").notNull(),
  videoTitle: text("video_title").notNull(),
  videoAuthor: text("video_author").notNull(),
  videoDuration: integer("video_duration").notNull().default(0), // Default to 0 if not provided
  keyPoints: text("key_points").array().notNull().default([]), // Default to empty array if not provided
  summary: text("summary").notNull(),
  structuredOutline: jsonb("structured_outline").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Screenshots schema
export const screenshots = pgTable("screenshots", {
  id: serial("id").primaryKey(),
  summaryId: integer("summary_id").notNull(),
  imageUrl: text("image_url").notNull(), // Base64 encoded image for this implementation
  timestamp: integer("timestamp").notNull(), // Screenshot timestamp in seconds
  description: text("description").notNull().default(""), // Default empty string if not provided
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertSummarySchema = createInsertSchema(summaries).omit({
  id: true,
  createdAt: true,
});

export const insertScreenshotSchema = createInsertSchema(screenshots).omit({
  id: true,
});

// YouTube URL validation schema
export const youtubeUrlSchema = z.object({
  url: z.string().url().refine((url) => {
    // Match valid YouTube URLs
    const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    return regex.test(url);
  }, "Must be a valid YouTube URL"),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertSummary = z.infer<typeof insertSummarySchema>;
export type Summary = typeof summaries.$inferSelect;

export type InsertScreenshot = z.infer<typeof insertScreenshotSchema>;
export type Screenshot = typeof screenshots.$inferSelect;

export type YoutubeUrlInput = z.infer<typeof youtubeUrlSchema>;

// Types for API responses
export type SummaryWithScreenshots = Summary & {
  screenshots: Screenshot[];
};
