import { z } from "zod";
import { musicPresets } from "@/db/schema/music-presets";

export const createPresetSchema = z.object({
  kind: z.enum(["youtube", "spotify"]),
  ref: z.string().min(1).trim(),
  label: z.string().min(1).trim(),
});

export type CreatePresetInput = z.infer<typeof createPresetSchema>;
export type MusicPreset = typeof musicPresets.$inferSelect;
