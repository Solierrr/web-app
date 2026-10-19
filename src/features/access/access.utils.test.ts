import { describe, expect, it } from "vitest";
import { HttpResponseError } from "@/lib/shared/http/http.service";
import { getAccessErrorMessage } from "./access.utils";

describe("access feedback", () => {
  it.each([
    [503, "HTTP_ERROR", /temporariamente indisponível/],
    [429, "HTTP_ERROR", /Muitas tentativas/],
    [400, "INVALID_OR_EXPIRED_TOKEN", /inválido, expirou ou já foi utilizado/],
    [503, "EMAIL_NOT_CONFIGURED", /envio de e-mail está indisponível/],
    [409, "EMAIL_ALREADY_REGISTERED", /e-mail já está cadastrado/],
  ])("maps HTTP %s and %s without exposing response details", (status, code, message) => {
    const error = new Error("internal payload", { cause: new HttpResponseError(status, code, "private response") });
    expect(getAccessErrorMessage(error, "Não foi possível concluir.")).toMatch(message);
  });

  it("distinguishes connection failures and blocked provider popups", () => {
    expect(getAccessErrorMessage(new Error("failed", { cause: new TypeError("Failed to fetch") }), "Falha")).toMatch(/Verifique sua conexão/);
    const error = new Error("failed", { cause: Object.assign(new Error("private"), { code: "auth/popup-blocked" }) });
    expect(getAccessErrorMessage(error, "Falha")).toMatch(/Permita a abertura da janela/);
  });

  it("uses a safe fallback for unknown errors", () => {
    expect(getAccessErrorMessage(new Error("private response"), "Não foi possível concluir.")).toBe("Não foi possível concluir.");
  });
});
