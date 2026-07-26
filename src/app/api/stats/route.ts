import { NextResponse } from "next/server";
import { route } from "@/server/controller/route-controller";
import { requireUserId } from "@/server/auth/require-user-id";
import { FocusSessionModel } from "@/server/model/focus-session.model";

export const GET = route(async () => {
  const userId = await requireUserId();
  const totals = await new FocusSessionModel().recentDailyTotals(userId);
  return NextResponse.json(totals);
});
