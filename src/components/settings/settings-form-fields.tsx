"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { SoftCard } from "@/components/shared/soft-card";
import { useUpdateSettingsMutation } from "@/queries/settings/use-update-settings-mutation";
import { settingsSchema, type Settings } from "@/lib/validations/settings";

interface SettingsFormFieldsProps {
  initialSettings: Settings;
}

const DURATION_FIELDS = [
  { name: "focusMinutes", label: "Foco (minutos)", min: 1, max: 120 },
  { name: "shortBreakMinutes", label: "Pausa curta (minutos)", min: 1, max: 120 },
  { name: "longBreakMinutes", label: "Pausa longa (minutos)", min: 1, max: 120 },
  { name: "cyclesUntilLongBreak", label: "Ciclos até pausa longa", min: 1, max: 12 },
] as const;

export function SettingsFormFields({ initialSettings }: SettingsFormFieldsProps) {
  const mutation = useUpdateSettingsMutation();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Settings>({
    resolver: zodResolver(settingsSchema),
    defaultValues: initialSettings,
  });

  function onSubmit(values: Settings) {
    mutation.mutate(values, {
      onSuccess: () => toast.success("Configurações salvas com sucesso."),
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      <SoftCard tone="sky" className="space-y-4 p-5 sm:p-6">
        <h2 className="font-display text-lg font-semibold">Durações</h2>

        {DURATION_FIELDS.map((field) => (
          <div key={field.name} className="space-y-1.5">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Input
              id={field.name}
              type="number"
              min={field.min}
              max={field.max}
              className="h-10 max-w-40"
              aria-invalid={errors[field.name] ? true : undefined}
              {...register(field.name, { valueAsNumber: true })}
            />
            {errors[field.name] ? (
              <p className="text-xs text-destructive">
                {errors[field.name]?.message}
              </p>
            ) : null}
          </div>
        ))}
      </SoftCard>

      <SoftCard tone="meadow" className="space-y-4 p-5 sm:p-6">
        <h2 className="font-display text-lg font-semibold">Comportamento</h2>

        <div className="flex items-center justify-between">
          <Label htmlFor="autoStartBreaks">Iniciar pausas automaticamente</Label>
          <Controller
            control={control}
            name="autoStartBreaks"
            render={({ field }) => (
              <Switch
                id="autoStartBreaks"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="autoStartFocus">Iniciar foco automaticamente</Label>
          <Controller
            control={control}
            name="autoStartFocus"
            render={({ field }) => (
              <Switch
                id="autoStartFocus"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>
      </SoftCard>

      <SoftCard tone="amber" className="space-y-4 p-5 sm:p-6">
        <h2 className="font-display text-lg font-semibold">Som</h2>

        <div className="space-y-1.5">
          <Label htmlFor="sound">Notificação sonora</Label>
          <Input
            id="sound"
            type="text"
            placeholder="bell"
            className="h-10 max-w-xs"
            aria-invalid={errors.sound ? true : undefined}
            {...register("sound")}
          />
          {errors.sound ? (
            <p className="text-xs text-destructive">{errors.sound.message}</p>
          ) : null}
        </div>

        <Controller
          control={control}
          name="volume"
          render={({ field }) => (
            <div className="space-y-2">
              <Label>Volume: {field.value}%</Label>
              <Slider
                min={0}
                max={100}
                value={[field.value]}
                onValueChange={(val) =>
                  field.onChange(Array.isArray(val) ? val[0] : val)
                }
              />
            </div>
          )}
        />
      </SoftCard>

      <div>
        <Button type="submit" size="lg" disabled={mutation.isPending}>
          {mutation.isPending ? "Salvando…" : "Salvar configurações"}
        </Button>
      </div>
    </form>
  );
}
