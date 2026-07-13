import type { Metadata } from "next";
import { SettingsForm } from "@/features/settings/components/settings-form";
import { GridBackground } from "@/components/shared/grid-background";
import { AppNav } from "@/components/shared/app-nav";

export const metadata: Metadata = {
  title: "Configurações",
  description: "Personalize seu timer Pomodoro: durações, pausas automáticas e som.",
};

export default function SettingsPage() {
  return (
    <div className="relative min-h-screen flex flex-col">
      <GridBackground />
      <AppNav />
      <main className="relative z-10 container mx-auto px-4 py-8">
        <h1
          className="text-2xl font-bold mb-6"
          style={{
            color: "#ff2e97",
            textShadow: "0 0 8px rgba(255,46,151,0.6)",
          }}
        >
          Configurações
        </h1>
        <SettingsForm />
      </main>
    </div>
  );
}
