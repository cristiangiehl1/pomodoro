import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { requirePageUserId } from "@/server/auth/require-page-user-id";
import { prefetchTasks } from "@/queries/tasks/prefetch-tasks";
import { prefetchSettings } from "@/queries/settings/prefetch-settings";
import { HomeView } from "@/components/home/home-view";

export const metadata: Metadata = {
  title: "Timer",
  description:
    "Timer Pomodoro com música lo‑fi e ambientação Studio Ghibli. Foque, descanse, repita.",
};

export default async function HomePage() {
  const userId = await requirePageUserId();
  const queryClient = getQueryClient();

  // Prefetch dos dados above-the-fold (config do timer + tarefas).
  await Promise.all([
    prefetchSettings(queryClient, userId),
    prefetchTasks(queryClient, userId),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomeView />
    </HydrationBoundary>
  );
}
