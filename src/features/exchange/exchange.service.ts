import logger from "@/config/logging/logger";

import CurrencyCode from "./exchange.enum";
import type { ExchangeRateResponse } from "./exchange";

const SERVICE_NAME = "exchange";

function isExchangeRateResponse(value: unknown): value is ExchangeRateResponse {
  if (typeof value !== "object" || value === null) { return false; }
  const { rate } = value as Record<string, unknown>;
  return typeof rate === "number" && Number.isFinite(rate) && rate > 0;
}

export async function getExchangeRate(from: CurrencyCode, to: CurrencyCode): Promise<number> {
  if (from === to) { return 1; }

  const api = import.meta.env.VITE_EXCHANGE_API;

  if (!api) {
    const error = new Error("Exchange API is not configured");
    logger.serviceError({
      service: SERVICE_NAME,
      operation: "getExchangeRate",
      error,
    });
    throw error;
  }

  let response: Response;

  try {
    response = await fetch(`${api}/rate/${from}/${to}`);
  } catch (error) {
    logger.serviceError({
      service: SERVICE_NAME,
      operation: "getExchangeRate",
      error,
    });
    throw new Error(`Unable to get exchange rate for ${from}/${to}`, {
      cause: error,
    });
  }

  if (!response.ok) {
    const error = new Error(`Exchange API returned HTTP ${response.status}`);
    logger.serviceError({
      service: SERVICE_NAME,
      operation: "getExchangeRate",
      status: response.status,
      error,
    });
    throw new Error(`Unable to get exchange rate for ${from}/${to}`, {
      cause: error,
    });
  }

  let data: unknown;

  try {
    data = await response.json();
  } catch (error) {
    logger.serviceError({
      service: SERVICE_NAME,
      operation: "getExchangeRate",
      error,
    });
    throw new Error(`Unable to get exchange rate for ${from}/${to}`, {
      cause: error,
    });
  }

  if (!isExchangeRateResponse(data)) {
    const error = new Error("Exchange API returned an invalid rate");
    logger.serviceError({
      service: SERVICE_NAME,
      operation: "getExchangeRate",
      error,
    });
    throw new Error(`Unable to get exchange rate for ${from}/${to}`, {
      cause: error,
    });
  }

  return data.rate;
}

export async function convertCurrency(amount: number, from: CurrencyCode, to: CurrencyCode): Promise<number> {
  const rate = await getExchangeRate(from, to);

  return amount * rate;
}
