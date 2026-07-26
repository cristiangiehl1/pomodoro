import { NextResponse } from "next/server";
import { route } from "@/server/controller/route-controller";
import { readJson } from "@/server/controller/read-json";
import { requireUserId } from "@/server/auth/require-user-id";
import { SettingsModel } from "@/server/model/settings.model";
import { settingsSchema } from "@/lib/validations/settings";

export const GET = route(async () => {
  const userId = await requireUserId();
  const settings = await new SettingsModel().findOrCreate(userId);
  return NextResponse.json(settings);
});

export const PUT = route(async (request) => {
  const userId = await requireUserId();
  const values = settingsSchema.parse(await readJson(request));
  const settings = await new SettingsModel().upsert(userId, values);
  return NextResponse.json(settings);
});
