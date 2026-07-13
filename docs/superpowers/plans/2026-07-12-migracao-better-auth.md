# Migração NextAuth → Better Auth

> Amendment ao plano principal. Executar via subagent-driven-development.

**Goal:** Substituir NextAuth/Auth.js v5 por Better Auth, adicionando login email/senha (cadastro + login) e mantendo social Google/GitHub.

**Global Constraints (herdam do plano principal):** uma lógica por arquivo; componente/função reutilizada isolada; cada query/mutation TanStack em arquivo próprio; separação client/server com metadata de SEO nos server components; Route Handlers em vez de Server Actions; zod v4; Postgres docker porta 5434; sem `Co-Authored-By`/rodapé "Generated with".

---

### Task M1: Núcleo Better Auth + schema

**Files:**
- Remove: `src/lib/auth.ts`, `src/lib/auth.config.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/providers/session-provider.tsx`
- Create: `src/lib/auth.ts` (betterAuth), `src/lib/auth-client.ts`, `src/app/api/auth/[...all]/route.ts`, `src/db/schema/auth.ts` (gerado)
- Modify: `package.json` (troca deps), `src/lib/env.ts` + `.env`/`.env.example` (BETTER_AUTH_SECRET/URL), `src/db/schema/{settings,tasks,focus-sessions,music-presets}.ts` (FK → novo `user.id`), `src/db/schema/index.ts`

**Passos:**
- Remover `next-auth` e `@auth/drizzle-adapter`; `pnpm add better-auth`.
- `src/lib/auth.ts`: `betterAuth({ database: drizzleAdapter(db,{provider:"pg"}), emailAndPassword:{enabled:true}, socialProviders:{ google:{clientId,clientSecret}, github:{clientId,clientSecret} }, plugins:[nextCookies()] })`. Ler creds de `@/lib/env`.
- `src/lib/auth-client.ts`: `createAuthClient()` de `better-auth/react`, exportando `signIn, signUp, signOut, useSession`.
- `src/app/api/auth/[...all]/route.ts`: `export const { GET, POST } = toNextJsHandler(auth)`.
- Env: adicionar `BETTER_AUTH_SECRET` (obrigatório) e `BETTER_AUTH_URL` (default `http://localhost:3000`). Remover `AUTH_SECRET`/`AUTH_URL` do schema se não usados. Manter Google/GitHub.
- Gerar schema: `pnpm dlx @better-auth/cli generate` (aponta pra `src/db/schema/auth.ts`). Ajustar imports para o padrão do projeto.
- Reapontar FKs de settings/tasks/focus-sessions/music-presets para o `user` do Better Auth (id text). `src/db/schema/index.ts` re-exporta.
- `pnpm db:push` recria as tabelas.
- Verificar `pnpm build`.

---

### Task M2: Backend — session helper + route handlers + proxy

**Files:**
- Create: `src/lib/get-session.ts`
- Modify: todos os route handlers (`tasks/route.ts`, `tasks/[id]/route.ts`, `settings/route.ts`, `focus-sessions/route.ts`, `stats/route.ts`, `music-presets/route.ts`, `spotify/login`, `spotify/callback`, `spotify/token`), `src/proxy.ts`

**Passos:**
- `get-session.ts`: `export async function getSession() { return auth.api.getSession({ headers: await headers() }); }` (retorna `{user,session}|null`).
- Em cada handler: `const session = await getSession(); if (!session?.user?.id) return 401;` `const userId = session.user.id;`. Manter toda a lógica de filtro por userId, WHERE dupla, zod, 400/404 intactos.
- `proxy.ts`: usar `getSessionCookie(request)` de `better-auth/cookies`. Redirecionar páginas protegidas (`/`, `/stats`, `/settings`) sem cookie → `/login`. Deixar `/api/*` e `/login` passarem (handlers respondem 401 próprio).
- Verificar `pnpm build`.

---

### Task M3: Frontend — login/cadastro + nav + layout

**Files:**
- Modify: `src/app/login/page.tsx` (server + metadata), `src/features/auth/components/login-buttons.tsx`, `src/components/shared/app-nav.tsx`, `src/app/layout.tsx`
- Create (se necessário): `src/features/auth/components/credentials-form.tsx`

**Passos:**
- `credentials-form.tsx` (client): form email/senha com toggle login/cadastro. Login → `authClient.signIn.email({email,password})`; cadastro → `authClient.signUp.email({name,email,password})`. Em sucesso, redireciona para `/`. Erros via `toast`.
- `login-buttons.tsx`: botões social via `authClient.signIn.social({ provider: "google"|"github" })`.
- `login/page.tsx`: server component com metadata; compõe `<CredentialsForm />` + social buttons.
- `app-nav.tsx`: signOut via `authClient.signOut()` (redireciona `/login`).
- `layout.tsx`: remover `SessionProvider` (Better Auth não precisa). Manter QueryProvider + Toaster + metadata.
- Verificar `pnpm build`, `pnpm lint` (0/0), `pnpm test` (verde).

---

### Task M4: Verificação final + revisão do branch

- `pnpm lint` 0/0, `pnpm test` verde, `pnpm build` ok.
- Revisão whole-branch da migração (consistência de auth em todos os handlers, proteção de rotas, wiring client, sem resquícios de next-auth).
