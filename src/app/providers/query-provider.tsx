"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // No browser reutiliza o singleton; no servidor cria por render.
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
