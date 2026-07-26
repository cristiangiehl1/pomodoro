import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/queries/query-keys";
import { authClient } from "@/lib/auth-client";
import { showErrorToast } from "@/utils/show-error-toast";

interface UnlinkInput {
  providerId: string;
  accountId: string;
}

async function unlinkAccount(input: UnlinkInput): Promise<void> {
  const { error } = await authClient.unlinkAccount(input);
  if (error) {
    throw new Error(error.message ?? "Não foi possível desvincular a conta.");
  }
}

export function useUnlinkAccountMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unlinkAccount,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts }),
    onError: (error: unknown) =>
      showErrorToast(error, "Não foi possível desvincular a conta."),
  });
}
