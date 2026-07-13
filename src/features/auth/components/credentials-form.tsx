"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signIn, signUp } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NeonCard } from "@/components/shared/neon-card";

type Mode = "login" | "signup";

export function CredentialsForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [pending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function validate(): string | null {
    if (!email.trim()) return "E-mail é obrigatório.";
    if (!password) return "Senha é obrigatória.";
    if (password.length < 8) return "Senha deve ter pelo menos 8 caracteres.";
    if (mode === "signup" && !name.trim()) return "Nome é obrigatório.";
    return null;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }

    startTransition(async () => {
      if (mode === "login") {
        const { error } = await signIn.email({
          email,
          password,
          callbackURL: "/",
        });
        if (error) {
          toast.error(error.message ?? "Erro ao entrar.");
          return;
        }
      } else {
        const { error } = await signUp.email({
          name,
          email,
          password,
          callbackURL: "/",
        });
        if (error) {
          toast.error(error.message ?? "Erro ao criar conta.");
          return;
        }
      }
      router.push("/");
    });
  }

  const isLogin = mode === "login";

  return (
    <NeonCard accent="magenta" className="w-full max-w-sm p-6">
      {/* Mode toggle */}
      <div className="flex mb-6 rounded-lg overflow-hidden border border-[#ff2e97]/30">
        <button
          type="button"
          onClick={() => setMode("login")}
          className="flex-1 py-2 text-sm font-medium transition-colors duration-200"
          style={
            isLogin
              ? {
                  background: "rgba(255,46,151,0.2)",
                  color: "#ff2e97",
                  textShadow: "0 0 8px rgba(255,46,151,0.7)",
                }
              : { color: "rgba(255,255,255,0.5)" }
          }
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className="flex-1 py-2 text-sm font-medium transition-colors duration-200"
          style={
            !isLogin
              ? {
                  background: "rgba(255,46,151,0.2)",
                  color: "#ff2e97",
                  textShadow: "0 0 8px rgba(255,46,151,0.7)",
                }
              : { color: "rgba(255,255,255,0.5)" }
          }
        >
          Criar conta
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {!isLogin && (
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="cred-name"
              className="text-xs text-[rgba(255,255,255,0.6)] uppercase tracking-wider"
            >
              Nome
            </Label>
            <Input
              id="cred-name"
              type="text"
              autoComplete="name"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={pending}
              className="bg-[rgba(255,255,255,0.05)] border-[#ff2e97]/30 focus-visible:border-[#ff2e97] focus-visible:ring-[#ff2e97]/20"
            />
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="cred-email"
            className="text-xs text-[rgba(255,255,255,0.6)] uppercase tracking-wider"
          >
            E-mail
          </Label>
          <Input
            id="cred-email"
            type="email"
            autoComplete="email"
            placeholder="voce@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={pending}
            className="bg-[rgba(255,255,255,0.05)] border-[#ff2e97]/30 focus-visible:border-[#ff2e97] focus-visible:ring-[#ff2e97]/20"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="cred-password"
            className="text-xs text-[rgba(255,255,255,0.6)] uppercase tracking-wider"
          >
            Senha
          </Label>
          <Input
            id="cred-password"
            type="password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={pending}
            className="bg-[rgba(255,255,255,0.05)] border-[#ff2e97]/30 focus-visible:border-[#ff2e97] focus-visible:ring-[#ff2e97]/20"
          />
        </div>

        <Button
          type="submit"
          disabled={pending}
          className="w-full mt-2 font-semibold tracking-wide transition-all duration-200"
          style={{
            background: "rgba(255,46,151,0.2)",
            border: "1px solid rgba(255,46,151,0.6)",
            color: "#ff2e97",
            boxShadow: "0 0 12px rgba(255,46,151,0.3)",
          }}
        >
          {pending
            ? isLogin
              ? "Entrando…"
              : "Criando conta…"
            : isLogin
              ? "Entrar"
              : "Criar conta"}
        </Button>
      </form>
    </NeonCard>
  );
}
