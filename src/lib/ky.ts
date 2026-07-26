import ky, { HTTPError, type Options } from "ky";
import { HttpError } from "@/utils/http-error";

const FALLBACK_ACTION =
  "Tente novamente em instantes. Se o problema persistir, contate o suporte.";

/** Cliente ky base — todas as rotas internas ficam sob `/api`. */
const client = ky.create({
  prefix: "/api",
  retry: 0,
});

/**
 * Converte um erro do ky (`HTTPError`) no {@link HttpError} da aplicação,
 * lendo o corpo de erro padrão da API (`{ error: { message, action, ... } }`)
 * para preservar a `action` acionável exibida ao usuário.
 */
async function mapError(error: unknown): Promise<never> {
  if (error instanceof HTTPError) {
    const { response } = error;
    let message = `Erro ${response.status}.`;
    let action = FALLBACK_ACTION;
    let code = "http_error";
    let details: unknown;

    try {
      const body = (await response.json()) as {
        error?: {
          code?: string;
          message?: string;
          action?: string;
          details?: unknown;
        };
      };
      if (body?.error) {
        message = body.error.message ?? message;
        action = body.error.action ?? action;
        code = body.error.code ?? code;
        details = body.error.details;
      }
    } catch {
      // corpo não-JSON — mantém os defaults
    }

    throw new HttpError(message, {
      status: response.status,
      code,
      action,
      details,
    });
  }
  throw error;
}

/**
 * Fachada tipada sobre o ky. Retorna o JSON já parseado e normaliza erros
 * para {@link HttpError}. Os caminhos são relativos ao prefixo `/api`.
 */
export const api = {
  get<T>(url: string, options?: Options): Promise<T> {
    return client.get(url, options).json<T>().catch(mapError);
  },
  post<T>(url: string, options?: Options): Promise<T> {
    return client.post(url, options).json<T>().catch(mapError);
  },
  put<T>(url: string, options?: Options): Promise<T> {
    return client.put(url, options).json<T>().catch(mapError);
  },
  patch<T>(url: string, options?: Options): Promise<T> {
    return client.patch(url, options).json<T>().catch(mapError);
  },
  async delete(url: string, options?: Options): Promise<void> {
    await client.delete(url, options).catch(mapError);
  },
};

/** Cliente ky bruto (Response), para casos que inspecionam o status sem lançar. */
export const httpClient = client;
