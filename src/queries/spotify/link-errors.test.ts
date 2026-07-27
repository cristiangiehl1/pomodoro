import { spotifyLinkErrorMessage } from "./link-errors";

describe("spotifyLinkErrorMessage", () => {
  it("retorna null quando não há código de erro", () => {
    expect(spotifyLinkErrorMessage(null)).toBeNull();
    expect(spotifyLinkErrorMessage(undefined)).toBeNull();
    expect(spotifyLinkErrorMessage("")).toBeNull();
  });

  it("explica quando o Spotify já está vinculado a outro usuário", () => {
    const msg = spotifyLinkErrorMessage(
      "account_already_linked_to_different_user",
    );
    expect(msg).toMatch(/já está vinculada a outro usuário/i);
  });

  it("mapeia códigos conhecidos para mensagens específicas", () => {
    expect(spotifyLinkErrorMessage("state_mismatch")).toMatch(/expirou/i);
    expect(spotifyLinkErrorMessage("email_doesn't_match")).toMatch(
      /não confere/i,
    );
  });

  it("usa uma mensagem genérica para códigos desconhecidos", () => {
    expect(spotifyLinkErrorMessage("algo_inesperado")).toBe(
      "Não foi possível conectar ao Spotify. Tente novamente.",
    );
  });
});
