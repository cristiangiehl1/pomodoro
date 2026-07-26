import { and, desc, eq, gte, sql } from "drizzle-orm";
import { focusSessions } from "@/server/db/schema";
import { tasks } from "@/server/db/schema";
import { BaseModel } from "./base.model";
import type { CreateFocusSession } from "@/lib/validations/focus-session";
import { aggregateByDay, type DailyTotal } from "@/utils/aggregate-sessions";

export type FocusSessionRow = typeof focusSessions.$inferSelect;

const DAY_MS = 24 * 60 * 60 * 1000;

/** Sessões de foco concluídas — fonte das estatísticas. */
export class FocusSessionModel extends BaseModel {
  /** Todas as sessões do usuário, mais recentes primeiro. */
  findByUser(userId: string): Promise<FocusSessionRow[]> {
    return this.db
      .select()
      .from(focusSessions)
      .where(eq(focusSessions.userId, userId))
      .orderBy(desc(focusSessions.startedAt));
  }

  /** Sessões do usuário a partir de uma data (para agregação de stats). */
  findSince(
    userId: string,
    since: Date,
  ): Promise<{ startedAt: Date; durationSeconds: number }[]> {
    return this.db
      .select({
        startedAt: focusSessions.startedAt,
        durationSeconds: focusSessions.durationSeconds,
      })
      .from(focusSessions)
      .where(
        and(
          eq(focusSessions.userId, userId),
          gte(focusSessions.startedAt, since),
        ),
      );
  }

  /** Totais diários de foco dos últimos `days` dias (para as estatísticas). */
  async recentDailyTotals(userId: string, days = 14): Promise<DailyTotal[]> {
    const since = new Date(Date.now() - days * DAY_MS);
    const rows = await this.findSince(userId, since);
    return aggregateByDay(
      rows.map((row) => ({
        startedAt: row.startedAt.toISOString(),
        durationSeconds: row.durationSeconds,
      })),
    );
  }

  /**
   * Registra uma sessão de foco e, se vinculada a uma tarefa, incrementa
   * `completedPomodoros` dela — atomicamente, numa transação.
   */
  async create(
    userId: string,
    input: CreateFocusSession,
  ): Promise<FocusSessionRow> {
    return this.db.transaction(async (tx) => {
      const [row] = await tx
        .insert(focusSessions)
        .values({
          userId,
          startedAt: new Date(input.startedAt),
          endedAt: new Date(input.endedAt),
          durationSeconds: input.durationSeconds,
          taskId: input.taskId ?? null,
        })
        .returning();

      if (input.taskId) {
        await tx
          .update(tasks)
          .set({ completedPomodoros: sql`${tasks.completedPomodoros} + 1` })
          .where(and(eq(tasks.id, input.taskId), eq(tasks.userId, userId)));
      }

      return row;
    });
  }
}
