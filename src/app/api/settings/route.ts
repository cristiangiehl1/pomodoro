import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db/client";
import { pomodoroSettings } from "@/db/schema/settings";
import { eq } from "drizzle-orm";
import { settingsSchema } from "@/features/settings/schemas";

const defaults = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  cyclesUntilLongBreak: 4,
  autoStartBreaks: false,
  autoStartFocus: false,
  sound: "bell",
  volume: 70,
};

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const existing = await db
    .select()
    .from(pomodoroSettings)
    .where(eq(pomodoroSettings.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json(existing[0]);
  }

  const inserted = await db
    .insert(pomodoroSettings)
    .values({ userId, ...defaults })
    .returning();

  return NextResponse.json(inserted[0]);
}

export async function PUT(request: NextRequest) {
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

  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const updated = await db
    .insert(pomodoroSettings)
    .values({ userId, ...parsed.data })
    .onConflictDoUpdate({
      target: pomodoroSettings.userId,
      set: parsed.data,
    })
    .returning();

  return NextResponse.json(updated[0]);
}
