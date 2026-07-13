import { NextResponse } from "next/server";
import { getSession } from "@/lib/get-session";
import { db } from "@/db/client";
import { focusSessions } from "@/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { aggregateByDay } from "@/features/stats/logic/aggregate-sessions";

export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const rows = await db
    .select({
      startedAt: focusSessions.startedAt,
      durationSeconds: focusSessions.durationSeconds,
    })
    .from(focusSessions)
    .where(
      and(
        eq(focusSessions.userId, userId),
        gte(focusSessions.startedAt, fourteenDaysAgo)
      )
    );

  const mapped = rows.map((row) => ({
    startedAt: row.startedAt.toISOString(),
    durationSeconds: row.durationSeconds,
  }));

  return NextResponse.json(aggregateByDay(mapped));
}
