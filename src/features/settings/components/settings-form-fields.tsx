"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { useUpdateSettingsMutation } from "../mutations/use-update-settings-mutation";
import type { Settings } from "../schemas";

interface SettingsFormFieldsProps {
  initialSettings: Settings;
}

export function SettingsFormFields({ initialSettings }: SettingsFormFieldsProps) {
  const mutation = useUpdateSettingsMutation();
  const [form, setForm] = useState<Settings>(() => initialSettings);

  function updateField<K extends keyof Settings>(key: K, value: Settings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutation.mutate(form, {
      onSuccess: () => {
        toast.success("Configurações salvas com sucesso");
      },
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold">Durações</h2>

        <div className="space-y-2">
          <Label htmlFor="focusMinutes">Foco (minutos)</Label>
          <Input
            id="focusMinutes"
            type="number"
            min={1}
            max={120}
            value={form.focusMinutes}
            onChange={(e) => updateField("focusMinutes", Number(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="shortBreakMinutes">Pausa curta (minutos)</Label>
          <Input
            id="shortBreakMinutes"
            type="number"
            min={1}
            max={120}
            value={form.shortBreakMinutes}
            onChange={(e) => updateField("shortBreakMinutes", Number(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="longBreakMinutes">Pausa longa (minutos)</Label>
          <Input
            id="longBreakMinutes"
            type="number"
            min={1}
            max={120}
            value={form.longBreakMinutes}
            onChange={(e) => updateField("longBreakMinutes", Number(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cyclesUntilLongBreak">Ciclos até pausa longa</Label>
          <Input
            id="cyclesUntilLongBreak"
            type="number"
            min={1}
            max={12}
            value={form.cyclesUntilLongBreak}
            onChange={(e) => updateField("cyclesUntilLongBreak", Number(e.target.value))}
          />
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold">Comportamento</h2>

        <div className="flex items-center justify-between">
          <Label htmlFor="autoStartBreaks">Iniciar pausas automaticamente</Label>
          <Switch
            id="autoStartBreaks"
            checked={form.autoStartBreaks}
            onCheckedChange={(checked) => updateField("autoStartBreaks", checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="autoStartFocus">Iniciar foco automaticamente</Label>
          <Switch
            id="autoStartFocus"
            checked={form.autoStartFocus}
            onCheckedChange={(checked) => updateField("autoStartFocus", checked)}
          />
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold">Som</h2>

        <div className="space-y-2">
          <Label htmlFor="sound">Notificação sonora</Label>
          <Input
            id="sound"
            type="text"
            placeholder="bell"
            value={form.sound}
            onChange={(e) => updateField("sound", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Volume: {form.volume}%</Label>
          <Slider
            min={0}
            max={100}
            value={[form.volume]}
            onValueChange={(val) =>
              updateField("volume", Array.isArray(val) ? (val as number[])[0] : (val as number))
            }
          />
        </div>
      </Card>

      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Salvando…" : "Salvar configurações"}
      </Button>
    </form>
  );
}
