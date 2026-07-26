import { useMutation } from "@tanstack/react-query";
import { startSpotifyPlayback } from "@/queries/spotify/api";
import { showErrorToast } from "@/utils/show-error-toast";

interface PlayInput {
  deviceId: string;
  contextUri: string;
  /** URI da faixa para começar dentro do contexto (opcional). */
  offsetUri?: string;
}

export function usePlayPlaylistMutation() {
  return useMutation({
    mutationFn: ({ deviceId, contextUri, offsetUri }: PlayInput) =>
      startSpotifyPlayback(deviceId, contextUri, offsetUri),
    onError: (error: unknown) =>
      showErrorToast(error, "Não foi possível iniciar a reprodução."),
  });
}
