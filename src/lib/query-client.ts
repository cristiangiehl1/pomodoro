import {
  QueryClient,
  defaultShouldDehydrateQuery,
  environmentManager,
} from "@tanstack/react-query";

/**
 * Cria um QueryClient com `staleTime` > 0 para que os dados injetados via
 * prefetch no servidor não sejam refetchados imediatamente na montagem
 * (evita o "flash" de loading em telas hidratadas).
 */
function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 min
      },
      dehydrate: {
        // Também desidrata queries ainda pendentes (streaming de prefetch).
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/**
 * No servidor: sempre um cliente novo por requisição.
 * No browser: um singleton reutilizado entre renders.
 */
export function getQueryClient(): QueryClient {
  if (environmentManager.isServer()) {
    return makeQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}
