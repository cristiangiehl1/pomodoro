import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { requirePageUserId } from "@/server/auth/require-page-user-id";
import { prefetchStats } from "@/queries/stats/prefetch-stats";
import { SoftCard } from "@/components/shared/soft-card";
import { StatsChart } from "@/components/stats/stats-chart";

export const metadata: Metadata = {
  title: "Estatísticas",
  description: "Visualize seu histórico de foco dos últimos 14 dias.",
};

export default async function StatsPage() {
  const userId = await requirePageUserId();
  const queryClient = getQueryClient();

  await prefetchStats(queryClient, userId);

  return (
    <main className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-10 pt-6 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-foreground">
        Estatísticas
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Minutos de foco por dia nos últimos 14 dias.
      </p>

      <SoftCard tone="sky" className="mt-6 p-5 sm:p-6">
        <HydrationBoundary state={dehydrate(queryClient)}>
          <StatsChart />
        </HydrationBoundary>
      </SoftCard>
    </main>
  );
}
