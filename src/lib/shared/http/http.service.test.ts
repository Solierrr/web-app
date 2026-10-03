import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "@/config/i18n/internationalization";

const { serviceErrorMock } = vi.hoisted(() => ({ serviceErrorMock: vi.fn() }));

vi.mock("@/config/logging/logger", () => ({ default: { serviceError: serviceErrorMock } }));

import { getMyUser } from "@/features/users/user/user.service";
import { revokeSession } from "@/features/settings/settings.service";

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
