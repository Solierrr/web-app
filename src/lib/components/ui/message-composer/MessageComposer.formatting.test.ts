import { describe, expect, it } from "vitest";
import { formatMessageSelection } from "./MessageComposer.formatting";
describe("selected message formatting", () => {
  it("wraps only selected text and preserves its surrounding content", () => {
    expect(formatMessageSelection("Olá mundo!", 4, 9, "bold").value).toBe("Olá **mundo**!");
  });
  it("toggles bold markers around the inner selection", () => {
    expect(formatMessageSelection("Olá **mundo**!", 6, 11, "bold").value).toBe("Olá mundo!");
  });
  it("applies italics", () => {
    expect(formatMessageSelection("mundo", 0, 5, "italic").value).toBe("*mundo*");
  });
  it("replaces headings instead of accumulating markers", () => {
    expect(formatMessageSelection("## Etapa\ntexto", 3, 8, "h1").value).toBe("# Etapa\ntexto");
  });
  it("changes a heading back to regular text", () => {
    expect(formatMessageSelection("# Etapa", 2, 7, "paragraph").value).toBe("Etapa");
  });
  it("ignores empty selections", () => {
    expect(formatMessageSelection("Etapa", 2, 2, "bold").value).toBe("Etapa");
  });
});
