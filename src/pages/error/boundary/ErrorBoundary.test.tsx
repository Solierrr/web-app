import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ErrorBoundary from "./ErrorBoundary";

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
    expect(screen.getByText("Falha simulada")).toBeInTheDocument();

    vi.restoreAllMocks();
  });
});
