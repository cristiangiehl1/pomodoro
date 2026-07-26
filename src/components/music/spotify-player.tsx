"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/queries/query-keys";
import {
  fetchSpotifyAccessToken,
  setSpotifyShuffle,
} from "@/queries/spotify/api";
import { useSpotifyConnectionQuery } from "@/queries/spotify/use-spotify-connection-query";
import { useSpotifyPlaylistsQuery } from "@/queries/spotify/use-spotify-playlists-query";
import { usePlayPlaylistMutation } from "@/queries/spotify/use-play-playlist-mutation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** Inicia o fluxo OAuth para linkar/re-autorizar a conta do Spotify. */
function linkSpotify() {
  authClient.oauth2.link({ providerId: "spotify", callbackURL: "/" });
}

// Tipos mínimos do Spotify Web Playback SDK
interface SpotifyPlayer {
  connect(): Promise<boolean>;
  disconnect(): void;
  addListener(event: string, cb: (arg: unknown) => void): void;
  togglePlay(): Promise<void>;
  nextTrack(): Promise<void>;
  previousTrack(): Promise<void>;
  setVolume(volume: number): Promise<void>;
}

interface SpotifyPlaybackState {
  paused: boolean;
  shuffle: boolean;
  track_window: {
    current_track: {
      uri: string;
      name: string;
      artists: { name: string }[];
      album: { images: { url: string }[] };
    };
  };
}

interface SpotifySDK {
  Player: new (options: {
    name: string;
    getOAuthToken: (cb: (token: string) => void) => void;
    volume?: number;
  }) => SpotifyPlayer;
}

declare global {
  interface Window {
    Spotify?: SpotifySDK;
    onSpotifyWebPlaybackSDKReady?: () => void;
  }
}

