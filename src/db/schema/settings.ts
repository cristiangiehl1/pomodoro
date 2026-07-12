import { pgTable, integer, boolean, text } from "drizzle-orm/pg-core";
import { users } from "./auth";

export const pomodoroSettings = pgTable("pomodoro_settings", {
  userId: text("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  focusMinutes: integer("focus_minutes").notNull().default(25),
  shortBreakMinutes: integer("short_break_minutes").notNull().default(5),
  longBreakMinutes: integer("long_break_minutes").notNull().default(15),
  cyclesUntilLongBreak: integer("cycles_until_long_break").notNull().default(4),
  autoStartBreaks: boolean("auto_start_breaks").notNull().default(false),
  autoStartFocus: boolean("auto_start_focus").notNull().default(false),
  sound: text("sound").notNull().default("bell"),
  volume: integer("volume").notNull().default(70),
});
