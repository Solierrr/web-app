import { describe, expect, it } from "vitest";
import { cookieLanguage, localizePath, preferredLanguage, resolveLanguage } from "./routing";

describe("language routing", () => {
  it.each([
    ["/pt-BR/painel", "solaria_language=en-US", "es", "pt-BR"],
    ["/", "solaria_language=en-US", "es", "en-US"],
    ["/", "solaria_language=invalid", "es-MX", "es-ES"],
    ["/", "", "de, fr;q=0.9", "pt-BR"],
    ["/PT-br", "", "en", "pt-BR"],
  ])("resolves %s with URL, cookie, browser priority", (path, cookie, accept, expected) => {
    expect(resolveLanguage(path, cookie, accept)).toBe(expected);
  });
  it("honors language weights and refuses invalid cookies", () => {
    expect(preferredLanguage("pt-BR;q=0, es-MX;q=0.6, en;q=0.9")).toBe("en-US");
    expect(preferredLanguage("pt;q=invalid, es;q=2, en;q=0.5")).toBe("en-US");
    expect(cookieLanguage("other=en-US; solaria_language=fr-FR")).toBeUndefined();
  });
  it.each([
    ["/login", "es-ES", "/es-ES/iniciar-sesion"],
    ["/painel/assistente", "en-US", "/en-US/dashboard/assistant"],
    ["/buscar/paneles-solares", "en-US", "/en-US/search/solar-panels"],
    ["/pt-BR/projetos/mensagens/editar", "en-US", "/en-US/projects/mensagens/edit"],
    ["/pt-BR/empresa/painel", "en-US", "/en-US/company/painel"],
    ["/pt-BR/placa-solar/empresa/configuracoes", "en-US", "/en-US/solar-panel/empresa/configuracoes"],
    ["/fr-FR/login", "pt-BR", "/pt-BR/login"],
    ["/zh-Hant-TW/login", "pt-BR", "/pt-BR/login"],
    ["/fil-PH/login", "pt-BR", "/pt-BR/login"],
    ["/pt-br/painel", "pt-BR", "/pt-BR/painel"],
    ["/unknown/painel", "en-US", "/en-US/unknown/painel"],
    ["/pt-BR/projetos/id%2Fpainel/editar", "en-US", "/en-US/projects/id%2Fpainel/edit"],
    ["/pt-BR/auth/mobile", "en-US", "/en-US/auth/mobile"],
  ] as const)("translates only literals in %s", (path, target, expected) => {
    expect(localizePath(path, target)).toBe(expected);
  });
});
