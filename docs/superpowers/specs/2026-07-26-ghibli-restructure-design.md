# Redesign Ghibli lo-fi + Reestruturação — Design / Spec

Data: 2026-07-26

## Objetivo

Redesenhar a identidade visual do app para uma ambientação **lo-fi com temática
Studio Ghibli** (paleta pintada e quente, cena com céu/colinas/nuvens/pólen,
sombras macias, tipografia de "livro ilustrado") e **reestruturar o projeto** em
camadas claras, com uma camada de servidor formal (models como repositórios,
controller para route handlers e classes de erro de API).

Substitui o tema **retro synthwave** anterior (ver
`2026-07-12-pomodoro-lofi-design.md`).

## Decisões (aprovadas)

- **Tema Ghibli lo-fi no app inteiro** (não só nas rotas de auth).
- **Reestruturação total** da árvore `src/` (migração completa, não incremental).
- **Model = repositório instanciável** (`new TaskModel(db)`), com injeção opcional
  de `db` para testes/transações.
- **Formulários com `<form>` HTML nativo + react-hook-form** (`useForm`/`register`/
  `Controller`), **sem** o wrapper `Form`/`FormField` do shadcn.
- **`ky`** como cliente HTTP no client (em vez de `fetch` cru).
- **Jest** como runner de testes (em vez de Vitest/Vite).
- Erros da API estendem `Error` e carregam **`message` + `action`** (instrução
  acionável ao usuário).

## Estrutura de pastas

```
src/
  app/
    (auth)/                     # rotas de autenticação (layout Ghibli compartilhado)
      layout.tsx
      login/page.tsx
      register/page.tsx
    (protected)/                # rotas protegidas (AtmosphereScene + AppNav)
      layout.tsx
      page.tsx                  # "/" (timer)
      stats/page.tsx
      settings/page.tsx
    providers/
      query-provider.tsx
    api/                        # route handlers (finos, via controller)
    layout.tsx                  # root: fontes + metadata base
    globals.css                 # tokens Ghibli + animações de cena
  hooks/                        # hooks de client (use-countdown)
  queries/                      # TanStack Query — queries, mutations e fetchers (api.ts) por entidade
    tasks/  settings/  stats/  focus-sessions/  music-presets/
  lib/                          # configs de pacotes
    auth.ts  auth-client.ts  get-session.ts  env.ts  utils.ts
    ky.ts                       # cliente HTTP (ky) → mapeia erro p/ HttpError
    validations/                # schemas zod (client + server): task, settings, focus-session, music-preset, auth
  utils/                        # funções puras/globais + testes (timer-machine, format-time, aggregate-sessions, parse-youtube-id, play-beep, http-error, show-error-toast)
  server/                       # somente servidor
    db/                         # client.ts + schema/ (drizzle)
    errors/                     # ApiError + subclasses (status, code, action)
    controller/                 # RouteController (onRouteError/onNotFoundError) + readJson
    auth/                       # requireUserId
    model/                      # repositórios instanciáveis por entidade (BaseModel + *.model.ts)
    service/                    # serviços externos (spotify/)
  components/
    ui/                         # shadcn (base-nova)
    shared/                     # AtmosphereScene, SoftCard, AppNav, TextField, OrDivider
    auth/  timer/  tasks/  settings/  stats/  music/  home/
```

Observações:
- **"Demais rotas"**: hoje só existem rotas de auth (públicas) e o app (protegido).
  Não há grupo público adicional — não foi criado grupo vazio.
- Login e cadastro são **rotas separadas** (`/login`, `/register`) sob o mesmo
  layout Ghibli.

## Camada de servidor

### Erros (`src/server/errors`)
- `ApiError extends Error` com `status`, `code`, **`action`** e `details`.
- Subclasses: `BadRequestError` (400), `UnauthorizedError` (401),
  `ForbiddenError` (403), `NotFoundError` (404), `ValidationError` (422).
