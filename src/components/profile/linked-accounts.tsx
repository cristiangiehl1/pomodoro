"use client";

import { useAccountsQuery } from "@/queries/accounts/use-accounts-query";
import { useUnlinkAccountMutation } from "@/queries/accounts/use-unlink-account-mutation";
import { Button } from "@/components/ui/button";

const PROVIDER_LABELS: Record<string, string> = {
  credential: "E‑mail e senha",
  google: "Google",
  github: "GitHub",
};

function providerLabel(providerId: string) {
  return PROVIDER_LABELS[providerId] ?? providerId;
}

export function LinkedAccounts() {
  const accountsQuery = useAccountsQuery();
  const unlinkMutation = useUnlinkAccountMutation();

  const accounts = accountsQuery.data ?? [];

  return (
    <div className="space-y-3">
      <div>
        <h2 className="font-display text-lg font-semibold">Contas vinculadas</h2>
        <p className="text-sm text-muted-foreground">
          Formas de acessar sua conta. Você precisa manter pelo menos uma.
        </p>
      </div>

      {accountsQuery.isError && (
        <p className="text-sm text-destructive">
          Não foi possível carregar suas contas.
        </p>
      )}

      {accountsQuery.isLoading && (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      )}

      {accounts.length > 0 && (
        <ul className="space-y-2">
          {accounts.map((account) => {
            const isPending =
              unlinkMutation.isPending &&
              unlinkMutation.variables?.accountId === account.accountId;
            return (
              <li
                key={account.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border/70 px-3 py-2"
              >
                <span className="text-sm font-medium">
                  {providerLabel(account.providerId)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  disabled={accounts.length <= 1 || isPending}
                  title={
                    accounts.length <= 1
                      ? "Não é possível desvincular a única forma de acesso."
                      : undefined
                  }
                  onClick={() =>
                    unlinkMutation.mutate({
                      providerId: account.providerId,
                      accountId: account.accountId,
                    })
                  }
                >
                  {isPending ? "Desvinculando…" : "Desvincular"}
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
