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