import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { tasks } from "./tasks";

export const focusSessions = pgTable("focus_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  taskId: uuid("task_id").references(() => tasks.id, { onDelete: "set null" }),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
  endedAt: timestamp("ended_at", { withTimezone: true }).notNull(),
  durationSeconds: integer("duration_seconds").notNull(),
});
