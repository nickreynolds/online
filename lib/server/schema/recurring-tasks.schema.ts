import { boolean, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth.schema";

export const recurringTask = pgTable("recurring_task", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  completed: boolean("completed").notNull().default(false),
  // Hours between occurrences
  frequencyHours: integer("frequency_hours").notNull(),
  lastCompleted: timestamp("last_completed"),
  nextDue: timestamp("next_due").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  creatorId: text("creator_id")
    .notNull()
    .references(() => user.id),
});
