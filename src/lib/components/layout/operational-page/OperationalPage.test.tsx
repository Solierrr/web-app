import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import OperationalPage from "./OperationalPage";

vi.mock("@@/layout/access/canvas/SideCanvas", () => ({ default: () => <div data-testid="canvas" /> }));

describe("OperationalPage", () => {
  it("waits for the entire page before revealing the heading or actions", () => {
    const { rerender } = render(
      <OperationalPage title="Título" actions={<button>Editar</button>} loading sideBackground>
        Dados
      </OperationalPage>,
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    rerender(
      <OperationalPage title="Título" sideBackground>
        Dados
      </OperationalPage>,
    );
    expect(screen.getByRole("heading", { name: "Título" })).toBeInTheDocument();
    expect(screen.getByTestId("canvas")).toBeInTheDocument();
  });
});
