import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/queries/query-keys";
import { authClient } from "@/lib/auth-client";

export interface LinkedAccount {
  id: string;
  providerId: string;
  accountId: string;
}

async function fetchAccounts(): Promise<LinkedAccount[]> {
  const { data, error } = await authClient.listAccounts();
  if (error) {
    throw new Error(error.message ?? "Não foi possível carregar suas contas.");
  }
  return (data ?? []).map((a) => ({
    id: a.id,
    providerId: a.providerId,
    accountId: a.accountId,
  }));
}

export function useAccountsQuery() {
  return useQuery({
    queryKey: queryKeys.accounts,
    queryFn: fetchAccounts,
  });
}
