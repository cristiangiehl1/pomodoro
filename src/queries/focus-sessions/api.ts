import { api } from "@/lib/ky";
import type { CreateFocusSession } from "@/lib/validations/focus-session";
import type { focusSessions } from "@/server/db/schema";

type FocusSession = typeof focusSessions.$inferSelect;

export function createFocusSession(
  payload: CreateFocusSession,
): Promise<FocusSession> {
  return api.post<FocusSession>("focus-sessions", { json: payload });
}

export function fetchFocusSessions(): Promise<FocusSession[]> {
  return api.get<FocusSession[]>("focus-sessions");
}
