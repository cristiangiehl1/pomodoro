import type { MusicPreset, CreatePresetInput } from "./schemas";

export async function fetchPresets(): Promise<MusicPreset[]> {
  const res = await fetch("/api/music-presets");
  if (!res.ok) {
    throw new Error(`Failed to fetch presets: ${res.status}`);
  }
  return res.json() as Promise<MusicPreset[]>;
}

export async function createPreset(input: CreatePresetInput): Promise<MusicPreset> {
  const res = await fetch("/api/music-presets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    throw new Error(`Failed to create preset: ${res.status}`);
  }
  return res.json() as Promise<MusicPreset>;
}

export async function deletePreset(id: string): Promise<void> {
  const res = await fetch(`/api/music-presets?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error(`Failed to delete preset: ${res.status}`);
  }
}
