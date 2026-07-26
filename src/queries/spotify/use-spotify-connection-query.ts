import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/queries/query-keys";
import { fetchSpotifyConnected } from "@/queries/spotify/api";

export function useSpotifyConnectionQuery() {
  return useQuery({
    queryKey: queryKeys.spotifyConnection,
    queryFn: fetchSpotifyConnected,
  });
}
