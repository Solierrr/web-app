import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getUnreadCount,
  isNotificationNotFound,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  registerDevice,
  removeDevice,
} from "./notification.service";

vi.mock("@/config/logging/logger", () => ({ default: { serviceError: vi.fn() } }));
vi.mock("@/lib/shared/auth/authToken.utils", () => ({ getAuthSession: () => ({ accessToken: "test-token", userId: "user-1" }) }));

const fetchMock = vi.fn();
function respond(body: unknown, status = 200, type = "application/json") {
  fetchMock.mockResolvedValueOnce(new Response(status === 204 ? null : JSON.stringify(body), { status, headers: { "Content-Type": type } }));
}

describe("notify api contract", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_MOCKS", "DEACTIVATED");
    vi.stubEnv("VITE_NOTIFY_MOCKS", "DEACTIVATED");
    vi.stubEnv("VITE_API_NOTIFY", "https://notify.test/");
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("lists a page of notifications with the bearer token", async () => {
    const page = { content: [], page: 1, size: 10, totalElements: 0, totalPages: 0 };
    respond(page);
    await expect(listNotifications({ page: 1, size: 10, unreadOnly: true })).resolves.toEqual(page);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://notify.test/notify/notifications?page=1&size=10&unreadOnly=true",
      expect.objectContaining({ method: "GET", headers: { Authorization: "Bearer test-token" } }),
    );
  });

  it("reads the unread counter", async () => {
    respond({ count: 7 });
    await expect(getUnreadCount()).resolves.toBe(7);
    expect(fetchMock).toHaveBeenCalledWith("https://notify.test/notify/notifications/unread-count", expect.anything());
  });

  it("marks one notification as read and announces the change", async () => {
    const changed = vi.fn();
    window.addEventListener("solaria:notifications", changed);
    respond({ id: "n-1", readAt: "2026-10-29T10:00:00Z" });
    await expect(markNotificationRead("n-1")).resolves.toMatchObject({ id: "n-1" });
    expect(fetchMock).toHaveBeenCalledWith("https://notify.test/notify/notifications/n-1/read", expect.objectContaining({ method: "PATCH" }));
    expect(changed).toHaveBeenCalledTimes(1);
    window.removeEventListener("solaria:notifications", changed);
  });

  it("marks everything as read without a body", async () => {
    respond(null, 204);
    await expect(markAllNotificationsRead()).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith("https://notify.test/notify/notifications/read-all", expect.objectContaining({ method: "PATCH" }));
  });

  it("registers the web device with the installation id and token", async () => {
    const body = { fcmToken: "token", platform: "WEB" as const, appVersion: "Chrome 130" };
    respond({ installationId: "fid_1", platform: "WEB", appVersion: "Chrome 130", updatedAt: "2026-10-29T10:00:00Z" });
    await registerDevice("fid_1", body);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://notify.test/notify/devices/fid_1",
      expect.objectContaining({ method: "PUT", body: JSON.stringify(body) }),
    );
  });

  it("removes the device and reports a missing one as not found", async () => {
    respond(null, 204);
    await removeDevice("fid_1");
    expect(fetchMock).toHaveBeenCalledWith("https://notify.test/notify/devices/fid_1", expect.objectContaining({ method: "DELETE" }));
    respond({ errorCode: "NOT_FOUND" }, 404, "application/problem+json");
    const failure = await removeDevice("fid_1").catch((error: unknown) => error);
    expect(isNotificationNotFound(failure)).toBe(true);
    expect(isNotificationNotFound(new Error("other"))).toBe(false);
  });

  it("rejects an installation id the api would refuse before calling it", async () => {
    await expect(registerDevice("../x", { fcmToken: "t", platform: "WEB", appVersion: "Chrome 130" })).rejects.toThrow();
    await expect(removeDevice("a b")).rejects.toThrow();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("propagates api errors instead of falling back to mock data", async () => {
    vi.stubEnv("VITE_MOCKS", "ALWAYS");
    respond({ errorCode: "UNAUTHENTICATED" }, 401, "application/problem+json");
    await expect(getUnreadCount()).rejects.toThrow();
  });
});

describe("notify mock mode", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_NOTIFY_MOCKS", "ALWAYS");
    vi.stubEnv("VITE_MOCKS_DELAY_SECONDS", "0");
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
    localStorage.clear();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("serves a seeded history, never calls the network and keeps read state", async () => {
    await expect(getUnreadCount()).resolves.toBe(2);
    const first = await listNotifications({ size: 2 });
    expect(first).toMatchObject({ page: 0, size: 2, totalElements: 3, totalPages: 2 });
    expect(first.content.map((item) => item.type)).toEqual(["NEW_MESSAGE", "SERVICE_SCHEDULED"]);
    expect((await listNotifications({ unreadOnly: true })).content).toHaveLength(2);

    await markNotificationRead(first.content[0].id);
    await expect(getUnreadCount()).resolves.toBe(1);
    await markAllNotificationsRead();
    await expect(getUnreadCount()).resolves.toBe(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("accepts device registration without a network call", async () => {
    await expect(registerDevice("fid_1", { fcmToken: "t", platform: "WEB", appVersion: "Chrome 130" })).resolves.toMatchObject({
      installationId: "fid_1",
    });
    await expect(removeDevice("fid_1")).resolves.toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
