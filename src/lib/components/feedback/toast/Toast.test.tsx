import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
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
