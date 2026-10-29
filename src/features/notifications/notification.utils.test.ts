import SupportedLanguages from "@/config/i18n/supported.enum";
import { describe, expect, it } from "vitest";
import { routePaths } from "@/config/i18n/paths";
import {
  browserVersionLabel,
  isInstallationId,
  normalizePushTarget,
  parsePushLaunch,
  resolveNotificationRoute,
  stripPushLaunch,
} from "./notification.utils";

describe("notification utils", () => {
  it("labels the browser in at most 32 characters", () => {
    expect(browserVersionLabel("Mozilla/5.0 AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36")).toBe("Chrome 130");
    expect(browserVersionLabel("Mozilla/5.0 Chrome/130.0.0.0 Safari/537.36 Edg/129.0.0.0")).toBe("Edge 129");
    expect(browserVersionLabel("Mozilla/5.0 Gecko/20100101 Firefox/131.0")).toBe("Firefox 131");
    expect(browserVersionLabel("Mozilla/5.0 Version/17.4 Safari/605.1.15")).toBe("Safari 17");
    expect(browserVersionLabel("unknown")).toBe("Web");
  });

  it("validates the installation id like the api does", () => {
    expect(isInstallationId("fJ3kP9xQ-2mVb7Lw_Zt1Ry")).toBe(true);
    expect(isInstallationId("")).toBe(false);
    expect(isInstallationId("a/b")).toBe(false);
    expect(isInstallationId("a".repeat(65))).toBe(false);
  });

  it("routes a new message to its conversation and only known routes", () => {
    expect(resolveNotificationRoute({ type: "NEW_MESSAGE", data: { conversationId: "c-1" } }, SupportedLanguages.PTBR)).toBe(
      routePaths.chat(SupportedLanguages.PTBR, "c-1"),
    );
    expect(resolveNotificationRoute({ type: "NEW_MESSAGE", data: { conversationId: "../admin" } }, SupportedLanguages.ENUS)).toBe(
      routePaths.inbox(SupportedLanguages.ENUS),
    );
    expect(resolveNotificationRoute({ type: "NEW_MESSAGE", data: {} }, SupportedLanguages.ESES)).toBe(routePaths.inbox(SupportedLanguages.ESES));
    expect(resolveNotificationRoute({ type: "SERVICE_SCHEDULED", data: { url: "https://evil.test" } }, SupportedLanguages.PTBR)).toBeNull();
  });

  it("accepts only known types and short string data from a push launch", () => {
    expect(normalizePushTarget({ type: "OTHER", data: {} })).toBeNull();
    expect(normalizePushTarget(null)).toBeNull();
    expect(normalizePushTarget({ type: "NEW_MESSAGE", data: { conversationId: "c-1", n: 4, long: "x".repeat(201) } })).toEqual({
      type: "NEW_MESSAGE",
      data: { conversationId: "c-1" },
    });
    const launch = `?push=${encodeURIComponent(JSON.stringify({ type: "NEW_MESSAGE", data: { conversationId: "c-1" } }))}&x=1`;
    expect(parsePushLaunch(launch)).toEqual({ type: "NEW_MESSAGE", data: { conversationId: "c-1" } });
    expect(parsePushLaunch("?push=not-json")).toBeNull();
    expect(parsePushLaunch("")).toBeNull();
    expect(stripPushLaunch(launch)).toBe("?x=1");
    expect(stripPushLaunch("?push=1")).toBe("");
  });
});
