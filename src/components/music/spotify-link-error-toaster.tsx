"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { spotifyLinkErrorMessage } from "@/queries/spotify/link-errors";

/**
 * Ao voltar do fluxo OAuth do Spotify (`oauth2.link`), o better-auth redireciona
 * para o `errorCallbackURL` com `?error=<código>` quando o vínculo falha. Este
 * componente lê esse parâmetro, mostra um toast explicando o que houve e limpa a
 * URL — sem isso, o erro chega mas fica invisível para o usuário.
 */
export function SpotifyLinkErrorToaster() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const shownRef = useRef(false);

  const errorCode = searchParams.get("error");

  useEffect(() => {
    if (!errorCode || shownRef.current) return;
    const message = spotifyLinkErrorMessage(errorCode);
    if (!message) return;

    shownRef.current = true;
    toast.error(message);

    // Remove o ?error= da URL para não reaparecer ao recarregar/navegar.
    const params = new URLSearchParams(searchParams.toString());
    params.delete("error");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }, [errorCode, pathname, router, searchParams]);

  return null;
}
