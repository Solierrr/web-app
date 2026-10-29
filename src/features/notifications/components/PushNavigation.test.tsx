import { act, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PushNavigation from "./PushNavigation";

const markNotificationRead = vi.hoisted(() => vi.fn());

vi.mock("../notification.service", () => ({ markNotificationRead }));

function Where() {
  const { pathname, search } = useLocation();
  return <output data-testid="where">{`${pathname}${search}`}</output>;
}

function renderAt(entry: string) {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <PushNavigation />
      <Where />
    </MemoryRouter>,
  );
}

const launch = (value: unknown) => `?push=${encodeURIComponent(JSON.stringify(value))}`;

describe("PushNavigation", () => {
  const worker = new EventTarget() as EventTarget & { startMessages: () => void };

  beforeEach(() => {
    vi.clearAllMocks();
    markNotificationRead.mockResolvedValue({});
    worker.startMessages = vi.fn();
    Object.defineProperty(navigator, "serviceWorker", { configurable: true, value: worker });
  });
  afterEach(() => {
    Reflect.deleteProperty(navigator, "serviceWorker");
  });

  it("opens the conversation of a notification the browser launched the app for", async () => {
    renderAt(`/pt-BR${launch({ type: "NEW_MESSAGE", data: { conversationId: "c-1" }, notificationId: "n-1" })}`);
    await waitFor(() => expect(screen.getByTestId("where")).toHaveTextContent("/pt-BR/mensagens/c-1"));
    expect(screen.getByTestId("where")).not.toHaveTextContent("push");
    expect(markNotificationRead).toHaveBeenCalledWith("n-1");
  });

  it("uses the language of the address and keeps the other query parameters", async () => {
    renderAt(`/en-US${launch({ type: "SERVICE_SCHEDULED", data: {} })}&x=1`);
    await waitFor(() => expect(screen.getByTestId("where")).toHaveTextContent("/en-US?x=1"));
  });

  it("drops a launch parameter it cannot trust without navigating anywhere else", async () => {
    renderAt("/pt-BR/painel?push=%7Bnot-json&x=1");
    await waitFor(() => expect(screen.getByTestId("where")).toHaveTextContent("/pt-BR/painel?x=1"));
    expect(markNotificationRead).not.toHaveBeenCalled();
  });

  it("opens the conversation when the service worker reports a click on an already open app", async () => {
    renderAt("/pt-BR/painel");
    expect(worker.startMessages).toHaveBeenCalled();
    const target = { type: "NEW_MESSAGE", data: { conversationId: "c-2" }, notificationId: "n-2" };
    act(() => {
      worker.dispatchEvent(new MessageEvent("message", { data: { source: "solaria-push", target }, origin: window.location.origin }));
    });
    await waitFor(() => expect(screen.getByTestId("where")).toHaveTextContent("/pt-BR/mensagens/c-2"));
    expect(markNotificationRead).toHaveBeenCalledWith("n-2");
  });

  it("ignores messages that are not from the push worker or carry an unknown target", () => {
    renderAt("/pt-BR/painel");
    act(() => {
      worker.dispatchEvent(
        new MessageEvent("message", { data: { source: "other", target: { type: "NEW_MESSAGE", data: {} } }, origin: window.location.origin }),
      );
      worker.dispatchEvent(
        new MessageEvent("message", { data: { source: "solaria-push", target: { type: "UNKNOWN", data: {} } }, origin: window.location.origin }),
      );
      worker.dispatchEvent(
        new MessageEvent("message", { data: { source: "solaria-push", target: { type: "NEW_MESSAGE", data: {} } }, origin: "https://evil.test" }),
      );
    });
    expect(screen.getByTestId("where")).toHaveTextContent("/pt-BR/painel");
  });

  it("renders nothing and works in browsers without service workers", () => {
    Reflect.deleteProperty(navigator, "serviceWorker");
    const { container } = renderAt("/pt-BR");
    expect(container.querySelector("output")).toBeInTheDocument();
    expect(screen.getByTestId("where")).toHaveTextContent("/pt-BR");
  });
});
