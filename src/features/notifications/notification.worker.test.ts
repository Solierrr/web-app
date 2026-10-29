import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

type Listener = (event: unknown) => void;

const script = readFileSync(resolve(process.cwd(), "public/firebase-messaging-sw.js"), "utf-8");

function loadWorker(windows: { url: string; focus: () => Promise<unknown>; postMessage: (message: unknown) => void }[] = []) {
  const listeners: Record<string, Listener> = {};
  let background: ((payload: { data?: Record<string, string> }) => unknown) | undefined;
  const initializeApp = vi.fn();
  const showNotification = vi.fn().mockResolvedValue(undefined);
  const openWindow = vi.fn().mockResolvedValue(undefined);
  const worker = {
    location: { href: "https://app.test/firebase-messaging-sw.js?apiKey=k&projectId=p&messagingSenderId=m&appId=a", origin: "https://app.test" },
    registration: { showNotification },
    clients: { matchAll: vi.fn().mockResolvedValue(windows), openWindow },
    addEventListener: (type: string, listener: Listener) => {
      listeners[type] = listener;
    },
  };
  const firebase = {
    initializeApp,
    messaging: () => ({
      onBackgroundMessage: (handler: typeof background) => {
        background = handler;
      },
    }),
  };
  const importScripts = vi.fn();
  new Function("self", "importScripts", "firebase", script)(worker, importScripts, firebase);
  return { listeners, background: () => background!, initializeApp, showNotification, openWindow, importScripts };
}

function click(listeners: Record<string, Listener>, data: unknown) {
  const pending: Promise<unknown>[] = [];
  const close = vi.fn();
  listeners.notificationclick({ notification: { close, data }, waitUntil: (promise: Promise<unknown>) => pending.push(promise) });
  return { close, done: Promise.all(pending) };
}

describe("firebase messaging service worker", () => {
  beforeEach(() => vi.clearAllMocks());

  it("initializes firebase only with the public values received in the query string", () => {
    const { initializeApp, importScripts } = loadWorker();
    expect(initializeApp).toHaveBeenCalledWith({ apiKey: "k", projectId: "p", messagingSenderId: "m", appId: "a" });
    expect(importScripts).toHaveBeenCalledWith(
      expect.stringContaining("firebase-app-compat.js"),
      expect.stringContaining("firebase-messaging-compat.js"),
    );
  });

  it("builds the notification from a data-only message", async () => {
    const worker = loadWorker();
    await worker.background()({
      data: { notificationId: "n-1", type: "NEW_MESSAGE", title: "Nova mensagem", body: "Olá", conversationId: "c-1" },
    });
    expect(worker.showNotification).toHaveBeenCalledWith("Nova mensagem", {
      body: "Olá",
      tag: "n-1",
      data: { type: "NEW_MESSAGE", data: { conversationId: "c-1" }, notificationId: "n-1" },
    });
  });

  it("falls back to a default title when the message has none", async () => {
    const worker = loadWorker();
    await worker.background()({});
    expect(worker.showNotification).toHaveBeenCalledWith("Solaria", expect.objectContaining({ body: "" }));
  });

  it("focuses an open window and hands it the target instead of opening another", async () => {
    const focus = vi.fn().mockResolvedValue(undefined);
    const postMessage = vi.fn();
    const worker = loadWorker([
      { url: "https://other.test/", focus: vi.fn(), postMessage: vi.fn() },
      { url: "https://app.test/pt-BR/mensagens", focus, postMessage },
    ]);
    const target = { type: "NEW_MESSAGE", data: { conversationId: "c-1" } };
    const { close, done } = click(worker.listeners, target);
    await done;
    expect(close).toHaveBeenCalled();
    expect(focus).toHaveBeenCalled();
    expect(postMessage).toHaveBeenCalledWith({ source: "solaria-push", target });
    expect(worker.openWindow).not.toHaveBeenCalled();
  });

  it("opens the app with the target in the url when no window is open", async () => {
    const worker = loadWorker();
    const target = { type: "NEW_MESSAGE", data: { conversationId: "c-1" } };
    await click(worker.listeners, target).done;
    const opened = new URL(worker.openWindow.mock.calls[0][0]);
    expect(opened.origin).toBe("https://app.test");
    expect(opened.pathname).toBe("/");
    expect(JSON.parse(opened.searchParams.get("push")!)).toEqual(target);
  });

  it("ignores a click on a notification that carries no target", async () => {
    const worker = loadWorker();
    await click(worker.listeners, undefined).done;
    expect(worker.openWindow).not.toHaveBeenCalled();
  });
});
