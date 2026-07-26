import { getSession } from "@/lib/get-session";
import { UnauthorizedError } from "@/server/errors";

/**
 * Retorna o `id` do usuário autenticado ou lança {@link UnauthorizedError}
 * (mapeada para 401 pelo RouteController). Usado no início de todo handler
 * protegido.
 */
export async function requireUserId(): Promise<string> {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new UnauthorizedError();
  }
  return session.user.id;
}
