import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AdapterSidebar from "./AdapterSidebar";

describe("AdapterSidebar", () => {
  it("renders its children", () => {
    render(
      <AdapterSidebar>
        <p>Chat</p>
      </AdapterSidebar>,
    );

    expect(screen.getByText("Chat")).toBeInTheDocument();
  });

  it("does not render a close button when onClose is not passed", () => {
    render(
      <AdapterSidebar>
        <p>Chat</p>
      </AdapterSidebar>,
    );

    expect(screen.queryByRole("button", { name: /fechar/i })).not.toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", () => {
    const onClose = vi.fn();

    render(
      <AdapterSidebar onClose={onClose}>
        <p>Chat</p>
      </AdapterSidebar>,
    );

    screen.getByRole("button", { name: /fechar/i }).click();

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
