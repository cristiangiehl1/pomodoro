import type { Metadata } from "next";
import Link from "next/link";
import { SoftCard } from "@/components/shared/soft-card";
import { OrDivider } from "@/components/shared/or-divider";
import { RegisterForm } from "@/components/auth/register-form";
import { SocialButtons } from "@/components/auth/social-buttons";

export const metadata: Metadata = {
  title: "Criar conta",
  description: "Crie sua conta para começar a focar com o Pomodoro Lo‑Fi.",
};

export default function RegisterPage() {
  return (
    <SoftCard tone="meadow" className="p-6 sm:p-8">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Crie sua conta
        </h1>
        <p className="text-sm text-muted-foreground">
          Leva menos de um minuto para começar.
        </p>
      </div>

      <div className="mt-6">
        <RegisterForm />
      </div>

      <div className="my-6">
        <OrDivider />
      </div>

      <SocialButtons />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Já tem uma conta?{" "}
        <Link
          href="/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Entrar
        </Link>
      </p>
    </SoftCard>
  );
}
