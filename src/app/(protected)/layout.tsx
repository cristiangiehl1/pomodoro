import { Suspense } from "react";
import { AtmosphereScene } from "@/components/shared/atmosphere-scene";
import { AppNav } from "@/components/shared/app-nav";
import { SpotifyFloatingPlayer } from "@/components/music/spotify-floating-player";
import { SpotifyLinkErrorToaster } from "@/components/music/spotify-link-error-toaster";

/**
 * Shell das rotas protegidas — ambientação Ghibli lo-fi compartilhada
 * (cena + navegação). A proteção de sessão é feita no middleware (`proxy.ts`).
 */
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <AtmosphereScene />
      <AppNav />
      {children}
      <SpotifyFloatingPlayer />
      <Suspense fallback={null}>
        <SpotifyLinkErrorToaster />
      </Suspense>
    </div>
  );
}