export function SpotifyPlayer() {
  const queryClient = useQueryClient();
  const connectionQuery = useSpotifyConnectionQuery();
  const connected = connectionQuery.data ?? false;
  const playlistsQuery = useSpotifyPlaylistsQuery(connected);
  const playMutation = usePlayPlaylistMutation();

  const [playerReady, setPlayerReady] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(true);
  const [isShuffle, setIsShuffle] = useState(false);
  const [volume, setVolume] = useState(0.5);
  // Guarda o volume anterior ao mutar, para restaurar ao desmutar.
  const [lastVolume, setLastVolume] = useState(0.5);
  const [currentTrack, setCurrentTrack] = useState<{
    name: string;
    artist: string;
    albumArt?: string;
  } | null>(null);

  const playerRef = useRef<SpotifyPlayer | null>(null);
  const sdkLoadedRef = useRef(false);

  const markDisconnected = useCallback(() => {
    queryClient.setQueryData(queryKeys.spotifyConnection, false);
  }, [queryClient]);

  const initPlayer = useCallback(() => {
    if (typeof window === "undefined" || !window.Spotify) return;

    const player = new window.Spotify.Player({
      name: "Pomodoro Player",
      getOAuthToken: (cb) => {
        fetchSpotifyAccessToken().then((token) => {
          if (token) cb(token);
        });
      },
      volume: 0.5,
    });

    player.addListener("ready", (arg) => {
      const { device_id } = arg as { device_id: string };
      setDeviceId(device_id);
      setPlayerReady(true);
    });
    player.addListener("not_ready", () => setPlayerReady(false));

    player.addListener("initialization_error", (e) => {
      console.error("[spotify] initialization_error", e);
      toast.error(
        "Não foi possível inicializar o player. No Linux, isso quase sempre é falta do Widevine (DRM) — use o Chrome ou habilite o Widevine.",
      );
    });
    player.addListener("authentication_error", (e) => {
      console.error("[spotify] authentication_error", e);
      toast.error("Erro de autenticação com o Spotify. Reconecte sua conta.");
      markDisconnected();
    });
    player.addListener("account_error", (e) => {
      console.error("[spotify] account_error", e);
      toast.error("O Spotify recusou a conta para o player (exige Premium ativo).");
    });
    player.addListener("playback_error", (e) => {
      console.error("[spotify] playback_error", e);
      toast.error("Erro ao reproduzir. Veja o console para detalhes.");
    });

    player.addListener("player_state_changed", (stateRaw) => {
      const state = stateRaw as SpotifyPlaybackState | null;
      if (!state) return;
      setIsPaused(state.paused);
      setIsShuffle(state.shuffle);
      const track = state.track_window.current_track;
      setCurrentTrack({
        name: track.name,
        artist: track.artists.map((a) => a.name).join(", "),
        albumArt: track.album.images[0]?.url,
      });
    });

    player.connect().then((ok) => {
      if (!ok) toast.error("Não foi possível conectar ao Spotify.");
    });

    playerRef.current = player;
  }, [markDisconnected]);

  // Carrega o SDK quando conectado (integração com sistema externo).
  useEffect(() => {
    if (!connected || sdkLoadedRef.current || typeof window === "undefined") {
      return;
    }
    sdkLoadedRef.current = true;

    if (window.Spotify) {
      initPlayer();
      return;
    }
    window.onSpotifyWebPlaybackSDKReady = initPlayer;
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      playerRef.current?.disconnect();
    };
  }, [connected, initPlayer]);

  function playPlaylist(contextUri: string) {
    if (!deviceId) return;
    playMutation.mutate({ deviceId, contextUri });
  }

  async function safe(action: (() => Promise<void>) | undefined) {
    if (!action) return;
    try {
      await action();
    } catch {
      toast.error("Erro ao controlar a reprodução.");
    }
  }

  async function toggleShuffle() {
    if (!deviceId) return;
    const next = !isShuffle;
    try {
      await setSpotifyShuffle(next);
      setIsShuffle(next);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível alterar o modo aleatório.",
      );
    }
  }

  function changeVolume(next: number) {
    const clamped = Math.min(1, Math.max(0, next));
    setVolume(clamped);
    playerRef.current?.setVolume(clamped).catch(() => {});
  }

  function toggleMute() {
    if (volume > 0) {
      setLastVolume(volume);
      changeVolume(0);
    } else {
      changeVolume(lastVolume > 0 ? lastVolume : 0.5);
    }
  }

  // Sinaliza no <html> quando há música tocando — o widget flutuante usa isso
  // (via CSS) para animar a bolha recolhida.
  useEffect(() => {
    const root = document.documentElement;
    const playing = !isPaused && currentTrack !== null;
    if (playing) {
      root.dataset.spotifyPlaying = "true";
    } else {
      delete root.dataset.spotifyPlaying;
    }
    return () => {
      delete root.dataset.spotifyPlaying;
    };
  }, [isPaused, currentTrack]);

  // Loading
  if (connectionQuery.isLoading) {
    return (
      <Card className="mx-auto w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Spotify</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Carregando…</p>
        </CardContent>
      </Card>
    );
  }

  // Não conectado
  if (!connected) {
    return (
      <Card className="mx-auto w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Spotify</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Conecte sua conta Spotify para ouvir suas playlists enquanto trabalha.
            Requer conta Premium.
          </p>
          <Button onClick={linkSpotify}>Conectar Spotify</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Spotify</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Now playing + transporte (anterior, play/pause, próxima, aleatório) */}
        {currentTrack && (
          <div className="flex items-center gap-3 rounded-lg border border-border/70 p-2">
            {currentTrack.albumArt && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentTrack.albumArt}
                alt=""
                className="h-12 w-12 rounded"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{currentTrack.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {currentTrack.artist}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={!playerReady}
                aria-label="Anterior"
                onClick={() => safe(() => playerRef.current!.previousTrack())}
              >
                ⏮
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                disabled={!playerReady}
                aria-label={isPaused ? "Reproduzir" : "Pausar"}
                onClick={() => safe(() => playerRef.current!.togglePlay())}
              >
                {isPaused ? "▶" : "⏸"}
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={!playerReady}
                aria-label="Próxima"
                onClick={() => safe(() => playerRef.current!.nextTrack())}
              >
                ⏭
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={!playerReady}
                aria-pressed={isShuffle}
                aria-label={isShuffle ? "Desativar aleatório" : "Ativar aleatório"}
                className={isShuffle ? "text-primary" : ""}
                onClick={toggleShuffle}
              >
                🔀
              </Button>
            </div>
          </div>
        )}

        {!playerReady && (
          <p className="text-xs text-muted-foreground">Inicializando player…</p>
        )}

        {/* Controle de volume (0–100%); clicar no ícone alterna mudo */}
        {playerReady && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleMute}
              aria-label={volume === 0 ? "Ativar som" : "Silenciar"}
              className="shrink-0 text-sm leading-none"
            >
              {volume === 0 ? "🔇" : "🔊"}
            </button>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={Math.round(volume * 100)}
              onChange={(e) => changeVolume(Number(e.target.value) / 100)}
              aria-label="Volume"
              className="h-1 w-full cursor-pointer accent-primary"
            />
            <span className="w-9 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
              {Math.round(volume * 100)}%
            </span>
          </div>
        )}

        {/* Lista de playlists — clique para tocar */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Suas playlists</p>

          {playlistsQuery.isLoading && (
            <p className="text-sm text-muted-foreground">Carregando playlists…</p>
          )}
          {playlistsQuery.isError && (
            <p className="text-sm text-destructive">
              Não foi possível carregar suas playlists.
            </p>
          )}
          {playlistsQuery.data && playlistsQuery.data.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhuma playlist encontrada.
            </p>
          )}
          {playlistsQuery.data && playlistsQuery.data.length > 0 && (
            <ul className="max-h-72 space-y-1 overflow-y-auto pr-1">
              {playlistsQuery.data.map((playlist) => (
                <li key={playlist.id}>
                  <button
                    type="button"
                    disabled={!playerReady}
                    onClick={() => playPlaylist(playlist.uri)}
                    className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {playlist.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={playlist.image}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded object-cover"
                      />
                    ) : (
                      <span className="h-10 w-10 shrink-0 rounded bg-muted" />
                    )}
                    <span className="block min-w-0 flex-1 truncate text-sm font-medium">
                      {playlist.name}
                    </span>
                    <span className="shrink-0 text-xs font-medium text-primary">
                      ▶ Tocar
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Requer Spotify Premium.
        </p>
      </CardContent>
    </Card>
  );
}
