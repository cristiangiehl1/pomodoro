import ky from "ky";
import { authClient } from "@/lib/auth-client";

const SPOTIFY_PROVIDER_ID = "spotify";

export interface SpotifyPlaylist {
  id: string;
  name: string;
  uri: string;
  image?: string;
}

/**
 * Access token atual do Spotify, obtido do better-auth (conta OAuth linkada).
 * O better-auth renova o token sozinho quando expira. Retorna `null` quando a
 * conta não está linkada. Usado pelas queries e pelo `getOAuthToken` do SDK.
 */
export async function fetchSpotifyAccessToken(): Promise<string | null> {
  const { data } = await authClient.getAccessToken({
    providerId: SPOTIFY_PROVIDER_ID,
  });
  return data?.accessToken ?? null;
}

/** `true` se a conta do Spotify está linkada ao usuário. */
export async function fetchSpotifyConnected(): Promise<boolean> {
  const { data } = await authClient.listAccounts();
  return data?.some((a) => a.providerId === SPOTIFY_PROVIDER_ID) ?? false;
}

/** Playlists do usuário no Spotify. */
export async function fetchSpotifyPlaylists(): Promise<SpotifyPlaylist[]> {
  const token = await fetchSpotifyAccessToken();
  if (!token) throw new Error("Conecte sua conta do Spotify.");

  const res = await ky.get("https://api.spotify.com/v1/me/playlists", {
    searchParams: { limit: "50" },
    headers: { Authorization: `Bearer ${token}` },
    throwHttpErrors: false,
  });

  if (res.status === 403) {
    throw new Error("Sem permissão para ler suas playlists. Reconecte o Spotify.");
  }
  if (!res.ok) {
    throw new Error("Não foi possível carregar suas playlists.");
  }

  const data = await res.json<{
    items: {
      id: string;
      name: string;
      uri: string;
      images: { url: string }[];
    }[];
  }>();

  return data.items.map((p) => ({
    id: p.id,
    name: p.name,
    uri: p.uri,
    image: p.images?.[0]?.url,
  }));
}

/**
 * Inicia a reprodução no dispositivo informado. Se `offsetUri` for passado,
 * começa nessa faixa dentro do contexto (mantendo a fila para next/previous).
 */
export async function startSpotifyPlayback(
  deviceId: string,
  contextUri: string,
  offsetUri?: string,
): Promise<void> {
  const token = await fetchSpotifyAccessToken();
  if (!token) throw new Error("Sessão do Spotify expirada. Reconecte sua conta.");

  const res = await ky.put("https://api.spotify.com/v1/me/player/play", {
    searchParams: { device_id: deviceId },
    headers: { Authorization: `Bearer ${token}` },
    json: offsetUri
      ? { context_uri: contextUri, offset: { uri: offsetUri } }
      : { context_uri: contextUri },
    throwHttpErrors: false,
  });

  if (res.ok) return; // 200/202/204 conforme o caso.
  if (res.status === 403) {
    throw new Error("Ação não permitida — o player no navegador exige Spotify Premium.");
  }
  if (res.status === 404) {
    throw new Error("Dispositivo não encontrado. Reconecte o Spotify e tente de novo.");
  }
  if (res.status === 401) {
    throw new Error("Sessão do Spotify expirada. Reconecte sua conta.");
  }
  throw new Error("Não foi possível iniciar a reprodução.");
}

/**
 * Liga/desliga o modo aleatório no dispositivo ATIVO. Não passamos `device_id`
 * de propósito: o Spotify retorna 404 "Device not found" para um device que não
 * está ativo, então miramos o que já está tocando (o nosso player, após dar play).
 */
export async function setSpotifyShuffle(state: boolean): Promise<void> {
  const token = await fetchSpotifyAccessToken();
  if (!token) throw new Error("Sessão do Spotify expirada. Reconecte sua conta.");

  const res = await ky.put("https://api.spotify.com/v1/me/player/shuffle", {
    searchParams: { state: String(state) },
    headers: { Authorization: `Bearer ${token}` },
    throwHttpErrors: false,
  });

  if (res.ok) return; // Spotify pode responder 200 ou 204 aqui.

  const detail = await res.text().catch(() => "");
  console.error("[spotify] /me/player/shuffle", res.status, detail);

  if (res.status === 403) {
    throw new Error("Ação não permitida — o player no navegador exige Spotify Premium.");
  }
  if (res.status === 404) {
    throw new Error("Toque uma playlist primeiro para poder alternar o aleatório.");
  }
  throw new Error(`Não foi possível alterar o modo aleatório (HTTP ${res.status}).`);
}

/** Desconecta o Spotify (desvincula a conta OAuth no better-auth). */
export async function disconnectSpotify(): Promise<void> {
  const { error } = await authClient.unlinkAccount({
    providerId: SPOTIFY_PROVIDER_ID,
  });
  if (error) {
    throw new Error(error.message ?? "Não foi possível desconectar o Spotify.");
  }
}
