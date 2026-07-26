/** Chaves de query do TanStack, centralizadas para client e prefetch server. */
export const queryKeys = {
  tasks: ["tasks"] as const,
  settings: ["settings"] as const,
  stats: ["stats"] as const,
  accounts: ["accounts"] as const,
  spotifyConnection: ["spotify", "connection"] as const,
  spotifyPlaylists: ["spotify", "playlists"] as const,
};
