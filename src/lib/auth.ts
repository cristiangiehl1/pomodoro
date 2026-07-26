import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { genericOAuth } from "better-auth/plugins";
import { db } from "@/server/db/client";
import { env } from "@/lib/env";

// Escopos necessários: playback via Web Playback SDK + leitura das playlists.
const SPOTIFY_SCOPES = [
  "streaming",
  "user-read-email",
  "user-read-private",
  "user-modify-playback-state",
  "user-read-playback-state",
  "playlist-read-private",
  "playlist-read-collaborative",
];

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: { clientId: env.GOOGLE_CLIENT_ID ?? "", clientSecret: env.GOOGLE_CLIENT_SECRET ?? "" },
    github: { clientId: env.GITHUB_CLIENT_ID ?? "", clientSecret: env.GITHUB_CLIENT_SECRET ?? "" },
  },
  account: {
    accountLinking: {
      // Vincula automaticamente uma conta social a um usuário existente quando
      // o e-mail coincide — apenas para provedores que verificam o e-mail.
      enabled: true,
      trustedProviders: ["google", "github"],
      // Permite o vínculo mesmo quando o e-mail da conta local ainda não foi
      // verificado (cadastro por e-mail/senha não faz verificação neste app).
      requireLocalEmailVerified: false,
    },
  },
  plugins: [
    // Spotify como conta OAuth linkada: o better-auth guarda access/refresh
    // token no banco (tabela `account`) e renova sozinho via `getAccessToken`.
    genericOAuth({
      config: [
        {
          providerId: "spotify",
          clientId: env.SPOTIFY_CLIENT_ID ?? "",
          clientSecret: env.SPOTIFY_CLIENT_SECRET ?? "",
          authorizationUrl: "https://accounts.spotify.com/authorize",
          tokenUrl: "https://accounts.spotify.com/api/token",
          scopes: SPOTIFY_SCOPES,
          // Força a tela de consentimento (garante re-autorizar com escopos novos).
          authorizationUrlParams: { show_dialog: "true" },
          async getUserInfo(tokens) {
            const res = await fetch("https://api.spotify.com/v1/me", {
              headers: { Authorization: `Bearer ${tokens.accessToken}` },
            });
            if (!res.ok) return null;
            const p = (await res.json()) as {
              id: string;
              display_name: string | null;
              email: string;
              images?: { url: string }[];
            };
            return {
              id: p.id,
              name: p.display_name ?? p.id,
              email: p.email,
              image: p.images?.[0]?.url,
              emailVerified: false,
            };
          },
        },
      ],
    }),
    nextCookies(), // MUST be last
  ],
});
