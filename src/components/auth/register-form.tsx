"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUp } from "@/lib/auth-client";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { TextField } from "@/components/shared/text-field";
import { Button } from "@/components/ui/button";

export function RegisterForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(values: RegisterInput) {
    setFormError(null);
    const { error } = await signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
      callbackURL: "/",
    });
    if (error) {
      setFormError(
        error.message ?? "Não foi possível criar sua conta. Tente novamente.",
      );
      return;
    }
    router.push("/");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <TextField
        label="Nome"
        type="text"
        autoComplete="name"
        placeholder="Seu nome"
        error={errors.name?.message}
        {...register("name")}
      />
      <TextField
        label="E-mail"
        type="email"
        autoComplete="email"
        placeholder="voce@exemplo.com"
        error={errors.email?.message}
        {...register("email")}
      />
      <TextField
        label="Senha"
        type="password"
        autoComplete="new-password"
        placeholder="Ao menos 8 caracteres"
        error={errors.password?.message}
        {...register("password")}
      />
      <TextField
        label="Confirmar senha"
        type="password"
        autoComplete="new-password"
        placeholder="Repita a senha"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      {formError ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {formError}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="mt-1 w-full" disabled={isSubmitting}>
        {isSubmitting ? "Criando conta…" : "Criar conta"}
      </Button>
    </form>
  );
}
