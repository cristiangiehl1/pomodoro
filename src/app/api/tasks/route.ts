import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db/client";
import { tasks } from "@/db/schema/tasks";
import { eq, asc, max } from "drizzle-orm";
import { createTaskSchema } from "@/features/tasks/schemas";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const rows = await db
    .select()
    .from(tasks)
    .where(eq(tasks.userId, userId))
    .orderBy(asc(tasks.position), asc(tasks.createdAt));

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

  const parsed = createTaskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const [maxRow] = await db
    .select({ maxPosition: max(tasks.position) })
    .from(tasks)
    .where(eq(tasks.userId, userId));

  const position = maxRow?.maxPosition != null ? maxRow.maxPosition + 1 : 0;

  const inserted = await db
    .insert(tasks)
    .values({
      userId,
      title: parsed.data.title,
      estimatedPomodoros: parsed.data.estimatedPomodoros,
      done: false,
      completedPomodoros: 0,
      position,
    })
    .returning();

  return NextResponse.json(inserted[0], { status: 201 });
}
