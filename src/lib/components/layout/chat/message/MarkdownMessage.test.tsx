import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import MarkdownMessage from "./MarkdownMessage";
describe("formatted chat messages", () => {
  it("renders emphasis and headings with semantic elements", () => {
    render(<MarkdownMessage content={"# Etapa\n\n**estrutura** e *conexões*"} />);
    expect(screen.getByRole("heading", { name: "Etapa", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("estrutura").tagName).toBe("STRONG");
    expect(screen.getByText("conexões").tagName).toBe("EM");
  });
  it("does not render embedded HTML or remote markdown images", () => {
    const { container } = render(<MarkdownMessage content={"<script>alert(1)</script>\n\n![imagem](https://example.test/photo.jpg)"} />);
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("img")).toBeNull();
  });
  it("does not allow javascript links", () => {
    render(<MarkdownMessage content={"[link](javascript:alert%281%29)"} />);
    expect(screen.getByText("link").getAttribute("href")).not.toMatch(/^javascript:/);
  });
});
