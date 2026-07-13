import { describe, it, expect } from "vitest";
import { parseYoutubeId } from "./parse-youtube-id";

describe("parseYoutubeId", () => {
  // Standard watch URL
  it("extrai id de URL watch?v=", () => {
    expect(parseYoutubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      "dQw4w9WgXcQ"
    );
  });

  it("extrai id de URL watch?v= com parâmetros extras", () => {
    expect(
      parseYoutubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s")
    ).toBe("dQw4w9WgXcQ");
  });

  it("extrai id de URL watch?v= com parâmetro antes do v", () => {
    expect(
      parseYoutubeId(
        "https://www.youtube.com/watch?list=PLtest&v=dQw4w9WgXcQ&t=30s"
      )
    ).toBe("dQw4w9WgXcQ");
  });

  // Short URL youtu.be
  it("extrai id de URL youtu.be/", () => {
    expect(parseYoutubeId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("extrai id de URL youtu.be/ com query string", () => {
    expect(parseYoutubeId("https://youtu.be/dQw4w9WgXcQ?t=30s")).toBe(
      "dQw4w9WgXcQ"
    );
  });

  // Embed URL
  it("extrai id de URL embed/", () => {
    expect(
      parseYoutubeId("https://www.youtube.com/embed/dQw4w9WgXcQ")
    ).toBe("dQw4w9WgXcQ");
  });

  it("extrai id de URL embed/ com parâmetros", () => {
    expect(
      parseYoutubeId("https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1")
    ).toBe("dQw4w9WgXcQ");
  });

  // Bare 11-char id
  it("retorna id diretamente quando input é um id de 11 caracteres válido", () => {
    expect(parseYoutubeId("dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("retorna id com underscores e hífens (caracteres válidos)", () => {
    expect(parseYoutubeId("abc_DEF-123")).toBe("abc_DEF-123");
  });

  // Null cases
  it("retorna null para string vazia", () => {
    expect(parseYoutubeId("")).toBeNull();
  });

  it("retorna null para texto aleatório", () => {
    expect(parseYoutubeId("not a youtube url at all")).toBeNull();
  });

  it("retorna null para URL não-YouTube", () => {
    expect(parseYoutubeId("https://vimeo.com/123456789")).toBeNull();
  });

  it("retorna null para URL com domínio similar mas não YouTube", () => {
    expect(parseYoutubeId("https://notyoutube.com/watch?v=dQw4w9WgXcQ")).toBeNull();
  });

  it("retorna null para id com menos de 11 caracteres", () => {
    expect(parseYoutubeId("dQw4w9WgX")).toBeNull();
  });

  it("retorna null para id com mais de 11 caracteres", () => {
    expect(parseYoutubeId("dQw4w9WgXcQXXX")).toBeNull();
  });

  it("retorna null para URL do YouTube sem parâmetro v", () => {
    expect(parseYoutubeId("https://www.youtube.com/channel/UCxxxxxx")).toBeNull();
  });
});
