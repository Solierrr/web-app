export function cleanString(input: string): string {
  let cleaned = input.trim();
  cleaned = cleaned.replace(/\s+/g, " ");
  cleaned = Array.from(cleaned)
    .filter((char) => {
      const code = char.charCodeAt(0);
      return code > 0x1f && code !== 0x7f;
    })
    .join("");

  return cleaned;
}

export function limitRange(input: string, width: number): string {
  return input.slice(0, width);
}

export function sanitizeHtml(input: string): string {
  return input.replace(/<[^>]*>?/gm, "");
}
