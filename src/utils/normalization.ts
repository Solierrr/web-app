import { cleanString } from "./sanitization";

export function emailNormalization(input: string): string {
  let cleaned = cleanString(input);
  cleaned = cleaned.toLowerCase();

  return cleaned;
}

export function phoneNormalization(input: string): string {
  let cleaned = cleanString(input);
  cleaned = cleaned.replace(/\D/g, "");

  return cleaned;
}

// Usado para montar segmentos de URL amigáveis (ex.: nome da empresa/produto
// na rota do anúncio). Remove acentos, baixa a caixa e troca tudo que não é
// [a-z0-9] por hífen.
export function slugNormalization(input: string): string {
  let cleaned = cleanString(input);
  cleaned = cleaned.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  cleaned = cleaned.toLowerCase();
  cleaned = cleaned.replace(/[^a-z0-9]+/g, "-");
  cleaned = cleaned.replace(/^-+|-+$/g, "");

  return cleaned;
}
