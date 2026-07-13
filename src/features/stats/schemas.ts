import { z } from "zod";

export const createFocusSessionSchema = z.object({
  startedAt: z.iso.datetime(),
  endedAt: z.iso.datetime(),
  durationSeconds: z.number().int().positive(),
  taskId: z.string().uuid().optional().nullable(),
});

export type CreateFocusSession = z.infer<typeof createFocusSessionSchema>;
