import { NextResponse } from "next/server";
import { route } from "@/server/controller/route-controller";
import { readJson } from "@/server/controller/read-json";
import { requireUserId } from "@/server/auth/require-user-id";
import { FocusSessionModel } from "@/server/model/focus-session.model";
import { createFocusSessionSchema } from "@/lib/validations/focus-session";

export const GET = route(async () => {
  const userId = await requireUserId();
  const rows = await new FocusSessionModel().findByUser(userId);
  return NextResponse.json(rows);
});

export const POST = route(async (request) => {
  const userId = await requireUserId();
  const input = createFocusSessionSchema.parse(await readJson(request));
  const created = await new FocusSessionModel().create(userId, input);
  return NextResponse.json(created, { status: 201 });
});
