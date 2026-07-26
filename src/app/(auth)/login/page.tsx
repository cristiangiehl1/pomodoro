import type { Metadata } from "next";
import Link from "next/link";
import { SoftCard } from "@/components/shared/soft-card";
import { OrDivider } from "@/components/shared/or-divider";
import { LoginForm } from "@/components/auth/login-form";
import { SocialButtons } from "@/components/auth/social-buttons";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Entre na sua conta para acessar o Pomodoro Lo‑Fi.",
};

export default function LoginPage() {
  return (
    <SoftCard tone="sky" className="p-6 sm:p-8">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Bem-vindo de volta
        </h1>
        <p className="text-sm text-muted-foreground">
          Entre para continuar de onde parou.
        </p>
      </div>

      <div className="mt-6">
        <LoginForm />
      </div>

      <div className="my-6">
        <OrDivider />
      </div>

      <SocialButtons />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Ainda não tem conta?{" "}
        <Link
          href="/register"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Criar conta
        </Link>
      </p>
    </SoftCard>
  );
}
