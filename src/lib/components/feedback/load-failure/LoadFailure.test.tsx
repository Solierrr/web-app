import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import LoadFailure from "./LoadFailure";

describe("LoadFailure", () => {
  it("shows the generic message and retries on click", () => {
    const onRetry = vi.fn();
    render(<LoadFailure onRetry={onRetry} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button"));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("shows what failed to load as the title when there is one", () => {
    render(<LoadFailure title="Não foi possível carregar as ofertas." onRetry={() => undefined} />);
    expect(screen.getByRole("heading", { name: "Não foi possível carregar as ofertas." })).toBeInTheDocument();
  });
});
