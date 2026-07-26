import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/queries/query-keys";
import { fetchSpotifyPlaylists } from "@/queries/spotify/api";

export function useSpotifyPlaylistsQuery(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.spotifyPlaylists,
    queryFn: fetchSpotifyPlaylists,
    enabled,
  });
}
