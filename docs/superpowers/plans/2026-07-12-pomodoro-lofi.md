# Pomodoro Lo-Fi Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir um app full-stack de Pomodoro para estudo, com timer configurável, tarefas, estatísticas e player de música lo-fi (YouTube + Spotify), tema retro synthwave.

**Architecture:** Next.js 15 App Router com Route Handlers para toda I/O de dados, TanStack Query no client, Drizzle ORM sobre Postgres (Docker em dev, Neon em prod), NextAuth v5 (Google + GitHub). Lógica de negócio pura isolada em arquivos próprios e testável sem React.

**Tech Stack:** Next.js 15, TypeScript, pnpm, Tailwind + shadcn/ui, TanStack Query, NextAuth v5, Drizzle ORM, zod, Vitest.

## Global Constraints

- **Uma lógica por arquivo** — cada peça de lógica de negócio isolada em seu próprio arquivo.
- **Componente reutilizado = arquivo próprio.**
- **Função compartilhada = arquivo próprio.**
- **Cada query e cada mutation do TanStack Query em arquivo próprio.**
- **Separação client/server** — `"use client"` só onde há interação; Server Components definem `metadata`/`generateMetadata` (SEO).
- **Route Handlers (`app/api/*`) em vez de Server Actions** para toda leitura/escrita.
- Node 24, pnpm. Postgres 16. `DATABASE_URL` troca dev→prod sem mudar código.
- Validação de payload com zod em todo handler.

---