- Cada erro traz uma `action` padrão (ex.: 401 → "Faça login para continuar.").

### Controller (`src/server/controller/route-controller.ts`)
- `RouteController.handle(handler)` (alias `route`) envolve o handler em try/catch.
- `onRouteError(error)` mapeia `ZodError` → 422, `ApiError` → status próprio,
  demais → 500; sempre com `{ error: { code, message, action, details? } }`.
- `onNotFoundError(message)` → 404 padrão.
- `readJson(request)` lê o corpo JSON, lançando `BadRequestError` se inválido.

### Models (`src/server/model`)
- `BaseModel` recebe `db` (default: conexão compartilhada) — instanciável e
  injetável. Cada entidade tem seu repositório com CRUD escopado ao `userId`:
  `TaskModel`, `SettingsModel`, `FocusSessionModel`, `MusicPresetModel`.
- `FocusSessionModel.create` roda em transação (insere sessão + incrementa
  `completedPomodoros` da tarefa).

### Route handlers (padrão)
```ts
export const GET = route(async () => {
  const userId = await requireUserId();          // 401 se sem sessão
  return NextResponse.json(await new TaskModel().findByUser(userId));
});
```

## Client

- **`lib/ky.ts`**: instância ky com `prefix: "/api"`. Um `mapError` converte o
  `HTTPError` do ky no `HttpError` da app, lendo `message`/`action` do corpo.
  Fachada `api.get/post/put/patch/delete` (JSON tipado). `httpClient` bruto para
  casos que inspecionam o status sem lançar (ex.: polling do token Spotify).
- **`utils/http-error.ts`**: `HttpError` (espelha o contrato da API, com `action`).
- **`utils/show-error-toast.ts`**: exibe `message` como título e `action` como
  descrição no toast — direcionando o usuário. Usado nos `onError` das mutations.
- **Formulários** (auth login/register, settings) usam `<form>` + react-hook-form
  + `zodResolver` sobre os schemas de `lib/validations`. `Controller` para
  componentes controlados (Switch, Slider). Campo reutilizável: `TextField`.

## Identidade visual (Ghibli lo-fi)

- Paleta quente em `globals.css`: azul-céu, verde-prado, âmbar de hora dourada,
  creme/pergaminho, tinta quente. Tokens shadcn remapeados; variante
  `.dark` = crepúsculo (cozy dusk).
- Fonte display **Fraunces** (serifa macia, storybook) para títulos (`font-display`);
  Geist no corpo; Geist Mono/Fraunces no timer.
- `AtmosphereScene` (substitui `GridBackground`): céu em gradiente, brilho de sol,
  nuvens à deriva, colinas em silhueta, partículas de pólen flutuando e grão —
  tudo em CSS/SVG, sem imagens externas.
- `SoftCard` (substitui `NeonCard`): pergaminho fosco, cantos arredondados,
  sombra macia, com prop `tone` (sky/meadow/amber/clay).

## Autenticação

- Better Auth (email/senha + Google + GitHub) — inalterado no núcleo.
- **GitHub**: já habilitado; requer `GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET` de
  um OAuth App (callback `/api/auth/callback/github`). Fingerprint SSH **não** é
  credencial de OAuth.
- Middleware (`src/proxy.ts`, convenção Next 16) protege `/`, `/stats`, `/settings`.

## Testes

- **Jest** (`jest.config.mjs` via `next/jest`), ambiente `node`, alias `@/`.
- Cobrem a lógica pura em `src/utils`: `timer-machine`, `format-time`,
  `aggregate-sessions`, `parse-youtube-id` (40 testes).

## Fora de escopo (YAGNI)

- Troca de tema dia/crepúsculo em runtime (a variante `.dark` existe, mas não há
  toggle).
- Refatorar a chamada externa de OAuth do Spotify (`server/service/spotify`) para
  o cliente ky — permanece com `fetch` por ser integração externa.
- O callback do Spotify permanece como fluxo de redirect (não JSON).
