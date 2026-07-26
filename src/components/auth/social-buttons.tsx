"use client";

import { useState } from "react";
import { toast } from "sonner";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

type Provider = "google" | "github" | "spotify";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.24 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true" fill="currentColor">
      <path d="M12 1a11 11 0 0 0-3.48 21.44c.55.1.75-.24.75-.53v-1.85c-3.06.67-3.7-1.48-3.7-1.48-.5-1.27-1.22-1.6-1.22-1.6-1-.68.08-.67.08-.67 1.1.08 1.68 1.14 1.68 1.14.98 1.68 2.57 1.2 3.2.92.1-.71.38-1.2.7-1.48-2.44-.28-5.01-1.22-5.01-5.44 0-1.2.43-2.18 1.14-2.95-.11-.28-.5-1.4.11-2.92 0 0 .93-.3 3.05 1.13a10.6 10.6 0 0 1 5.56 0c2.12-1.43 3.05-1.13 3.05-1.13.61 1.52.22 2.64.11 2.92.71.77 1.14 1.75 1.14 2.95 0 4.23-2.58 5.16-5.03 5.43.4.34.75 1 .75 2.02v3c0 .3.2.63.76.52A11 11 0 0 0 12 1Z" />
    </svg>
  );
}

function SpotifyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="#1DB954" aria-hidden="true">
      <path d="M12 1a11 11 0 1 0 0 22 11 11 0 0 0 0-22Zm5.05 15.87a.69.69 0 0 1-.94.23c-2.58-1.58-5.83-1.93-9.66-1.06a.69.69 0 1 1-.3-1.34c4.19-.96 7.78-.55 10.67 1.22.33.2.43.63.23.95Zm1.35-3a.86.86 0 0 1-1.18.28c-2.95-1.81-7.45-2.34-10.94-1.28a.86.86 0 1 1-.5-1.65c3.98-1.2 8.94-.62 12.33 1.47.4.24.53.77.29 1.18Zm.12-3.13c-3.54-2.1-9.38-2.3-12.76-1.27a1.03 1.03 0 1 1-.6-1.97c3.88-1.18 10.33-.95 14.4 1.46a1.03 1.03 0 1 1-1.05 1.78Z" />
    </svg>
  );
}

export function SocialButtons() {
  const [pending, setPending] = useState<Provider | null>(null);

  async function handleSocial(provider: Provider) {
    setPending(provider);
    // Google/GitHub são providers nativos (signIn.social); Spotify é OAuth
    // genérico do better-auth (signIn.oauth2). Entrar já linka a conta e
    // concede os escopos de playback.
    const { error } =
      provider === "spotify"
        ? await signIn.oauth2({ providerId: "spotify", callbackURL: "/" })
        : await signIn.social({ provider, callbackURL: "/" });
    if (error) {
      toast.error(error.message ?? `Não foi possível entrar com ${provider}.`, {
        description: "Tente novamente ou use e-mail e senha.",
      });
      setPending(null);
    }
    // Em caso de sucesso, o navegador é redirecionado para o provedor.
  }

  return (
    <div className="flex flex-col gap-3">
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full gap-2 bg-background/60"
        disabled={pending !== null}
        onClick={() => handleSocial("google")}
      >
        <GoogleIcon />
        {pending === "google" ? "Conectando…" : "Continuar com Google"}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full gap-2 bg-background/60"
        disabled={pending !== null}
        onClick={() => handleSocial("github")}
      >
        <GithubIcon />
        {pending === "github" ? "Conectando…" : "Continuar com GitHub"}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full gap-2 bg-background/60"
        disabled={pending !== null}
        onClick={() => handleSocial("spotify")}
      >
        <SpotifyIcon />
        {pending === "spotify" ? "Conectando…" : "Continuar com Spotify"}
      </Button>
    </div>
  );
}