### Task 1: Scaffold do projeto

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`

**Interfaces:**
- Produces: projeto Next.js rodando em `pnpm dev`; alias `@/*` → `src/*`.

- [ ] **Step 1:** Scaffold via CLI.

```bash
cd /home/sephirotte/pomodoro
pnpm dlx create-next-app@latest . --ts --tailwind --app --src-dir --import-alias "@/*" --eslint --use-pnpm --no-turbopack --yes
```

- [ ] **Step 2:** Rodar e verificar.

Run: `pnpm dev` (abrir http://localhost:3000)
Expected: página inicial do Next carrega sem erro. Encerrar com Ctrl-C.

- [ ] **Step 3:** Commit.

```bash
git add -A && git commit -m "chore: scaffold Next.js + TS + Tailwind"
```

---

### Task 2: shadcn/ui + dependências base

**Files:**
- Create: `components.json`, `src/components/ui/*`, `src/lib/utils.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: componentes shadcn (`button`, `input`, `card`, `dialog`, `sonner`, `switch`, `slider`, `label`, `tabs`) disponíveis em `@/components/ui/*`.

- [ ] **Step 1:** Init shadcn.

```bash
pnpm dlx shadcn@latest init -d
pnpm dlx shadcn@latest add button input card dialog sonner switch slider label tabs
```

- [ ] **Step 2:** Instalar libs de dados/validação/teste.

```bash
pnpm add @tanstack/react-query drizzle-orm pg zod next-auth@beta @auth/drizzle-adapter
pnpm add -D drizzle-kit @types/pg vitest @vitejs/plugin-react
```

- [ ] **Step 3:** Commit.

```bash
git add -A && git commit -m "chore: add shadcn/ui e dependencias base"
```

---

### Task 3: Postgres em Docker + validação de env

**Files:**
- Create: `docker-compose.yml`, `.env.example`, `.env`, `src/lib/env.ts`

**Interfaces:**
- Produces: `env` (objeto validado) exportado de `@/lib/env`; Postgres em `localhost:5432`.

- [ ] **Step 1:** `docker-compose.yml`.

```yaml
services:
  db:
    image: postgres:16
    restart: unless-stopped
    environment:
      POSTGRES_USER: pomodoro
      POSTGRES_PASSWORD: pomodoro
      POSTGRES_DB: pomodoro
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
```

- [ ] **Step 2:** `.env.example` (copiar para `.env`).

```
DATABASE_URL=postgres://pomodoro:pomodoro@localhost:5432/pomodoro
AUTH_SECRET=dev-secret-change-me
AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/spotify/callback
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- [ ] **Step 3:** `src/lib/env.ts` — validação com zod.

```ts
import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  SPOTIFY_CLIENT_ID: z.string().optional(),
  SPOTIFY_CLIENT_SECRET: z.string().optional(),
  SPOTIFY_REDIRECT_URI: z.string().url().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

export const env = schema.parse(process.env);
```

- [ ] **Step 4:** Subir DB e verificar.

Run: `docker compose up -d && docker compose ps`
Expected: serviço `db` como `running`/healthy.

- [ ] **Step 5:** Commit.

```bash
git add -A && git commit -m "chore: postgres docker + validacao de env"
```

---

### Task 4: Schema Drizzle (um arquivo por tabela)

**Files:**
- Create: `src/db/schema/auth.ts`, `src/db/schema/settings.ts`, `src/db/schema/tasks.ts`, `src/db/schema/focus-sessions.ts`, `src/db/schema/music-presets.ts`, `src/db/schema/index.ts`, `src/db/client.ts`, `drizzle.config.ts`

**Interfaces:**
- Produces: `db` de `@/db/client`; tabelas `users, accounts, sessions, verificationTokens, pomodoroSettings, tasks, focusSessions, musicPresets`.

- [ ] **Step 1:** `src/db/schema/auth.ts` — tabelas do adapter NextAuth/Drizzle (copiar do padrão `@auth/drizzle-adapter` para pg: `users`, `accounts`, `sessions`, `verificationTokens`).

- [ ] **Step 2:** `src/db/schema/settings.ts`.

```ts
import { pgTable, uuid, integer, boolean, text } from "drizzle-orm/pg-core";
import { users } from "./auth";

export const pomodoroSettings = pgTable("pomodoro_settings", {
  userId: text("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  focusMinutes: integer("focus_minutes").notNull().default(25),
  shortBreakMinutes: integer("short_break_minutes").notNull().default(5),
  longBreakMinutes: integer("long_break_minutes").notNull().default(15),
  cyclesUntilLongBreak: integer("cycles_until_long_break").notNull().default(4),
  autoStartBreaks: boolean("auto_start_breaks").notNull().default(false),
  autoStartFocus: boolean("auto_start_focus").notNull().default(false),
  sound: text("sound").notNull().default("bell"),
  volume: integer("volume").notNull().default(70),
});
```

- [ ] **Step 3:** `src/db/schema/tasks.ts`, `focus-sessions.ts`, `music-presets.ts` conforme o spec (campos listados na seção "Modelo de dados"). Usar `uuid().defaultRandom()` para PKs, `timestamp({ withTimezone: true })` para datas.

- [ ] **Step 4:** `src/db/schema/index.ts` re-exporta tudo. `src/db/client.ts`:

```ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "@/lib/env";
import * as schema from "./schema";

const pool = new Pool({ connectionString: env.DATABASE_URL });
export const db = drizzle(pool, { schema });
```

- [ ] **Step 5:** `drizzle.config.ts` apontando para `src/db/schema` e `DATABASE_URL`. Adicionar scripts em package.json: `"db:generate": "drizzle-kit generate"`, `"db:migrate": "drizzle-kit migrate"`, `"db:push": "drizzle-kit push"`.

- [ ] **Step 6:** Gerar e aplicar schema.

Run: `pnpm db:push`
Expected: tabelas criadas sem erro.

- [ ] **Step 7:** Commit.

```bash
git add -A && git commit -m "feat: schema drizzle e client do banco"
```

---

### Task 5: NextAuth (Google + GitHub) + middleware

**Files:**
- Create: `src/lib/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/middleware.ts`, `src/app/login/page.tsx`, `src/features/auth/components/login-buttons.tsx`

**Interfaces:**
- Produces: `auth`, `handlers`, `signIn`, `signOut` de `@/lib/auth`; sessão disponível em Route Handlers via `auth()`.

- [ ] **Step 1:** `src/lib/auth.ts` com `DrizzleAdapter(db)`, providers Google e GitHub, `session: { strategy: "database" }`, páginas `signIn: "/login"`.

- [ ] **Step 2:** `route.ts` exporta `handlers.GET`/`handlers.POST`.

- [ ] **Step 3:** `src/middleware.ts` protege `/`, `/stats`, `/settings` (redireciona não autenticado para `/login`).

- [ ] **Step 4:** `login/page.tsx` (Server Component, com `metadata`) renderiza `login-buttons.tsx` (client) com botões Google/GitHub chamando `signIn`.

- [ ] **Step 5:** Verificar (mesmo sem credenciais reais, a página `/login` deve renderizar).

Run: `pnpm dev` → abrir `/login`
Expected: botões aparecem; clique sem credenciais mostra erro esperado do provider.

- [ ] **Step 6:** Commit.

```bash
git add -A && git commit -m "feat: autenticacao NextAuth Google+GitHub + middleware"
```

---

### Task 6: Providers (TanStack Query + Session)

**Files:**
- Create: `src/providers/query-provider.tsx`, `src/providers/session-provider.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Produces: `QueryClient` disponível em toda árvore client.

- [ ] **Step 1:** `query-provider.tsx` (`"use client"`) com `QueryClientProvider` e `QueryClient` memoizado.

- [ ] **Step 2:** `session-provider.tsx` (`"use client"`) reexporta `SessionProvider` do next-auth/react.

- [ ] **Step 3:** Envolver `children` no `layout.tsx` (Server Component) com os dois providers + `<Toaster />` do sonner. Manter `metadata` base no layout.

- [ ] **Step 4:** Verificar build.

Run: `pnpm build`
Expected: build conclui sem erro de provider.

- [ ] **Step 5:** Commit.

```bash
git add -A && git commit -m "feat: providers query e session"
```

---

### Task 7: Configurar Vitest

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `pnpm test` roda Vitest com alias `@/*`.

- [ ] **Step 1:** `vitest.config.ts` com plugin react e alias `@` → `./src`. Script `"test": "vitest run"`, `"test:watch": "vitest"`.

- [ ] **Step 2:** Verificar.

Run: `pnpm test`
Expected: "No test files found" (exit 0) — Vitest configurado.

- [ ] **Step 3:** Commit.

```bash
git add -A && git commit -m "chore: configurar vitest"
```

---

### Task 8: Lógica pura do Timer (TDD)

**Files:**
- Create: `src/features/timer/logic/timer-machine.ts`
- Test: `src/features/timer/logic/timer-machine.test.ts`

**Interfaces:**
- Produces:
  - `type Phase = "focus" | "short_break" | "long_break"`
  - `type TimerConfig = { focusMinutes: number; shortBreakMinutes: number; longBreakMinutes: number; cyclesUntilLongBreak: number }`
  - `type TimerState = { phase: Phase; completedFocusCount: number }`
  - `function initialState(): TimerState`
  - `function nextPhase(state: TimerState, config: TimerConfig): TimerState`
  - `function phaseDurationSeconds(phase: Phase, config: TimerConfig): number`

- [ ] **Step 1: Escrever o teste que falha.**

```ts
import { describe, it, expect } from "vitest";
import { initialState, nextPhase, phaseDurationSeconds } from "./timer-machine";

const cfg = { focusMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15, cyclesUntilLongBreak: 4 };

describe("timer-machine", () => {
  it("começa em focus com 0 focos completos", () => {
    expect(initialState()).toEqual({ phase: "focus", completedFocusCount: 0 });
  });

  it("focus -> short_break incrementando contador", () => {
    const s = nextPhase(initialState(), cfg);
    expect(s).toEqual({ phase: "short_break", completedFocusCount: 1 });
  });

  it("após 4 focos vai para long_break", () => {
    let s = initialState();
    for (let i = 0; i < 4; i++) s = nextPhase(s, cfg); // 4 focos -> depois de cada foco alterna
    // simular só transições de foco:
    let t = { phase: "focus", completedFocusCount: 3 } as const;
    expect(nextPhase(t, cfg).phase).toBe("long_break");
  });

  it("break volta para focus", () => {
    expect(nextPhase({ phase: "short_break", completedFocusCount: 1 }, cfg).phase).toBe("focus");
  });

  it("duração em segundos por fase", () => {
    expect(phaseDurationSeconds("focus", cfg)).toBe(1500);
    expect(phaseDurationSeconds("short_break", cfg)).toBe(300);
    expect(phaseDurationSeconds("long_break", cfg)).toBe(900);
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha.**

Run: `pnpm test src/features/timer/logic/timer-machine.test.ts`
Expected: FAIL (módulo não existe).

- [ ] **Step 3: Implementar o mínimo.**

```ts
export type Phase = "focus" | "short_break" | "long_break";
export type TimerConfig = {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  cyclesUntilLongBreak: number;
};
export type TimerState = { phase: Phase; completedFocusCount: number };

export function initialState(): TimerState {
  return { phase: "focus", completedFocusCount: 0 };
}

export function nextPhase(state: TimerState, config: TimerConfig): TimerState {
  if (state.phase === "focus") {
    const completed = state.completedFocusCount + 1;
    const isLong = completed % config.cyclesUntilLongBreak === 0;
    return { phase: isLong ? "long_break" : "short_break", completedFocusCount: completed };
  }
  return { phase: "focus", completedFocusCount: state.completedFocusCount };
}

export function phaseDurationSeconds(phase: Phase, config: TimerConfig): number {
  const map = {
    focus: config.focusMinutes,
    short_break: config.shortBreakMinutes,
    long_break: config.longBreakMinutes,
  } as const;
  return map[phase] * 60;
}
```

- [ ] **Step 4: Rodar e confirmar sucesso.**

Run: `pnpm test src/features/timer/logic/timer-machine.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit.**

```bash
git add -A && git commit -m "feat: logica pura da maquina de estados do timer"
```

---

### Task 9: Hook do relógio + componente Timer

**Files:**
- Create: `src/features/timer/logic/use-countdown.ts`, `src/features/timer/components/timer.tsx`, `src/features/timer/components/timer-controls.tsx`, `src/features/timer/logic/format-time.ts`
- Test: `src/features/timer/logic/format-time.test.ts`

**Interfaces:**
- Consumes: `timer-machine` (Task 8), `use-settings-query` (Task 12), `use-create-focus-session-mutation` (Task 13).
- Produces: `<Timer />` client component.

- [ ] **Step 1:** `format-time.ts` + teste (segundos → `mm:ss`). TDD igual à Task 8 (teste falha → implementa → passa).

- [ ] **Step 2:** `use-countdown.ts` (`"use client"`) — conta regressiva baseada em `Date.now()`/timestamp de início (resistente a background), expõe `secondsLeft`, `isRunning`, `start`, `pause`, `reset`.

- [ ] **Step 3:** `timer.tsx` compõe `timer-machine` + `use-countdown`: ao zerar, toca som, dispara `Notification`, chama mutation de focus-session (se fase era focus) e avança de fase respeitando `autoStart*`.

- [ ] **Step 4:** `timer-controls.tsx` (botões start/pause/reset/skip) isolado por ser reutilizável.

- [ ] **Step 5:** Verificar no browser (`pnpm dev`): timer conta e alterna fases.

- [ ] **Step 6:** Commit.

```bash
git add -A && git commit -m "feat: componente de timer com countdown"
```

---

### Task 10: API de Tasks (Route Handlers)

**Files:**
- Create: `src/app/api/tasks/route.ts`, `src/app/api/tasks/[id]/route.ts`, `src/features/tasks/schemas.ts`

**Interfaces:**
- Produces:
  - `GET /api/tasks` → `Task[]` do usuário.
  - `POST /api/tasks` body `{ title: string; estimatedPomodoros: number }` → `Task`.
  - `PATCH /api/tasks/:id` body parcial `{ title?, estimatedPomodoros?, completedPomodoros?, done?, position? }` → `Task`.
  - `DELETE /api/tasks/:id` → `{ ok: true }`.
  - Todos exigem sessão (`auth()`), validam com zod (`src/features/tasks/schemas.ts`), filtram por `userId`.

- [ ] **Step 1:** `schemas.ts` com `createTaskSchema` e `updateTaskSchema` (zod).

- [ ] **Step 2:** `route.ts` (GET/POST) — 401 se sem sessão, 400 se zod falhar, senão query/insert Drizzle filtrando `userId`.

- [ ] **Step 3:** `[id]/route.ts` (PATCH/DELETE) — garante que a task pertence ao `userId` antes de alterar.

- [ ] **Step 4:** Verificar com sessão fake/manual ou `curl` autenticado (documentar retorno 401 sem cookie).

Run: `curl -s http://localhost:3000/api/tasks`
Expected: `401`.

- [ ] **Step 5:** Commit.

```bash
git add -A && git commit -m "feat: route handlers de tasks"
```

---

### Task 11: Queries/mutations + UI de Tasks

**Files:**
- Create: `src/features/tasks/queries/use-tasks-query.ts`, `src/features/tasks/mutations/use-create-task-mutation.ts`, `src/features/tasks/mutations/use-update-task-mutation.ts`, `src/features/tasks/mutations/use-delete-task-mutation.ts`, `src/features/tasks/components/task-list.tsx`, `src/features/tasks/components/task-item.tsx`, `src/features/tasks/api.ts`

**Interfaces:**
- Consumes: API da Task 10.
- Produces: `<TaskList />` client component; cada hook em arquivo próprio.

- [ ] **Step 1:** `api.ts` — funções fetch (`fetchTasks`, `createTask`, `updateTask`, `deleteTask`) isoladas (função compartilhada = arquivo próprio, agrupadas por serem a camada de rede de tasks).

- [ ] **Step 2:** Um arquivo por hook: query `useTasksQuery` e cada mutation com `invalidateQueries(["tasks"])` + toast em `onError`.

- [ ] **Step 3:** `task-item.tsx` (reutilizável, isolado) e `task-list.tsx` compondo query + mutations.

- [ ] **Step 4:** Verificar no browser: criar/editar/concluir/excluir tarefa.

- [ ] **Step 5:** Commit.

```bash
git add -A && git commit -m "feat: queries, mutations e UI de tasks"
```

---

### Task 12: Settings (API + query/mutation + form)

**Files:**
- Create: `src/app/api/settings/route.ts`, `src/features/settings/schemas.ts`, `src/features/settings/api.ts`, `src/features/settings/queries/use-settings-query.ts`, `src/features/settings/mutations/use-update-settings-mutation.ts`, `src/features/settings/components/settings-form.tsx`, `src/app/settings/page.tsx`

**Interfaces:**
- Produces:
  - `GET /api/settings` → cria defaults se não existir, retorna settings.
  - `PUT /api/settings` body validado → settings atualizadas.
  - `useSettingsQuery()` → settings do usuário (consumido pelo Timer).

- [ ] **Step 1:** `schemas.ts` (zod) com ranges sensatos (ex.: minutos 1–120, volume 0–100).

- [ ] **Step 2:** `route.ts` (GET/PUT) com upsert por `userId`.

- [ ] **Step 3:** `api.ts`, hook de query e hook de mutation (arquivos separados).

- [ ] **Step 4:** `settings-form.tsx` (client) com inputs/switch/slider do shadcn.

- [ ] **Step 5:** `settings/page.tsx` — Server Component com `export const metadata` (SEO) que renderiza o form.

- [ ] **Step 6:** Verificar: alterar durações reflete no timer.

- [ ] **Step 7:** Commit.

```bash
git add -A && git commit -m "feat: settings do pomodoro"
```

---

### Task 13: Focus sessions (API + mutation)

**Files:**
- Create: `src/app/api/focus-sessions/route.ts`, `src/features/stats/schemas.ts`, `src/features/timer/api.ts`, `src/features/timer/mutations/use-create-focus-session-mutation.ts`

**Interfaces:**
- Produces:
  - `POST /api/focus-sessions` body `{ startedAt: string; endedAt: string; durationSeconds: number; taskId?: string }` → registro criado.
  - `GET /api/focus-sessions` → sessões do usuário (para stats).
  - `useCreateFocusSessionMutation()` (consumido pelo Timer, Task 9).

- [ ] **Step 1:** schema zod + handler (POST/GET) filtrando `userId`; incrementa `completedPomodoros` da task se `taskId` presente.

- [ ] **Step 2:** `api.ts` + mutation isolada.

- [ ] **Step 3:** Verificar: concluir um foco cria linha em `focus_sessions`.

Run: consultar via `docker compose exec db psql -U pomodoro -c "select count(*) from focus_sessions;"`
Expected: contagem aumenta após um ciclo de foco.

- [ ] **Step 4:** Commit.

```bash
git add -A && git commit -m "feat: registro de focus sessions"
```

---

### Task 14: Agregação de estatísticas (TDD) + API + gráfico

**Files:**
- Create: `src/features/stats/logic/aggregate-sessions.ts`, `src/app/api/stats/route.ts`, `src/features/stats/api.ts`, `src/features/stats/queries/use-stats-query.ts`, `src/features/stats/components/stats-chart.tsx`, `src/app/stats/page.tsx`
- Test: `src/features/stats/logic/aggregate-sessions.test.ts`

**Interfaces:**
- Produces:
  - `type DailyTotal = { date: string; focusSeconds: number; sessions: number }`
  - `function aggregateByDay(rows: { startedAt: string; durationSeconds: number }[]): DailyTotal[]`
  - `GET /api/stats` → `DailyTotal[]` (últimos 14 dias).

- [ ] **Step 1: Teste que falha** para `aggregateByDay` (agrupa por dia UTC, soma durações, ordena por data). Escrever casos: vazio → `[]`; duas sessões no mesmo dia somam; dias diferentes separados e ordenados.

- [ ] **Step 2:** Rodar → FAIL.

- [ ] **Step 3:** Implementar `aggregate-sessions.ts` (lógica pura).

- [ ] **Step 4:** Rodar → PASS.

- [ ] **Step 5:** `route.ts` lê `focus_sessions` do usuário e aplica `aggregateByDay`. `api.ts` + `use-stats-query.ts`. `stats-chart.tsx` (client) com gráfico (usar `recharts`: `pnpm add recharts`).

- [ ] **Step 6:** `stats/page.tsx` — Server Component com `metadata` (SEO).

- [ ] **Step 7:** Commit.

```bash
git add -A && git commit -m "feat: estatisticas de foco com agregacao testada"
```

---

### Task 15: Player YouTube

**Files:**
- Create: `src/features/music/components/youtube-player.tsx`, `src/features/music/logic/parse-youtube-id.ts`, `src/features/music/data/lofi-presets.ts`
- Test: `src/features/music/logic/parse-youtube-id.test.ts`

**Interfaces:**
- Produces: `<YoutubePlayer />` client; `parseYoutubeId(url: string): string | null`.

- [ ] **Step 1: TDD** `parse-youtube-id.ts` — extrai ID de URLs `watch?v=`, `youtu.be/`, `embed/` (teste falha → implementa → passa).

- [ ] **Step 2:** `lofi-presets.ts` — lista de presets lo-fi (label + id/URL).

- [ ] **Step 3:** `youtube-player.tsx` (client) com IFrame API, input de URL e presets.

- [ ] **Step 4:** Verificar no browser: tocar um preset.

- [ ] **Step 5:** Commit.

```bash
git add -A && git commit -m "feat: player do youtube com presets lofi"
```

---

### Task 16: Spotify OAuth + player

**Files:**
- Create: `src/app/api/spotify/login/route.ts`, `src/app/api/spotify/callback/route.ts`, `src/app/api/spotify/token/route.ts`, `src/features/music/logic/spotify-auth.ts`, `src/features/music/components/spotify-player.tsx`

**Interfaces:**
- Produces: fluxo OAuth Spotify (Authorization Code), `GET /api/spotify/token` devolve access token válido; `<SpotifyPlayer />` client (Web Playback SDK).

- [ ] **Step 1:** `spotify-auth.ts` — helpers de URL de autorização (scopes `streaming user-read-email user-read-private user-modify-playback-state`) e troca de code por token.

- [ ] **Step 2:** `login/route.ts` redireciona ao Spotify; `callback/route.ts` troca code por tokens e guarda (cookie httpOnly ou tabela). `token/route.ts` entrega/renova access token ao client.

- [ ] **Step 3:** `spotify-player.tsx` (client) inicializa Web Playback SDK; se falhar (sem Premium/device) → toast + sugerir YouTube.

- [ ] **Step 4:** Verificar (requer credenciais reais no `.env`; sem elas, documentar que o botão "Conectar" leva ao erro esperado do Spotify).

- [ ] **Step 5:** Commit.

```bash
git add -A && git commit -m "feat: integracao spotify oauth + web playback"
```

---

### Task 17: Painel de música + presets persistidos

**Files:**
- Create: `src/features/music/components/music-player.tsx`, `src/app/api/music-presets/route.ts`, `src/features/music/api.ts`, `src/features/music/queries/use-music-presets-query.ts`, `src/features/music/mutations/use-save-preset-mutation.ts`, `src/features/music/mutations/use-delete-preset-mutation.ts`

**Interfaces:**
- Produces: `<MusicPlayer />` com tabs YouTube/Spotify; CRUD de presets via API.

- [ ] **Step 1:** `music-presets/route.ts` (GET/POST/DELETE) filtrando `userId`, zod.

- [ ] **Step 2:** `api.ts` + hooks isolados (query + mutations).

- [ ] **Step 3:** `music-player.tsx` compõe `youtube-player` + `spotify-player` em `<Tabs>`.

- [ ] **Step 4:** Verificar: salvar preset e recarregar.

- [ ] **Step 5:** Commit.

```bash
git add -A && git commit -m "feat: painel de musica com presets persistidos"
```

---

### Task 18: Tema retro synthwave + shared components + página principal

**Files:**
- Create: `src/components/shared/neon-card.tsx`, `src/components/shared/grid-background.tsx`, `src/components/shared/app-nav.tsx`
- Modify: `src/app/globals.css` (paleta/variáveis synthwave), `src/app/page.tsx` (compõe Timer + TaskList + MusicPlayer), `src/app/layout.tsx` (metadata SEO base)

**Interfaces:**
- Produces: `<NeonCard />`, `<GridBackground />`, `<AppNav />` reutilizáveis; página `/` montada.

- [ ] **Step 1:** `globals.css` — variáveis de cor synthwave (fundo near-black roxo, neon magenta/ciano, amarelo), utilitários de glow.

- [ ] **Step 2:** `neon-card.tsx`, `grid-background.tsx`, `app-nav.tsx` (isolados por serem reutilizados em várias páginas).

- [ ] **Step 3:** `page.tsx` — Server Component com `metadata` própria que monta o layout principal (Timer central, TaskList lateral, MusicPlayer). `layout.tsx` com `metadata` base (title template, description, openGraph).

- [ ] **Step 4:** Verificar visual no browser em `/`, `/stats`, `/settings`.

- [ ] **Step 5:** Commit.

```bash
git add -A && git commit -m "feat: tema synthwave, componentes compartilhados e pagina principal"
```

---

### Task 19: Verificação final

**Files:** nenhum (validação).

- [ ] **Step 1:** `pnpm test` → todos os testes passam.
- [ ] **Step 2:** `pnpm build` → build de produção sem erros.
- [ ] **Step 3:** `pnpm lint` → sem erros.
- [ ] **Step 4:** Smoke manual: login → timer conclui foco → aparece em stats → tocar YouTube.
- [ ] **Step 5:** Commit final se houver ajustes.

```bash
git add -A && git commit -m "chore: verificacao final e ajustes"
```
