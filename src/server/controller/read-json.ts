import { BadRequestError } from "@/server/errors";

/** Lê e faz o parse do corpo JSON; lança {@link BadRequestError} se inválido. */
export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new BadRequestError("O corpo da requisição não é um JSON válido.");
  }
}
