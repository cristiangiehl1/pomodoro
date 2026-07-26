import { toast } from "sonner";
import { HttpError } from "@/utils/http-error";

/**
 * Exibe um toast de erro com a mensagem e, quando disponível, a `action`
 * acionável como descrição — direcionando o usuário ao próximo passo.
 */
export function showErrorToast(error: unknown, fallbackMessage: string): void {
  if (error instanceof HttpError) {
    toast.error(error.message || fallbackMessage, { description: error.action });
    return;
  }
  if (error instanceof Error && error.message) {
    toast.error(error.message);
    return;
  }
  toast.error(fallbackMessage);
}
