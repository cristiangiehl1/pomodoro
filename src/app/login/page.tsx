import type { Metadata } from "next";
import { CredentialsForm } from "@/features/auth/components/credentials-form";
import { LoginButtons } from "@/features/auth/components/login-buttons";

export const metadata: Metadata = {
  title: "Entrar · Pomodoro Lo‑Fi",
  description: "Entre ou crie sua conta para acessar o Pomodoro Lo‑Fi.",
};

export default function LoginPage() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-[#0a0514]">
      <div className="flex flex-col items-center gap-8 w-full max-w-sm px-4 py-12">
        {/* Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <h1
            className="text-3xl font-bold tracking-widest uppercase"
            style={{
              color: "#ff2e97",
              textShadow:
                "0 0 8px rgba(255,46,151,0.7), 0 0 20px rgba(255,46,151,0.4)",
            }}
          >
            Pomodoro Lo‑Fi
          </h1>
          <p className="text-sm text-[rgba(255,255,255,0.5)]">
            Entre ou crie sua conta para continuar
          </p>
        </div>

        {/* Credentials form (email + password, login/signup toggle) */}
        <CredentialsForm />

        {/* Divider */}
        <div className="flex items-center gap-3 w-full">
          <span className="flex-1 h-px bg-[rgba(255,46,151,0.2)]" />
          <span className="text-xs text-[rgba(255,255,255,0.35)] uppercase tracking-widest">
            ou
          </span>
          <span className="flex-1 h-px bg-[rgba(255,46,151,0.2)]" />
        </div>

        {/* Social login */}
        <LoginButtons />
      </div>
    </div>
  );
}
