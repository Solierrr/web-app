import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Chart from "./Chart";
import { MetricCard } from "../dashboard.presets";

const engine = vi.hoisted(() => ({ setOption: vi.fn(), resize: vi.fn(), dispose: vi.fn(), isDisposed: () => false }));
vi.mock("./chart.engine", () => ({ init: () => engine }));
afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("dashboard chart lifecycle", () => {
  it("updates payload, resizes with its container, and disposes on unmount", async () => {
    let resized = () => {};
    const disconnect = vi.fn();
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(callback: () => void) {
          resized = callback;
        }
        observe() {}
        disconnect = disconnect;
      },
    );
    vi.stubGlobal("matchMedia", () => ({ matches: false }));
    const payload = { labels: ["Mon"], series: [{ name: "Energy", values: [12] }] };
    const { rerender, unmount } = render(<Chart title="Energy" payload={payload} kind="line" unit="kWh" />);
    await waitFor(() => expect(engine.setOption).toHaveBeenCalled());
    act(() => resized());
    expect(engine.resize).toHaveBeenCalled();
    rerender(<Chart title="Energy" payload={{ ...payload, series: [{ name: "Energy", values: [24] }] }} kind="line" unit="kWh" />);
    await waitFor(() => expect(engine.setOption.mock.lastCall?.[0].series[0].data).toEqual([24]));
    fireEvent.click(screen.getByText("Ver dados do gráfico"));
    expect(screen.getByRole("cell", { name: "24 kWh" })).toBeInTheDocument();
    unmount();
    expect(disconnect).toHaveBeenCalled();
    expect(engine.dispose).toHaveBeenCalledOnce();
  });
  it("keeps a valid zero visible and gives absence its own state", () => {
    const { rerender } = render(<MetricCard title="Total" payload={{ value: 0 }} />);
    expect(screen.getByText("0")).toBeInTheDocument();
    rerender(<MetricCard title="Total" payload={{ value: null }} />);
    expect(screen.getByRole("status")).toHaveTextContent("Sem dados para este período.");
    rerender(<MetricCard title="Total" payload={{ value: null }} loading />);
    expect(screen.getByRole("status")).toHaveAccessibleName("Carregando indicador...");
    rerender(<MetricCard title="Total" payload={{ value: null }} error="Falha" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Falha");
  });
});
