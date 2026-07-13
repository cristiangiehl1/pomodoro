import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db/client";
import { musicPresets } from "@/db/schema/music-presets";
import { eq, and, desc } from "drizzle-orm";
import { createPresetSchema } from "@/features/music/schemas";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const rows = await db
    .select()
    .from(musicPresets)
    .where(eq(musicPresets.userId, userId))
    .orderBy(desc(musicPresets.createdAt));

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

  const parsed = createPresetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const inserted = await db
    .insert(musicPresets)
    .values({
      userId,
      kind: parsed.data.kind,
      ref: parsed.data.ref,
      label: parsed.data.label,
    })
    .returning();

  return NextResponse.json(inserted[0], { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Try query param first, then body
  const { searchParams } = new URL(request.url);
  let id = searchParams.get("id");

  if (!id) {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    if (typeof body === "object" && body !== null && "id" in body) {
      id = (body as { id: string }).id;
    }
  }

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const deleted = await db
    .delete(musicPresets)
    .where(and(eq(musicPresets.id, id), eq(musicPresets.userId, userId)))
    .returning();

  if (deleted.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
