import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db/client";
import { focusSessions } from "@/db/schema/focus-sessions";
import { tasks } from "@/db/schema/tasks";
import { eq, and, desc, sql } from "drizzle-orm";
import { createFocusSessionSchema } from "@/features/stats/schemas";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const rows = await db
    .select()
    .from(focusSessions)
    .where(eq(focusSessions.userId, userId))
    .orderBy(desc(focusSessions.startedAt));

  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createFocusSessionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { startedAt, endedAt, durationSeconds, taskId } = parsed.data;

  const inserted = await db.transaction(async (tx) => {
    const rows = await tx
      .insert(focusSessions)
      .values({
        userId,
        startedAt: new Date(startedAt),
        endedAt: new Date(endedAt),
        durationSeconds,
        taskId: taskId ?? null,
      })
      .returning();

    if (taskId) {
      await tx
        .update(tasks)
        .set({ completedPomodoros: sql`${tasks.completedPomodoros} + 1` })
        .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));
    }

    return rows;
  });

  return NextResponse.json(inserted[0], { status: 201 });
}
