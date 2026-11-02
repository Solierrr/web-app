import { afterEach, describe, expect, it, vi } from "vitest";
import { lookupPostalCode } from "./company.postal.service";

function mockFetch(response: Partial<Response> & { json?: () => Promise<unknown> }) {
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, ...response });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => vi.unstubAllGlobals());

describe("lookupPostalCode", () => {
  it("converte a resposta do ViaCEP em endereço", async () => {
    const fetchMock = mockFetch({
      json: async () => ({ uf: "SP", localidade: "São Paulo", bairro: "Sé", logradouro: "Praça da Sé" }),
    });

    const result = await lookupPostalCode("01001000");

    expect(result).toEqual({ found: true, address: { state: "SP", city: "São Paulo", neighborhood: "Sé", street: "Praça da Sé" } });
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/01001000/json/"), { signal: undefined });
  });

  it("informa quando o CEP não existe", async () => {
    mockFetch({ json: async () => ({ erro: true }) });

    await expect(lookupPostalCode("00000000")).resolves.toEqual({ found: false });
  });

  it("falha com erro tipado quando a resposta não é ok", async () => {
    mockFetch({ ok: false, status: 500 });

    await expect(lookupPostalCode("01001000")).rejects.toThrow("Postal lookup failed");
  });
});
