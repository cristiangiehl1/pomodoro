"use client";

import { useState } from "react";
import { SpotifyPlayer } from "@/components/music/spotify-player";
import { Button } from "@/components/ui/button";

/**
 * Player do Spotify flutuante (fixo no canto inferior direito). Pode ser
 * recolhido numa bolha. IMPORTANTE: o `SpotifyPlayer` fica SEMPRE montado
 * (só escondido via CSS ao recolher) — desmontá-lo desconectaria o Web
 * Playback SDK e pararia a música.
 */
export function SpotifyFloatingPlayer() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-2 right-1 sm:bottom-4 sm:right-4 z-50 flex flex-col items-end gap-2">
      {/* Card completo — sempre montado; escondido quando recolhido. */}
      <div
        className={`relative w-[min(92vw,26rem)] rounded-xl shadow-2xl ${
          open ? "block" : "hidden"
        }`}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Recolher player"
          className="absolute right-2 top-2 z-10"
          onClick={() => setOpen(false)}
        >
          –
        </Button>
        <SpotifyPlayer />
      </div>

      {/* Bolha recolhida. */}
      {!open && (
        <Button
          type="button"
          aria-label="Abrir player do Spotify"
          className="spotify-bubble size-8 text-sm sm:size-12 rounded-full sm:text-lg shadow-lg"
          onClick={() => setOpen(true)}
        >
          🎵
        </Button>
      )}
    </div>
  );
}
