# Pomodoro Lo-Fi — Design / Spec

Data: 2026-07-12

> **Nota (2026-07-26):** o tema **retro synthwave** e a estrutura por `features/`
> descritos abaixo foram substituídos pelo redesign **Ghibli lo-fi** e pela
> reestruturação em camadas. Ver
> `docs/superpowers/specs/2026-07-26-ghibli-restructure-design.md`.

## Objetivo

App full-stack de estudo usando o método Pomodoro, com timer configurável,
lista de tarefas, estatísticas de foco e um player de música lo-fi integrado
(YouTube por padrão + Spotify opcional). Tema visual **retro synthwave**.

## Stack

- **Next.js 15** (App Router) + **TypeScript**, gerenciado com **pnpm**
- **UI:** shadcn/ui + Tailwind CSS, tema retro synthwave (neon roxo/ciano, grid retrô, glow)
- **Estado de servidor no client:** TanStack Query
- **Auth:** NextAuth (Auth.js v5) com provedores **Google + GitHub**
- **Banco:** PostgreSQL via **Docker Compose** em dev → **Neon** em produção
  (troca apenas de `DATABASE_URL`)
- **ORM:** Drizzle ORM + drizzle-kit para migrations
- **Música:** YouTube IFrame Player API (default) + Spotify OAuth / Web Playback SDK (opcional, exige Premium)
- **HTTP interno:** preferir **Route Handlers** (`app/api/*`) em vez de Server Actions

## Princípios de organização de código (obrigatórios)

Estes princípios são requisitos do projeto e valem para TODO o código:

1. **Uma lógica por arquivo.** Cada peça de lógica de negócio da aplicação
   deve viver isolada em seu próprio arquivo (ex.: máquina de estados do timer,
   cálculo de estatísticas, helpers de auth).
2. **Componente reutilizado = arquivo próprio.** Se um componente for usado em
   mais de um lugar, ele deve estar isolado em seu próprio arquivo.
3. **Função compartilhada = arquivo próprio.** Se uma função precisa ser chamada
   em vários componentes, ela deve estar isolada em seu próprio arquivo.
4. **Queries/mutations do TanStack Query isoladas.** Cada query e cada mutation
   fica em seu próprio arquivo (ex.: `features/tasks/queries/use-tasks-query.ts`,
   `features/tasks/mutations/use-create-task-mutation.ts`).
5. **Separação client/server.** Componentes client (`"use client"`) e server
   ficam separados. Server Components carregam os **metadados de SEO** (`metadata`
   / `generateMetadata`) das rotas.
6. **Route Handlers > Server Actions.** Toda mutação/leitura de dados passa por
   Route Handlers em `app/api/*`, consumidos via TanStack Query.

## Estrutura de pastas (proposta)

```
pomodoro/
  docker-compose.yml            # postgres local para dev
  drizzle.config.ts
  .env.example
  src/
    app/
      layout.tsx                # root layout (server) + metadata base
      page.tsx                  # "/" app principal (server shell) + metadata
      login/page.tsx
      stats/page.tsx            # metadata própria
      settings/page.tsx
      api/
        auth/[...nextauth]/route.ts
        tasks/route.ts          # GET/POST
        tasks/[id]/route.ts     # PATCH/DELETE
        settings/route.ts       # GET/PUT
        focus-sessions/route.ts # GET/POST
        stats/route.ts          # GET
        spotify/login/route.ts
        spotify/callback/route.ts
        spotify/token/route.ts  # refresh/entrega access token ao client
    db/
      client.ts                 # instância drizzle
      schema/                   # um arquivo por tabela
        users.ts
        settings.ts
        tasks.ts
        focus-sessions.ts
        music-presets.ts
        index.ts
    lib/
      auth.ts                   # config NextAuth
      env.ts                    # validação de env (zod)
    features/
      timer/
        logic/timer-machine.ts  # lógica pura da máquina de estados (testável)
        components/timer.tsx     # client component
        components/timer-controls.tsx
      tasks/
        queries/use-tasks-query.ts
        mutations/use-create-task-mutation.ts
        mutations/use-update-task-mutation.ts
        mutations/use-delete-task-mutation.ts
        components/task-list.tsx
        components/task-item.tsx
      settings/
        queries/use-settings-query.ts
        mutations/use-update-settings-mutation.ts
        components/settings-form.tsx
      stats/
        queries/use-stats-query.ts
        logic/aggregate-sessions.ts
        components/stats-chart.tsx
      music/
        components/music-player.tsx
        components/youtube-player.tsx
        components/spotify-player.tsx
        logic/spotify-auth.ts
        queries/use-music-presets-query.ts
        mutations/use-save-preset-mutation.ts
    components/
      ui/                       # shadcn
      shared/                   # componentes reutilizados (ex.: NeonCard, GridBackground)
    providers/
      query-provider.tsx        # client
      session-provider.tsx      # client
```

