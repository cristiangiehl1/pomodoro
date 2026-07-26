import { redirect } from "next/navigation";
import { getSession } from "@/lib/get-session";

/**
 * Retorna o `id` do usuário autenticado em um Server Component de página.
 * Diferente de `requireUserId` (que lança 401 em route handlers), aqui
 * redirecionamos para `/login` quando não há sessão.
 */
export async function requirePageUserId(): Promise<string> {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session.user.id;
}
