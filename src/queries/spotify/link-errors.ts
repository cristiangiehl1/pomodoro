/**
 * Traduz os códigos de erro que o better-auth devolve na query string
 * (`?error=<código>`) ao voltar do fluxo `oauth2.link` do Spotify. Os códigos
 * vêm de `better-auth/plugins/generic-oauth/routes` e `oauth2/state`.
 */
const SPOTIFY_LINK_ERROR_MESSAGES: Record<string, string> = {
  account_already_linked_to_different_user:
    "Esta conta do Spotify já está vinculada a outro usuário. Entre com aquela conta ou desvincule o Spotify dela antes de conectar aqui.",
  "email_doesn't_match":
    "O e-mail da conta do Spotify não confere com o da sua conta.",
  state_mismatch:
    "A sessão de conexão expirou ou foi bloqueada pelo navegador. Tente conectar novamente.",
  state_security_mismatch:
    "A sessão de conexão expirou ou foi bloqueada pelo navegador. Tente conectar novamente.",
  state_not_found:
    "A sessão de conexão expirou. Tente conectar novamente.",
  oauth_code_verification_failed:
    "Não foi possível validar a resposta do Spotify. Tente conectar novamente.",
  unable_to_link_account:
    "Não foi possível vincular a conta do Spotify. Tente novamente.",
  user_info_is_missing:
    "O Spotify não retornou os dados da conta. Tente conectar novamente.",
  email_is_missing:
    "O Spotify não compartilhou um e-mail. Verifique as permissões da sua conta.",
  oAuth_code_missing:
    "A autorização no Spotify foi cancelada ou não foi concluída.",
  access_denied:
    "Você recusou a autorização no Spotify.",
};

const FALLBACK_MESSAGE =
  "Não foi possível conectar ao Spotify. Tente novamente.";

/**
 * Mensagem amigável para um código de erro de vínculo do Spotify. Retorna
 * `null` quando `code` é vazio/ausente (nenhum erro a exibir).
 */
export function spotifyLinkErrorMessage(
  code: string | null | undefined,
): string | null {
  if (!code) return null;
  return SPOTIFY_LINK_ERROR_MESSAGES[code] ?? FALLBACK_MESSAGE;
}
