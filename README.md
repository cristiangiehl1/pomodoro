# Pomodoro Lo‑Fi 🍃

App full‑stack de foco pelo método Pomodoro — timer configurável, lista de
tarefas, estatísticas e player de música lo‑fi (YouTube + Spotify), com
ambientação visual **lo‑fi + Studio Ghibli**.

## Stack

- **Next.js 16** (App Router) + **TypeScript**, gerenciado com **pnpm**
- **UI:** shadcn/ui (`base-nova`) + Tailwind CSS v4 — tema Ghibli lo‑fi
- **Estado de servidor no client:** TanStack Query + **ky** (cliente HTTP)
- **Formulários:** `<form>` nativo + **react-hook-form** + zod
- **Auth:** Better Auth (email/senha + Google + GitHub)
- **Banco:** PostgreSQL (Docker em dev) + **Drizzle ORM**
- **Testes:** Jest

## Arquitetura (resumo)

```
src/
  app/
    (auth)/            rotas de autenticação (login, register)
    (protected)/       rotas protegidas (timer, stats, settings)
    providers/         providers de client (TanStack Query)
    api/               route handlers (finos, via controller)
  components/          UI por domínio (+ ui/, shared/)
  hooks/               hooks de client
  queries/             TanStack Query (queries, mutations, fetchers) por entidade
  lib/                 configs de pacotes (auth, env, ky, utils, validations/)
  utils/               funções puras/globais + testes
  server/              somente servidor
    db/ errors/ controller/ auth/ model/ service/
```

Detalhes em `docs/superpowers/specs/2026-07-26-ghibli-restructure-design.md`.

### Contrato de erro da API

Todo route handler é embrulhado por `RouteController` (`src/server/controller`).
Erros estendem `ApiError` (que estende `Error`) e respondem com:

```json
{ "error": { "code": "unauthorized", "message": "…", "action": "Faça login para continuar." } }
```

O campo **`action`** direciona o usuário a um próximo passo e é exibido no toast
(via `showErrorToast`).

## Rodando localmente

```bash
# 1. Suba o Postgres
docker compose up -d

# 2. Configure o ambiente
cp .env.example .env    # e preencha as chaves

# 3. Instale as dependências e aplique o schema
pnpm install
pnpm db:push

# 4. Rode o dev server
pnpm dev                # http://127.0.0.1:3000
```

> ⚠️ Acesse sempre por **`http://127.0.0.1:3000`** (o dev server sobe com
> `-H 127.0.0.1`). O Spotify não aceita mais `localhost` como redirect, e
> cookies são por-host: abrir por `localhost` quebra a sessão e o OAuth.

### Variáveis de ambiente

Veja `.env.example`. Para **login social** com Google/GitHub, crie um OAuth App em
cada provedor e preencha `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` e
`GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET`. O callback do GitHub é
`http://127.0.0.1:3000/api/auth/callback/github`.

> ⚠️ Um *fingerprint* SSH (`SHA256:…`) **não** é uma credencial de OAuth — as chaves
> `CLIENT_ID`/`CLIENT_SECRET` vêm do OAuth App do provedor.

## Scripts

```bash
pnpm dev          # dev server
pnpm build        # build de produção
pnpm start        # servir o build
pnpm lint         # eslint
pnpm test         # jest
pnpm db:push      # aplica o schema no banco
pnpm db:generate  # gera migrations
pnpm db:migrate   # aplica migrations
```
