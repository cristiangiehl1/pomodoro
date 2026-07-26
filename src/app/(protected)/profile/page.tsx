import type { Metadata } from "next";
import { getSession } from "@/lib/get-session";
import { SoftCard } from "@/components/shared/soft-card";
import { LinkedAccounts } from "@/components/profile/linked-accounts";
import { SpotifyConnection } from "@/components/profile/spotify-connection";

export const metadata: Metadata = {
  title: "Perfil",
  description: "Gerencie suas contas vinculadas e integrações.",
};

export default async function ProfilePage() {
  const session = await getSession();
  const user = session?.user;

  return (
    <main className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-10 pt-6 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-foreground">
        Perfil
      </h1>
      {user && (
        <p className="mt-1 text-sm text-muted-foreground">
          {user.name ? `${user.name} · ` : ""}
          {user.email}
        </p>
      )}

      <div className="mt-6 space-y-5">
        <SoftCard tone="sky" className="p-5 sm:p-6">
          <LinkedAccounts />
        </SoftCard>

        <SoftCard tone="meadow" className="p-5 sm:p-6">
          <SpotifyConnection />
        </SoftCard>
      </div>
    </main>
  );
}
