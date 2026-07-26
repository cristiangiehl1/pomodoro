"use client";

import { useSettingsQuery } from "@/queries/settings/use-settings-query";
import { SettingsFormFields } from "./settings-form-fields";

export function SettingsForm() {
  const { data: settings, isLoading, isError } = useSettingsQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Carregando configurações…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-destructive">Erro ao carregar configurações.</p>
      </div>
    );
  }

  if (!settings) {
    return null;
  }

  return <SettingsFormFields initialSettings={settings} />;
}
