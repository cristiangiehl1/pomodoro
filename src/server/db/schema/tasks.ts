import { pgTable, uuid, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  estimatedPomodoros: integer("estimated_pomodoros").notNull().default(1),
  completedPomodoros: integer("completed_pomodoros").notNull().default(0),
  done: boolean("done").notNull().default(false),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
