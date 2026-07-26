import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ApiError, DEFAULT_ERROR_ACTION } from "@/server/errors";

/**
 * Assinatura de um Route Handler do Next (App Router).
 * `Ctx` cobre o segundo argumento (`{ params }`) quando a rota é dinâmica.
 */
type RouteHandler<Ctx> = (
  request: Request,
  context: Ctx,
) => Promise<Response> | Response;

interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    /** Instrução acionável para o usuário (o que fazer / como obter suporte). */
    action: string;
    details?: unknown;
  };
}

/**
 * Controller que encapsula as chamadas dos Route Handlers da API.
 *
 * Centraliza o tratamento de erro (`onRouteError`) e a resposta padrão de
 * recurso inexistente (`onNotFoundError`), evitando repetir try/catch e
 * mapeamento de status em cada handler. Toda resposta de erro inclui `message`
 * e `action`, permitindo à UI direcionar o usuário a uma ação concreta.
 *
 * Uso:
 * ```ts
 * export const GET = RouteController.handle(async () => {
 *   const userId = await requireUserId();
 *   return NextResponse.json(await new TaskModel().findByUser(userId));
 * });
 * ```
 */
export class RouteController {
  /** Converte qualquer erro lançado dentro de um handler em `NextResponse` JSON. */
  static onRouteError(error: unknown): NextResponse<ApiErrorBody> {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: {
            code: "validation_error",
            message: "Falha de validação.",
            action: "Corrija os campos destacados e tente novamente.",
            details: error.issues,
          },
        },
        { status: 422 },
      );
    }

    if (error instanceof ApiError) {
      return NextResponse.json(
        {
          error: {
            code: error.code,
            message: error.message,
            action: error.action,
            ...(error.details !== undefined ? { details: error.details } : {}),
          },
        },
        { status: error.status },
      );
    }

    console.error("[RouteController] erro inesperado:", error);
    return NextResponse.json(
      {
        error: {
          code: "internal_error",
          message: "Erro interno do servidor.",
          action: DEFAULT_ERROR_ACTION,
        },
      },
      { status: 500 },
    );
  }

  /** Resposta padrão para recurso/rota inexistente. */
  static onNotFoundError(
    message = "Recurso não encontrado.",
  ): NextResponse<ApiErrorBody> {
    return NextResponse.json(
      {
        error: {
          code: "not_found",
          message,
          action: "Verifique o endereço ou volte para a página inicial.",
        },
      },
      { status: 404 },
    );
  }

  /** Envolve um handler, roteando qualquer exceção para `onRouteError`. */
  static handle<Ctx = unknown>(
    handler: RouteHandler<Ctx>,
  ): (request: Request, context: Ctx) => Promise<Response> {
    return async (request, context) => {
      try {
        return await handler(request, context);
      } catch (error) {
        return RouteController.onRouteError(error);
      }
    };
  }
}

/** Açúcar sintático: `export const GET = route(async () => { ... })`. */
export const route = RouteController.handle;