## Modelo de dados

Cada tabela em seu próprio arquivo em `src/db/schema/`.

- **users / accounts / sessions / verification_tokens** — adapter do NextAuth (Drizzle).
- **pomodoro_settings** (1:1 com user):
  `user_id`, `focus_minutes` (default 25), `short_break_minutes` (5),
  `long_break_minutes` (15), `cycles_until_long_break` (4),
  `auto_start_breaks` (bool), `auto_start_focus` (bool),
  `sound` (text), `volume` (int 0–100).
- **tasks:** `id`, `user_id`, `title`, `estimated_pomodoros`,
  `completed_pomodoros`, `done` (bool), `position` (int p/ ordenação),
  `created_at`.
- **focus_sessions:** `id`, `user_id`, `task_id` (nullable),
  `started_at`, `ended_at`, `duration_seconds`. Fonte das estatísticas.
- **music_presets:** `id`, `user_id`, `kind` (`youtube` | `spotify`),
  `ref` (url/uri), `label`, `created_at`.

## Componentes e fluxo

### Timer
- Lógica pura em `timer-machine.ts`: estados `focus` → `short_break` /
  `long_break`, contador de ciclos, transições. Sem dependência de React → testável.
- Componente client usa `requestAnimationFrame`/timestamps (não `setInterval`
  ingênuo) para resistir a throttling de aba em background.
- Ao concluir um bloco de foco: toca som escolhido + dispara Notification API +
  `POST /api/focus-sessions` (via mutation) e incrementa `completed_pomodoros`
  da tarefa ativa.
- Respeita `auto_start_*` das settings.

### Tarefas
- CRUD via TanStack Query contra `/api/tasks`. Reordenação por `position`.
- Uma tarefa pode ser marcada como "ativa" — vincula ao próximo focus_session.

### Música
- `MusicPlayer` com toggle YouTube / Spotify.
- **YouTube:** input de URL/ID + presets lo-fi pré-definidos; YouTube IFrame API.
- **Spotify:** botão "Conectar" → OAuth (`/api/spotify/login` → callback).
  Web Playback SDK toca no browser (exige Premium). Se falhar (sem Premium /
  sem device), toast informa e sugere YouTube. Access token entregue/renovado
  via `/api/spotify/token`.
- Presets salvos em `music_presets`.

### Estatísticas
- `/api/stats` agrega `focus_sessions` (por dia/semana). Agregação em
  `aggregate-sessions.ts` (lógica pura, testável). Gráfico em `stats-chart.tsx`.

### Settings
- Form persiste em `pomodoro_settings` via `PUT /api/settings`.

## Rotas

- `/` — app principal (timer + tasks + player). Protegida (redireciona p/ login).
- `/stats`, `/settings` — protegidas, com metadata de SEO própria.
- `/login` — providers Google + GitHub.
- `app/api/*` — conforme estrutura acima.

Todas as páginas são Server Components que definem `metadata`/`generateMetadata`
e renderizam os Client Components de interação.

## Autenticação

- NextAuth v5 com Google + GitHub, adapter Drizzle (persistência no Postgres).
- Middleware protege `/`, `/stats`, `/settings`.
- Rotas de API validam sessão.

## Configuração de ambiente

`.env.example` com placeholders:

```
DATABASE_URL=postgres://pomodoro:pomodoro@localhost:5432/pomodoro   # docker em dev; Neon em prod
AUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/spotify/callback
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

`docker-compose.yml` sobe Postgres 16 local com essas credenciais.

## Tratamento de erros

- Música: ausência de device/Premium → toast + fallback YouTube.
- Route Handlers retornam JSON de erro estruturado; client trata via TanStack Query
  (`onError` + toast).
- Validação de payloads com zod nos handlers.

## Testes

- **Unitários (prioridade):** `timer-machine.ts` (transições, ciclos) e
  `aggregate-sessions.ts`.
- **Smoke:** rotas de API principais (tasks, settings, focus-sessions).
- Sem over-engineering — foco na lógica crítica.

## Fora de escopo (YAGNI)

- Compartilhamento social / salas colaborativas.
- App mobile nativo.
- Múltiplos idiomas (i18n).
- Pagamentos.

## Tema visual (retro synthwave)

- Paleta: fundo escuro (near-black roxo), neon magenta/ciano, detalhes em amarelo.
- Elementos: grid em perspectiva no fundo, glow em bordas/botões, tipografia
  display para o timer, cards com borda neon (`NeonCard` reutilizável).
- Componentes visuais reutilizados isolados em `components/shared/`.
