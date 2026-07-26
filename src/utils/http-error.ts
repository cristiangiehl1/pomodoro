/**
 * Erro de requisição HTTP no client.
 *
 * Espelha o contrato de erro da API (`{ error: { code, message, action, details } }`),
 * carregando a `action` acionável para que a UI possa direcionar o usuário.
 * É lançado pelo cliente HTTP configurado em `@/lib/ky`.
 */
export class HttpError extends Error {
  readonly status: number;
  readonly code: string;
  readonly action: string;
  readonly details?: unknown;

  constructor(
    message: string,
    options: { status: number; code: string; action: string; details?: unknown },
  ) {
    super(message);
    this.name = "HttpError";
    this.status = options.status;
    this.code = options.code;
    this.action = options.action;
    this.details = options.details;
  }
}
