import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "@/config/i18n/internationalization";

const { serviceErrorMock } = vi.hoisted(() => ({ serviceErrorMock: vi.fn() }));

vi.mock("@/config/logging/logger", () => ({ default: { serviceError: serviceErrorMock } }));

import { getMyUser } from "@/features/users/user/user.service";
import { revokeSession } from "@/features/settings/settings.service";
import { getHttpErrorMessage, httpJson, HttpResponseError } from "./http.service";

describe("localized service errors", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_MOCKS", "DEACTIVATED");
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(async () => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    await i18n.changeLanguage("pt-BR");
  });

  it.each([
    ["pt-BR", "Não foi possível carregar seu perfil"],
    ["en-US", "Unable to load your profile"],
    ["es-ES", "No se pudo cargar tu perfil"],
  ])("uses the current %s language and logs the HTTP service and operation", async (language, message) => {
    await i18n.changeLanguage(language);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503 }));

    await expect(getMyUser()).rejects.toThrow(message);
    expect(serviceErrorMock).toHaveBeenCalledOnce();
    expect(serviceErrorMock).toHaveBeenCalledWith(expect.objectContaining({ service: "user", operation: "getMyUser", status: 503 }));
  });

  it("translates interpolated local errors after switching language without reloading the service", async () => {
    await i18n.changeLanguage("en-US");
    await expect(revokeSession("device-1")).rejects.toThrow("Ending session device-1 is not supported by the server yet");
    await i18n.changeLanguage("es-ES");
    await expect(revokeSession("device-1")).rejects.toThrow("El servidor aún no permite cerrar la sesión device-1");
    expect(serviceErrorMock).toHaveBeenLastCalledWith(expect.objectContaining({ service: "settings", operation: "revokeSession" }));
  });

  it("keeps service catalog keys and interpolation variables consistent in all supported languages", () => {
    const catalogs = import.meta.glob("../../../config/i18n/locales/*/services.json", { eager: true, import: "default" });
    const entries = Object.values(catalogs) as Record<string, Record<string, string>>[];
    expect(entries).toHaveLength(3);
    const flatten = (catalog: Record<string, Record<string, string>>) =>
      Object.fromEntries(
        Object.entries(catalog).flatMap(([service, messages]) =>
          Object.entries(messages).map(([operation, message]) => [
            `${service}.${operation}`,
            [...message.matchAll(/\{\{(\w+)\}\}/g)].map((match) => match[1]).sort(),
          ]),
        ),
      );
    expect(flatten(entries[1])).toEqual(flatten(entries[0]));
    expect(flatten(entries[2])).toEqual(flatten(entries[0]));
  });
});

describe("API error codes", () => {
  afterEach(async () => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    await i18n.changeLanguage("pt-BR");
  });

  it.each([
    ["pt-BR", "Somente modelos em análise podem ser editados."],
    ["en-US", "Only models under review can be edited."],
    ["es-ES", "Solo se pueden editar modelos en revisión."],
  ])("translates core errorCode in %s and logs the stable code without the remote detail", async (language, message) => {
    await i18n.changeLanguage(language);
    serviceErrorMock.mockClear();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ errorCode: "MODEL_NOT_EDITABLE", code: "INTERNAL_ERROR", detail: "remote diagnostic" }), { status: 422 })));

    const failure = await httpJson("/api/models/1", { service: "solarPanel", operation: "update", errorMessage: "Fallback" }).catch((error) => error);

    if (!(failure instanceof Error) || !(failure.cause instanceof HttpResponseError)) throw new Error("Expected an HTTP failure");
    expect(failure.message).toBe(message);
    expect(failure.cause).toBeInstanceOf(HttpResponseError);
    expect(failure.cause.code).toBe("MODEL_NOT_EDITABLE");
    expect(serviceErrorMock).toHaveBeenCalledOnce();
    expect(serviceErrorMock).toHaveBeenCalledWith(expect.objectContaining({ errorCode: "MODEL_NOT_EDITABLE", status: 422 }));
    expect(serviceErrorMock.mock.calls[0][0].error.message).not.toContain("remote diagnostic");
  });

  it.each([{ code: "ACCESS_DENIED" }, { status: "ACCESS_DENIED" }])("preserves legacy responses: %j", async (body) => {
    await i18n.changeLanguage("en-US");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status: 403 })));
    await expect(httpJson("/api/models", { service: "test", operation: "list", errorMessage: "Fallback" })).rejects.toThrow("You do not have permission to perform this action.");
  });

  it.each([null, { errorCode: "NEW_ERROR", detail: "internal diagnostic" }, { errorCode: "__proto__" }])("keeps the operation fallback for unknown or malformed responses: %j", async (body) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status: 400 })));
    await expect(httpJson("/api/models", { service: "test", operation: "list", errorMessage: "Local fallback" })).rejects.toThrow("Local fallback");
  });

  it("uses the current language when displaying an existing error", async () => {
    const error = new Error("Old message", { cause: new HttpResponseError(403, "ACCESS_DENIED") });
    await i18n.changeLanguage("es-ES");
    expect(getHttpErrorMessage(error, "Fallback")).toBe("No tienes permiso para realizar esta acción.");
    expect(getHttpErrorMessage(new Error("remote diagnostic"), "Fallback")).toBe("Fallback");
  });

  it("provides the same error codes in all three languages", () => {
    const catalogs = Object.values(import.meta.glob("../../../config/i18n/locales/*/errors.json", { eager: true, import: "default" })) as Record<string, string>[];
    expect(catalogs).toHaveLength(3);
    for (const catalog of catalogs) {
      expect(Object.keys(catalog).sort()).toEqual(Object.keys(catalogs[0]).sort());
      expect(Object.values(catalog).every((message) => message.trim().length > 0)).toBe(true);
    }
  });
});

describe("multipart uploads", () => {
  afterEach(() => vi.unstubAllGlobals());
  it("passes FormData intact and lets the browser set its boundary", async () => {
    const { httpJson } = await import("./http.service");
    const body = new FormData();
    body.set("file", new File(["image"], "panel.png", { type: "image/png" }));
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ id: "photo" }) });
    vi.stubGlobal("fetch", fetchMock);
    await httpJson("/api/model-photos", { service: "solarPanel", operation: "upload", method: "POST", body, errorMessage: "Upload failed" });
    expect(fetchMock).toHaveBeenCalledWith("/api/model-photos", expect.objectContaining({ body }));
    expect(fetchMock.mock.calls[0][1].headers).not.toHaveProperty("Content-Type");
  });
});
