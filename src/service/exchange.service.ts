import CurrencyCode from "@/domain/enum/currency";

const API = import.meta.env.VITE_EXCHANGE_API

interface ExchangeRateResponse {
  date: string;
  base: string;
  quote: string;
  rate: number;
}

export async function getExchangeRate(from: CurrencyCode, to: CurrencyCode): Promise<number> {
  if (from === to) { return 1; }

  const response = await fetch(`${API}/rate/${from}/${to}`);

  if (!response.ok) { throw new Error(`Não foi possível obter o câmbio ${from}/${to}`); }

  const data: ExchangeRateResponse = await response.json();

  return data.rate;
}

export async function convertCurrency(amount: number, from: CurrencyCode, to: CurrencyCode): Promise<number> {
  const rate = await getExchangeRate(from, to);

  return amount * rate;
}