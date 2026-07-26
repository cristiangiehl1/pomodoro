import { api } from "@/lib/ky";
import type { Settings } from "@/lib/validations/settings";

export function fetchSettings(): Promise<Settings> {
  return api.get<Settings>("settings");
}

export function updateSettings(payload: Settings): Promise<Settings> {
  return api.put<Settings>("settings", { json: payload });
}
