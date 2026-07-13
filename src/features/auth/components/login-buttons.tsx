"use client";

import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function LoginButtons() {
  async function handleSocial(provider: "google" | "github") {
    const { error } = await signIn.social({ provider, callbackURL: "/" });
    if (error) {
      const { toast } = await import("sonner");
      toast.error(error.message ?? `Erro ao entrar com ${provider}.`);
    }
  }

  return (
    <div className="flex flex-col gap-3 w-full max-w-sm">
      <Button
        variant="outline"
        className="w-full border-[#05d9e8]/40 text-[rgba(255,255,255,0.8)] hover:border-[#05d9e8] hover:text-[#05d9e8] transition-colors duration-200"
        onClick={() => handleSocial("google")}
      >
        Continuar com Google
      </Button>
      <Button
        variant="outline"
        className="w-full border-[#05d9e8]/40 text-[rgba(255,255,255,0.8)] hover:border-[#05d9e8] hover:text-[#05d9e8] transition-colors duration-200"
        onClick={() => handleSocial("github")}
      >
        Continuar com GitHub
      </Button>
    </div>
  );
}
