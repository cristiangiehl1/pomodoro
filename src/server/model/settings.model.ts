import { eq } from "drizzle-orm";
import { pomodoroSettings } from "@/server/db/schema";
import { BaseModel } from "./base.model";
import type { Settings } from "@/lib/validations/settings";

export type SettingsRow = typeof pomodoroSettings.$inferSelect;

const DEFAULTS: Settings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  cyclesUntilLongBreak: 4,
  autoStartBreaks: false,
  autoStartFocus: false,
  sound: "bell",
  volume: 70,
};

/** Configurações do Pomodoro (1:1 com o usuário). */
export class SettingsModel extends BaseModel {
  /** Busca as configurações; cria com defaults na primeira vez. */
  async findOrCreate(userId: string): Promise<SettingsRow> {
    const existing = await this.db
      .select()
      .from(pomodoroSettings)
      .where(eq(pomodoroSettings.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    const [row] = await this.db
      .insert(pomodoroSettings)
      .values({ userId, ...DEFAULTS })
      .returning();

    return row;
  }

  /** Upsert das configurações do usuário. */
  async upsert(userId: string, values: Settings): Promise<SettingsRow> {
    const [row] = await this.db
      .insert(pomodoroSettings)
      .values({ userId, ...values })
      .onConflictDoUpdate({
        target: pomodoroSettings.userId,
        set: values,
      })
      .returning();

    return row;
  }
}
