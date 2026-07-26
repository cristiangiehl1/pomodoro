import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { requirePageUserId } from "@/server/auth/require-page-user-id";
import { prefetchSettings } from "@/queries/settings/prefetch-settings";
import { SettingsForm } from "@/components/settings/settings-form";

export const metadata: Metadata = {
  title: "Configurações",
  description:
    "Personalize seu timer Pomodoro: durações, pausas automáticas e som.",
};

export default async function SettingsPage() {
  const userId = await requirePageUserId();
  const queryClient = getQueryClient();

  await prefetchSettings(queryClient, userId);

  return (
    <main className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-10 pt-6 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-foreground">
        Configurações
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Ajuste o ritmo do seu foco.
      </p>

      <div className="mt-6">
        <HydrationBoundary state={dehydrate(queryClient)}>
          <SettingsForm />
        </HydrationBoundary>
      </div>
    </main>
  );
}
