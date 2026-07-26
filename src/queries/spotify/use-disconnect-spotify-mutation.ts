import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/queries/query-keys";
import { disconnectSpotify } from "@/queries/spotify/api";
import { showErrorToast } from "@/utils/show-error-toast";

export function useDisconnectSpotifyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: disconnectSpotify,
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.spotifyConnection, false);
      queryClient.invalidateQueries({ queryKey: queryKeys.spotifyPlaylists });
    },
    onError: (error: unknown) =>
      showErrorToast(error, "Não foi possível desconectar o Spotify."),
  });
}
