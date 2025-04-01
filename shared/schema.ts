import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Task Planning Types
export const taskSchema = z.object({
  id: z.string(),
  description: z.string().min(1, "Task cannot be empty")
});

export type Task = z.infer<typeof taskSchema>;

export const scheduleItemSchema = z.object({
  time: z.string(),
  taskDescription: z.string(),
  details: z.string().optional(),
  imageUrl: z.string().optional()
});

export type ScheduleItem = z.infer<typeof scheduleItemSchema>;

export const plannerResponseSchema = z.object({
  schedule: z.array(scheduleItemSchema),
  explanation: z.string()
});

export type PlannerResponse = z.infer<typeof plannerResponseSchema>;
