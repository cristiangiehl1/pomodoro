import type { Metadata } from "next";
import { SettingsForm } from "@/features/settings/components/settings-form";

export const metadata: Metadata = {
  title: "Configurações",
  description: "Personalize seu timer Pomodoro: durações, pausas automáticas e som.",
};

export default function SettingsPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Configurações</h1>
      <SettingsForm />
    </main>
  );
}
