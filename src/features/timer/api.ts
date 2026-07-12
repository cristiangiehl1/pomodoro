import type { CreateFocusSession } from "@/features/stats/schemas";

export async function createFocusSession(
  payload: CreateFocusSession
): Promise<unknown> {
  const res = await fetch("/api/focus-sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Failed to create focus session: ${res.status}`);
  }
  return res.json();
}

export async function fetchFocusSessions(): Promise<unknown[]> {
  const res = await fetch("/api/focus-sessions");
  if (!res.ok) {
    throw new Error(`Failed to fetch focus sessions: ${res.status}`);
  }
  return res.json() as Promise<unknown[]>;
}
