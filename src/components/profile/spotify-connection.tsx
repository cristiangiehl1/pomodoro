"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useSpotifyConnectionQuery } from "@/queries/spotify/use-spotify-connection-query";
import { useDisconnectSpotifyMutation } from "@/queries/spotify/use-disconnect-spotify-mutation";

export function SpotifyConnection() {
  const connectionQuery = useSpotifyConnectionQuery();
  const disconnectMutation = useDisconnectSpotifyMutation();

  const connected = connectionQuery.data ?? false;
  const loading = connectionQuery.isLoading;

  return (
    <div className="space-y-3">
      <div>
        <h2 className="font-display text-lg font-semibold">Integrações</h2>
        <p className="text-sm text-muted-foreground">
          Serviços externos conectados à sua conta.
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-lg border border-border/70 px-3 py-2">
        <div>
          <p className="text-sm font-medium">Spotify</p>
          <p className="text-xs text-muted-foreground">
            {loading ? "Verificando…" : connected ? "Conectado" : "Não conectado"}
          </p>
        </div>

        {connected ? (
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            disabled={disconnectMutation.isPending}
            onClick={() => disconnectMutation.mutate()}
          >
            {disconnectMutation.isPending ? "Desconectando…" : "Desconectar"}
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() =>
              authClient.oauth2.link({
                providerId: "spotify",
                callbackURL: "/profile",
                errorCallbackURL: "/profile",
              })
            }
          >
            Conectar
          </Button>
        )}
      </div>
    </div>
  );
}
