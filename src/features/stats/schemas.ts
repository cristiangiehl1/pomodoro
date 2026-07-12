import { z } from "zod";

export const createFocusSessionSchema = z.object({
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime(),
  durationSeconds: z.number().int().positive(),
  taskId: z.string().uuid().optional().nullable(),
});

export type CreateFocusSession = z.infer<typeof createFocusSessionSchema>;
