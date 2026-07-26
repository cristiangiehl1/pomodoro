import { and, asc, eq, max } from "drizzle-orm";
import { tasks } from "@/server/db/schema";
import { BaseModel } from "./base.model";
import type { CreateTaskInput, UpdateTaskInput } from "@/lib/validations/task";

export type TaskRow = typeof tasks.$inferSelect;

/** CRUD da entidade Task, sempre escopado ao `userId` do dono. */
export class TaskModel extends BaseModel {
  /** Tarefas do usuário, ordenadas por posição e data de criação. */
  findByUser(userId: string): Promise<TaskRow[]> {
    return this.db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId))
      .orderBy(asc(tasks.position), asc(tasks.createdAt));
  }

  /** Cria uma tarefa ao final da lista do usuário. */
  async create(userId: string, input: CreateTaskInput): Promise<TaskRow> {
    const [maxRow] = await this.db
      .select({ maxPosition: max(tasks.position) })
      .from(tasks)
      .where(eq(tasks.userId, userId));

    const position = maxRow?.maxPosition != null ? maxRow.maxPosition + 1 : 0;

    const [row] = await this.db
      .insert(tasks)
      .values({
        userId,
        title: input.title,
        estimatedPomodoros: input.estimatedPomodoros,
        done: false,
        completedPomodoros: 0,
        position,
      })
      .returning();

    return row;
  }

  /** Atualiza parcialmente uma tarefa do usuário. `null` se não existir. */
  async update(
    userId: string,
    id: string,
    patch: UpdateTaskInput,
  ): Promise<TaskRow | null> {
    const [row] = await this.db
      .update(tasks)
      .set(patch)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning();

    return row ?? null;
  }

  /** Remove uma tarefa do usuário. `false` se não existir. */
  async delete(userId: string, id: string): Promise<boolean> {
    const rows = await this.db
      .delete(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning();

    return rows.length > 0;
  }
}
