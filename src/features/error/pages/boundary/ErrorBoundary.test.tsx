import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ErrorBoundary from "./ErrorBoundary";

vi.mock("@@/layout/access/canvas/Canvas", () => ({ default: () => <div data-testid="error-canvas" /> }));

function Bomb(): never {
  throw new Error("Falha simulada");
}

describe("ErrorBoundary", () => {
  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <p>Conteudo normal</p>
      </ErrorBoundary>,
    );

    expect(screen.getByText("Conteudo normal")).toBeInTheDocument();
  });

  it("renders a fallback UI instead of crashing when a child throws", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Algo deu errado")).toBeInTheDocument();
    expect(screen.queryByText("Falha simulada")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Voltar ao in\u00edcio" })).toBeInTheDocument();

    vi.restoreAllMocks();
  });
});
