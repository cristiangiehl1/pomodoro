"use client";

import { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface TextFieldProps extends React.ComponentProps<"input"> {
  label: string;
  /** Mensagem de erro (ex.: `formState.errors.email?.message` do react-hook-form). */
  error?: string;
}

/**
 * Campo de formulário reutilizável: label + input + mensagem de erro.
 * Pensado para ser usado com `<form>` nativo + react-hook-form:
 * `<TextField label="E-mail" error={errors.email?.message} {...register("email")} />`.
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField({ label, error, id, name, className, ...props }, ref) {
    const fieldId = id ?? name;
    const errorId = error ? `${fieldId}-error` : undefined;

    return (
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={fieldId} className="text-sm font-medium text-foreground/80">
          {label}
        </Label>
        <Input
          id={fieldId}
          name={name}
          ref={ref}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className={cn("h-10 bg-background/60", className)}
          {...props}
        />
        {error ? (
          <p id={errorId} className="text-xs text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
