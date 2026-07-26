import { NextResponse } from "next/server";
import { route } from "@/server/controller/route-controller";
import { readJson } from "@/server/controller/read-json";
import { requireUserId } from "@/server/auth/require-user-id";
import { NotFoundError } from "@/server/errors";
import { TaskModel } from "@/server/model/task.model";
import { updateTaskSchema } from "@/lib/validations/task";

type Context = { params: Promise<{ id: string }> };

export const PATCH = route<Context>(async (request, { params }) => {
  const userId = await requireUserId();
  const { id } = await params;
  const patch = updateTaskSchema.parse(await readJson(request));
  const updated = await new TaskModel().update(userId, id, patch);
  if (!updated) throw new NotFoundError("Tarefa não encontrada.");
  return NextResponse.json(updated);
});

export const DELETE = route<Context>(async (_request, { params }) => {
  const userId = await requireUserId();
  const { id } = await params;
  const ok = await new TaskModel().delete(userId, id);
  if (!ok) throw new NotFoundError("Tarefa não encontrada.");
  return NextResponse.json({ ok: true });
});
