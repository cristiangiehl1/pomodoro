"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateSettingsMutation } from "@/queries/settings/use-update-settings-mutation";
import type { Settings } from "@/lib/validations/settings";

const FIELDS = [
  { name: "focusMinutes", label: "Foco (min)", min: 1, max: 120 },
  { name: "shortBreakMinutes", label: "Pausa curta (min)", min: 1, max: 120 },
  { name: "longBreakMinutes", label: "Pausa longa (min)", min: 1, max: 120 },
  { name: "cyclesUntilLongBreak", label: "Ciclos até pausa longa", min: 1, max: 12 },
] as const;

type NumericField = (typeof FIELDS)[number]["name"];

interface TimerSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: Settings;
  /** Chamado após salvar, para o timer refletir as novas durações. */
  onSaved: (settings: Settings) => void;
}

export function TimerSettingsDialog({
  open,
  onOpenChange,
  settings,
  onSaved,
}: TimerSettingsDialogProps) {
  const mutation = useUpdateSettingsMutation();
  const [values, setValues] = useState<Settings>(settings);

  // Ressincroniza os campos ao abrir (padrão do React: ajuste de estado durante
  // o render ao detectar a transição de `open`, sem useEffect).
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setValues(settings);
  }

  function setField(name: NumericField, raw: string, min: number, max: number) {
    const n = Math.min(max, Math.max(min, Math.round(Number(raw) || min)));
    setValues((v) => ({ ...v, [name]: n }));
  }

  function handleSave() {
    mutation.mutate(values, {
      onSuccess: () => {
        toast.success("Configurações salvas.");
        onSaved(values);
        onOpenChange(false);
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Pomodoro</DialogTitle>
          <DialogDescription>
            Ajuste as durações e quantos ciclos até a pausa longa.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          {FIELDS.map((field) => (
            <div
              key={field.name}
              className="flex items-center justify-between gap-3"
            >
              <Label htmlFor={field.name}>{field.label}</Label>
              <Input
                id={field.name}
                type="number"
                min={field.min}
                max={field.max}
                className="h-9 w-24"
                value={values[field.name]}
                onChange={(e) =>
                  setField(field.name, e.target.value, field.min, field.max)
                }
              />
            </div>
          ))}
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
          <Button onClick={handleSave} disabled={mutation.isPending}>
            {mutation.isPending ? "Salvando…" : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
