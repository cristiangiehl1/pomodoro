import type { Settings } from "./schemas";

export async function fetchSettings(): Promise<Settings> {
  const res = await fetch("/api/settings");
  if (!res.ok) {
    throw new Error(`Failed to fetch settings: ${res.status}`);
  }
  return res.json() as Promise<Settings>;
}

export async function updateSettings(payload: Settings): Promise<Settings> {
  const res = await fetch("/api/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Failed to update settings: ${res.status}`);
  }
  return res.json() as Promise<Settings>;
}
