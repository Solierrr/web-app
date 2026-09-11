export function cleanString(input: string): string {
  let cleaned = input.trim();
  cleaned = cleaned.replace(/\s+/g, " ");
  cleaned = cleaned.replace(/[\x00-\x1F\x7F]/g, "");

  return cleaned;
}

export function limitRange(input: string, width: number): string {
  return input.slice(0, width);
}

export function sanitizeHtml(input: string): string {
  return input.replace(/<[^>]*>?/gm, "");
}
