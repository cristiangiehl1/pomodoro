import { NextResponse } from "next/server";
import { route } from "@/server/controller/route-controller";
import { readJson } from "@/server/controller/read-json";
import { requireUserId } from "@/server/auth/require-user-id";
import { TaskModel } from "@/server/model/task.model";
import { createTaskSchema } from "@/lib/validations/task";

export const GET = route(async () => {
  const userId = await requireUserId();
  const rows = await new TaskModel().findByUser(userId);
  return NextResponse.json(rows);
});

export const POST = route(async (request) => {
  const userId = await requireUserId();
  const input = createTaskSchema.parse(await readJson(request));
  const task = await new TaskModel().create(userId, input);
  return NextResponse.json(task, { status: 201 });
});
