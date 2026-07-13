import { z } from "zod";

export const settingsSchema = z.object({
  focusMinutes: z.number().int().min(1).max(120),
  shortBreakMinutes: z.number().int().min(1).max(120),
  longBreakMinutes: z.number().int().min(1).max(120),
  cyclesUntilLongBreak: z.number().int().min(1).max(12),
  autoStartBreaks: z.boolean(),
  autoStartFocus: z.boolean(),
  sound: z.string().min(1),
  volume: z.number().int().min(0).max(100),
});

export type Settings = z.infer<typeof settingsSchema>;
