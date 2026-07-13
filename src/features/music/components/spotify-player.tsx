"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Minimal ambient types for the Spotify Web Playback SDK
interface SpotifyPlayer {
  connect(): Promise<boolean>;
  disconnect(): void;
  addListener(event: string, cb: (arg: unknown) => void): void;
  removeListener(event: string, cb?: (arg: unknown) => void): void;
  togglePlay(): Promise<void>;
  getCurrentState(): Promise<SpotifyPlaybackState | null>;
}

interface SpotifyPlaybackState {
  paused: boolean;
  position: number;
  duration: number;
  track_window: {
    current_track: {
      name: string;
      artists: { name: string }[];
      album: { name: string; images: { url: string }[] };
    };
  };
}

interface SpotifyReadyEvent {
  device_id: string;
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

async function fetchAccessToken(): Promise<string | null> {
  try {
    const res = await fetch("/api/spotify/token");
    if (!res.ok) return null;
    const data = (await res.json()) as { accessToken?: string };
    return data.accessToken ?? null;
  } catch {
    return null;
  }
}

export function SpotifyPlayer() {
  const [connected, setConnected] = useState<boolean | null>(null); // null = loading
  const [playerReady, setPlayerReady] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [currentTrack, setCurrentTrack] = useState<{
    name: string;
    artist: string;
    albumArt?: string;
  } | null>(null);

  const playerRef = useRef<SpotifyPlayer | null>(null);
  const sdkLoadedRef = useRef(false);

  // Check if Spotify is connected on mount
  useEffect(() => {
    fetch("/api/spotify/token")
      .then((res) => {
        if (res.ok) {
          setConnected(true);
        } else {
          setConnected(false);
        }
      })
      .catch(() => setConnected(false));
  }, []);

  const initPlayer = useCallback(() => {
    if (typeof window === "undefined" || !window.Spotify) return;

    const player = new window.Spotify.Player({
      name: "Pomodoro Player",
      getOAuthToken: (cb) => {
        fetchAccessToken().then((token) => {
          if (token) cb(token);
        });
      },
      volume: 0.5,
    });

    player.addListener("ready", (_event) => {
      setPlayerReady(true);
    });

    player.addListener("not_ready", () => {
      setPlayerReady(false);
    });

    player.addListener("initialization_error", () => {
      toast.error(
        "Erro ao inicializar o player do Spotify. Tente usar o YouTube.",
      );
    });

    player.addListener("authentication_error", () => {
      toast.error(
        "Erro de autenticação com o Spotify. Reconecte sua conta.",
      );
      setConnected(false);
    });

    player.addListener("account_error", () => {
      toast.error(
        "O Spotify requer uma conta Premium para usar o player. Tente usar o YouTube como alternativa.",
      );
    });

    player.addListener("player_state_changed", (stateRaw) => {
      const state = stateRaw as SpotifyPlaybackState | null;
      if (!state) return;
      setIsPaused(state.paused);
      const track = state.track_window.current_track;
      setCurrentTrack({
        name: track.name,
        artist: track.artists.map((a) => a.name).join(", "),
        albumArt: track.album.images[0]?.url,
      });
    });

    player.connect().then((success) => {
      if (!success) {
        toast.error("Não foi possível conectar ao Spotify.");
      }
    });

    playerRef.current = player;
  }, []);

  // Load Spotify SDK when connected
  useEffect(() => {
    if (!connected || sdkLoadedRef.current || typeof window === "undefined") {
      return;
    }

    sdkLoadedRef.current = true;

    // If SDK already loaded
    if (window.Spotify) {
      initPlayer();
      return;
    }

    // SDK will call this when ready
    window.onSpotifyWebPlaybackSDKReady = initPlayer;

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (playerRef.current) {
        playerRef.current.disconnect();
      }
    };
  }, [connected, initPlayer]);

  async function handleTogglePlay() {
    if (!playerRef.current) return;
    try {
      await playerRef.current.togglePlay();
    } catch {
      toast.error("Erro ao controlar a reprodução.");
    }
  }

  // Loading state
  if (connected === null) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Spotify</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  // Not connected
  if (!connected) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Spotify</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Conecte sua conta Spotify para ouvir músicas enquanto trabalha.
            Requer conta Premium.
          </p>
          <Button onClick={() => { window.location.href = "/api/spotify/login"; }}>
            Conectar Spotify
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Connected — show player
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Spotify</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!playerReady && (
          <p className="text-sm text-muted-foreground">
            Inicializando player...
          </p>
        )}

        {playerReady && currentTrack && (
          <div className="flex items-center gap-3">
            {currentTrack.albumArt && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentTrack.albumArt}
                alt="Capa do álbum"
                className="w-12 h-12 rounded"
              />
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{currentTrack.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {currentTrack.artist}
              </p>
            </div>
          </div>
        )}

        {playerReady && (
          <div className="flex gap-2">
            <Button onClick={handleTogglePlay} variant="outline" size="sm">
              {isPaused ? "Reproduzir" : "Pausar"}
            </Button>
          </div>
        )}

        {playerReady && !currentTrack && (
          <p className="text-xs text-muted-foreground">
            Inicie a reprodução no Spotify e transfira para este dispositivo.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
