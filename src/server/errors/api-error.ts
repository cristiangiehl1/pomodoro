/**
 * Erros de API da aplicação.
 *
 * Todos estendem a classe nativa `Error` do JavaScript e carregam:
 *  - `status`  — código HTTP correspondente;
 *  - `code`    — identificador estável (consumível pelo client);
 *  - `message` — descrição legível do que aconteceu;
 *  - `action`  — instrução acionável para o usuário (o que fazer / como obter
 *                suporte), permitindo direcioná-lo a uma ação concreta na UI.
 *
 * O {@link import("@/server/controller/route-controller").RouteController}
 * mapeia essas instâncias para respostas JSON estruturadas.
 */

interface ApiErrorOptions {
  status?: number;
  code?: string;
  /** Instrução acionável para o usuário. */
  action?: string;
  details?: unknown;
  cause?: unknown;
}

/** Ação padrão quando o erro não sugere nada mais específico. */
export const DEFAULT_ERROR_ACTION =
  "Tente novamente em instantes. Se o problema persistir, contate o suporte.";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly action: string;
  readonly details?: unknown;

  constructor(message: string, options: ApiErrorOptions = {}) {
    super(message, { cause: options.cause });
    this.name = new.target.name;
    this.status = options.status ?? 500;
    this.code = options.code ?? "internal_error";
    this.action = options.action ?? DEFAULT_ERROR_ACTION;
    this.details = options.details;

    // Mantém o stack trace apontando para o call site (V8).
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, new.target);
    }
  }

  /** Serialização estável enviada ao client. */
  toJSON() {
    return {
      code: this.code,
      message: this.message,
      action: this.action,
      ...(this.details !== undefined ? { details: this.details } : {}),
    };
  }
}

export class BadRequestError extends ApiError {
  constructor(message = "Requisição inválida.", details?: unknown) {
    super(message, {
      status: 400,
      code: "bad_request",
      action: "Revise os dados enviados e tente novamente.",
      details,
    });
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "Você precisa estar autenticado.") {
    super(message, {
      status: 401,
      code: "unauthorized",
      action: "Faça login para continuar.",
    });
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = "Você não tem acesso a este recurso.") {
    super(message, {
      status: 403,
      code: "forbidden",
      action:
        "Se você acredita que isso é um engano, contate o administrador da conta.",
    });
  }
}

export class NotFoundError extends ApiError {
  constructor(message = "Recurso não encontrado.", details?: unknown) {
    super(message, {
      status: 404,
      code: "not_found",
      action: "Verifique o endereço ou volte para a página inicial.",
      details,
    });
  }
}

export class ValidationError extends ApiError {
  constructor(message = "Falha de validação.", details?: unknown) {
    super(message, {
      status: 422,
      code: "validation_error",
      action: "Corrija os campos destacados e tente novamente.",
      details,
    });
  }
}
