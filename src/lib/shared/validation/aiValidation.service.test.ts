import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "@/config/i18n/internationalization";
import { HttpResponseError, httpJson } from "@/lib/shared/http/http.service";
import { refresh } from "@/features/access/access.service";
import { validateCertificates, validateCnpjCategory } from "./aiValidation.service";

vi.mock("@/lib/shared/http/http.service", async (importOriginal) => ({ ...(await importOriginal<object>()), httpJson: vi.fn() }));
vi.mock("@/features/access/access.service", () => ({ refresh: vi.fn() }));

function failure(status: number): Error {
  return new Error(`HTTP ${status}`, { cause: new HttpResponseError(status, "HTTP_ERROR") });
}

describe("aiValidation.service", () => {
  beforeEach(() => {
    vi.mocked(httpJson).mockReset();
    vi.mocked(refresh).mockReset();
  });
  afterEach(async () => {
    vi.unstubAllEnvs();
    await i18n.changeLanguage("pt-BR");
  });

  it("sends the cnpj with the current access token and a long timeout", async () => {
    vi.mocked(httpJson).mockResolvedValue({ status: "VALID" });

    await validateCnpjCategory("12345678000190");

    const options = vi.mocked(httpJson).mock.calls[0][1];
    expect(vi.mocked(httpJson).mock.calls[0][0]).toContain("/companies/validate-cnpj");
    expect(options).toMatchObject({ method: "POST", body: { cnpj: "12345678000190" }, timeoutMs: 120_000 });
    expect(options.authenticated).not.toBe(false);
  });

  it("sends both certificate urls with the current access token", async () => {
    vi.mocked(httpJson).mockResolvedValue({ status: "ACCEPT" });

    await validateCertificates("https://example.com/nr10.jpg", "https://example.com/nr35.jpg");

    const options = vi.mocked(httpJson).mock.calls[0][1];
    expect(vi.mocked(httpJson).mock.calls[0][0]).toContain("/certificates/validate");
    expect(options).toMatchObject({ body: { cert_nr10_url: "https://example.com/nr10.jpg", cert_nr35_url: "https://example.com/nr35.jpg" } });
    expect(options.authenticated).not.toBe(false);
  });

  it("renews the session once after a 401 and repeats the call", async () => {
    vi.mocked(httpJson).mockRejectedValueOnce(failure(401)).mockResolvedValueOnce({ status: "VALID" });
    vi.mocked(refresh).mockResolvedValue({} as never);

    await expect(validateCnpjCategory("12345678000190")).resolves.toEqual({ status: "VALID" });
    expect(refresh).toHaveBeenCalledOnce();
    expect(httpJson).toHaveBeenCalledTimes(2);
  });

  it("explains an expired session when the renewal fails", async () => {
    vi.mocked(httpJson).mockRejectedValue(failure(401));
    vi.mocked(refresh).mockResolvedValue(null);

    await expect(validateCnpjCategory("12345678000190")).rejects.toThrow("Sua sessão expirou");
    expect(httpJson).toHaveBeenCalledOnce();
  });

  it.each([
    [403, "pt-BR", "não tem permissão"],
    [429, "pt-BR", "Muitas solicitações"],
    [503, "pt-BR", "indisponível"],
    [429, "en-US", "Too many requests"],
    [403, "es-ES", "no tiene permiso"],
  ])("maps HTTP %i to a clear message in %s", async (status, language, text) => {
    await i18n.changeLanguage(language);
    vi.mocked(httpJson).mockRejectedValue(failure(status));

    await expect(validateCertificates("a", "b")).rejects.toThrow(text);
  });

  it("keeps the operation message for failures without a specific explanation", async () => {
    vi.mocked(httpJson).mockRejectedValue(new Error("boom"));

    await expect(validateCertificates("a", "b")).rejects.toThrow("Não foi possível validar os certificados");
  });

  it("answers locally in mock mode without calling the service", async () => {
    vi.stubEnv("DEV", true);
    vi.stubEnv("VITE_AI_MOCKS", "ALWAYS");
    vi.stubEnv("VITE_MOCKS_DELAY_SECONDS", "0");

    await expect(validateCnpjCategory("12345678000190")).resolves.toMatchObject({ status: "VALID" });
    await expect(validateCertificates("a", "b")).resolves.toMatchObject({ status: "ACCEPT" });
    expect(httpJson).not.toHaveBeenCalled();
  });
});
