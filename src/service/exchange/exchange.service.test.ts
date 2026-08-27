import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import CurrencyCode from "@/domain/enum/currency";

import { convertCurrency, getExchangeRate } from "./exchange.service";

describe("exchange.service", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  describe("getExchangeRate", () => {
    it("returns 1 without calling the API when converting a currency to itself", async () => {
      const result = await getExchangeRate(CurrencyCode.BRL, CurrencyCode.BRL);

      expect(fetchMock).not.toHaveBeenCalled();
      expect(result).toBe(1);
    });

    it("returns the rate from the API when the request succeeds", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ date: "2026-08-26", base: "BRL", quote: "USD", rate: 5.5 }),
      });

      const result = await getExchangeRate(CurrencyCode.BRL, CurrencyCode.USD);

      expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/rate/BRL/USD"));
      expect(result).toBe(5.5);
    });

    it("throws when the API request fails", async () => {
      fetchMock.mockResolvedValue({ ok: false });

      await expect(getExchangeRate(CurrencyCode.BRL, CurrencyCode.USD)).rejects.toThrow();
    });
  });

  describe("convertCurrency", () => {
    it("multiplies the amount by the fetched rate", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ date: "2026-08-26", base: "BRL", quote: "USD", rate: 2 }),
      });

      const result = await convertCurrency(10, CurrencyCode.BRL, CurrencyCode.USD);

      expect(result).toBe(20);
    });

    it("returns the same amount without calling the API when currencies match", async () => {
      const result = await convertCurrency(10, CurrencyCode.EUR, CurrencyCode.EUR);

      expect(fetchMock).not.toHaveBeenCalled();
      expect(result).toBe(10);
    });
  });
});
