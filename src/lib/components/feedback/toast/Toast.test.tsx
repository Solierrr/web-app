import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Toast from "./Toast";
import { notify } from "./Toast.utils";

afterEach(() => vi.useRealTimers());

describe("Toast", () => {
  it("announces feedback outside the layout and clears it after the configured duration", () => {
    vi.useFakeTimers();
    const { container } = render(<Toast />);
    act(() => notify("Permita o acesso ao microfone para ditar.", 5000));
    const toast = screen.getByRole("status");
    expect(toast).toHaveTextContent("Permita o acesso ao microfone para ditar.");
    expect(container).not.toContainElement(toast);
    act(() => vi.advanceTimersByTime(5000));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("pauses older messages and resumes their remaining time when they return to the front", () => {
    vi.useFakeTimers();
    render(<Toast />);
    act(() => notify("Primeira", 5000));
    act(() => vi.advanceTimersByTime(4000));
    act(() => notify("Segunda", 5000));
    expect(screen.getByRole("status")).toHaveTextContent("Segunda");
    expect(screen.getByText("Primeira")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(5000));
    expect(screen.getByRole("status")).toHaveTextContent("Primeira");
    act(() => vi.advanceTimersByTime(999));
    expect(screen.getByRole("status")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("dismisses the front message and reveals the previous one", () => {
    render(<Toast />);
    act(() => notify("Primeira"));
    act(() => notify("Segunda"));
    fireEvent.click(screen.getByRole("button", { name: "fechar" }));
    expect(screen.getByRole("status")).toHaveTextContent("Primeira");
    expect(screen.queryByText("Segunda")).not.toBeInTheDocument();
  });
});

describe("Toast with long messages", () => {
  const LONG = "Mensagem muito longa ".repeat(12).trim();

  beforeEach(() => {
    Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
      configurable: true,
      get(this: HTMLElement) {
        return (this.textContent ?? "").length > 80 ? 100 : 20;
      },
    });
    Object.defineProperty(HTMLElement.prototype, "clientHeight", { configurable: true, get: () => 40 });
  });
  afterEach(() => {
    Reflect.deleteProperty(HTMLElement.prototype, "scrollHeight");
    Reflect.deleteProperty(HTMLElement.prototype, "clientHeight");
  });

  it("shows a short message in full without an expand control", () => {
    render(<Toast />);
    act(() => notify("Curta"));
    expect(screen.queryByRole("button", { name: "ver tudo" })).not.toBeInTheDocument();
  });

  it("clamps a long message with an ellipsis and offers an icon to read it fully", () => {
    render(<Toast />);
    act(() => notify(LONG));
    expect(screen.getByText(LONG)).toHaveClass("line-clamp-2");
    fireEvent.click(screen.getByRole("button", { name: "ver tudo" }));
    expect(screen.getByText(LONG)).not.toHaveClass("line-clamp-2");
    expect(screen.getByRole("button", { name: "recolher" })).toHaveAttribute("aria-expanded", "true");
  });

  it("keeps an expanded message on screen and resumes the countdown when collapsed", () => {
    vi.useFakeTimers();
    render(<Toast />);
    act(() => notify(LONG, 5000));
    fireEvent.click(screen.getByRole("button", { name: "ver tudo" }));
    act(() => vi.advanceTimersByTime(20000));
    expect(screen.getByRole("status")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "recolher" }));
    act(() => vi.advanceTimersByTime(5000));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
