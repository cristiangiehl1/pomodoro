import { z } from "zod";
import { tasks } from "@/db/schema/tasks";

export const createTaskSchema = z.object({
  title: z.string().min(1).trim(),
  estimatedPomodoros: z.number().int().min(1).max(99).default(1),
});

export const updateTaskSchema = z
  .object({
    title: z.string().min(1).trim().optional(),
    estimatedPomodoros: z.number().int().min(1).max(99).optional(),
    completedPomodoros: z.number().int().min(0).optional(),
    done: z.boolean().optional(),
    position: z.number().int().min(0).optional(),
  })
  .refine(
    (data) => Object.values(data).some((v) => v !== undefined),
    { message: "At least one field must be provided" }
  );

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type Task = typeof tasks.$inferSelect;
