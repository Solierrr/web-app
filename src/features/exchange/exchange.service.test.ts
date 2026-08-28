import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { loggerMock } = vi.hoisted(() => ({
  loggerMock: {
    serviceError: vi.fn(),
  },
}));

vi.mock("@/config/logging/logger", () => ({
  default: loggerMock,
}));

import CurrencyCode from "./exchange.enum";
import { convertCurrency, getExchangeRate } from "./exchange.service";

describe("exchange.service", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubEnv("VITE_EXCHANGE_API", "https://exchange.test");
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    fetchMock.mockReset();
    loggerMock.serviceError.mockReset();
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
        json: async () => ({
          date: "2026-08-26",
          base: "BRL",
          quote: "USD",
          rate: 5.5,
        }),
      });

      const result = await getExchangeRate(CurrencyCode.BRL, CurrencyCode.USD);

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/rate/BRL/USD"),
      );
      expect(result).toBe(5.5);
    });

    it("logs and throws when the API responds with an error status", async () => {
      fetchMock.mockResolvedValue({ ok: false, status: 503 });

      await expect(
        getExchangeRate(CurrencyCode.BRL, CurrencyCode.USD),
      ).rejects.toThrow("Unable to get exchange rate for BRL/USD");

      expect(loggerMock.serviceError).toHaveBeenCalledWith(
        expect.objectContaining({
          service: "exchange",
          operation: "getExchangeRate",
          status: 503,
        }),
      );
    });

    it("logs and throws when the network request fails", async () => {
      fetchMock.mockRejectedValue(new Error("Network unavailable"));

      await expect(
        getExchangeRate(CurrencyCode.BRL, CurrencyCode.USD),
      ).rejects.toThrow("Unable to get exchange rate for BRL/USD");

      expect(loggerMock.serviceError).toHaveBeenCalledWith(
        expect.objectContaining({
          service: "exchange",
          operation: "getExchangeRate",
        }),
      );
    });

    it("logs and throws when the API returns an invalid rate", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ rate: 0 }),
      });

      await expect(
        getExchangeRate(CurrencyCode.BRL, CurrencyCode.USD),
      ).rejects.toThrow("Unable to get exchange rate for BRL/USD");

      expect(loggerMock.serviceError).toHaveBeenCalledWith(
        expect.objectContaining({
          service: "exchange",
          operation: "getExchangeRate",
        }),
      );
    });
  });

  describe("convertCurrency", () => {
    it("multiplies the amount by the fetched rate", async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ rate: 2 }),
      });

      const result = await convertCurrency(
        10,
        CurrencyCode.BRL,
        CurrencyCode.USD,
      );

      expect(result).toBe(20);
    });

    it("returns the same amount without calling the API when currencies match", async () => {
      const result = await convertCurrency(
        10,
        CurrencyCode.EUR,
        CurrencyCode.EUR,
      );

      expect(fetchMock).not.toHaveBeenCalled();
      expect(result).toBe(10);
    });
  });
});
