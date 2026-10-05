export type MessageFormat = "bold" | "italic" | "paragraph" | "h1" | "h2" | "h3";
export function formatMessageSelection(value: string, start: number, end: number, format: MessageFormat) {
  if (start < 0 || end <= start || end > value.length) return { value, caret: end };
  if (format === "bold" || format === "italic") {
    const marker = format === "bold" ? "**" : "*";
    const before = value.slice(0, start),
      selected = value.slice(start, end),
      after = value.slice(end);
    const italicOutside = (before.match(/\*+$/)?.[0].length ?? 0) % 2 === 1 && (after.match(/^\*+/)?.[0].length ?? 0) % 2 === 1;
    const italicInside = (selected.match(/^\*+/)?.[0].length ?? 0) % 2 === 1 && (selected.match(/\*+$/)?.[0].length ?? 0) % 2 === 1;
    if ((format === "bold" || italicOutside) && before.endsWith(marker) && after.startsWith(marker))
      return { value: before.slice(0, -marker.length) + selected + after.slice(marker.length), caret: end - marker.length };
    if ((format === "bold" || italicInside) && selected.startsWith(marker) && selected.endsWith(marker) && selected.length > marker.length * 2)
      return { value: before + selected.slice(marker.length, -marker.length) + after, caret: end - marker.length * 2 };
    return { value: before + marker + selected + marker + after, caret: end + marker.length * 2 };
  }
  const lineStart = value.lastIndexOf("\n", start - 1) + 1;
  const nextBreak = value.indexOf("\n", end);
  const lineEnd = nextBreak < 0 ? value.length : nextBreak;
  const prefix = format === "paragraph" ? "" : "#".repeat(Number(format.slice(1))) + " ";
  const lines = value
    .slice(lineStart, lineEnd)
    .split("\n")
    .map((line) => (line ? prefix + line.replace(/^#{1,6}\s+/, "") : line))
    .join("\n");
  return { value: value.slice(0, lineStart) + lines + value.slice(lineEnd), caret: lineStart + lines.length };
}
