import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import MocksMode from "@/domain/enum/mocksMode";

import { solarPanelAnnouncementMocks } from "../mocks/handler.service";
import { getSolarPanel, getSolarPanels } from "./solarPanel.service";

describe("solarPanel.service", () => {
    const fetchMock = vi.fn();

    beforeEach(() => {
        vi.stubGlobal("fetch", fetchMock);
    });

    afterEach(() => {
        vi.unstubAllEnvs();
        vi.unstubAllGlobals();
        fetchMock.mockReset();
    });

    it("does not call the API and returns the mock when VITE_MOCKS is ALWAYS", async () => {
        vi.stubEnv("VITE_MOCKS", MocksMode.Always);

        const result = await getSolarPanel("0");

        expect(fetchMock).not.toHaveBeenCalled();
        expect(result).toEqual(solarPanelAnnouncementMocks[0]);
    });

    it("returns the API response when VITE_MOCKS is FALLBACK and the API succeeds", async () => {
        vi.stubEnv("VITE_MOCKS", MocksMode.Fallback);
        const apiPanel = { id: "from-api" };
        fetchMock.mockResolvedValue({ ok: true, json: async () => apiPanel });

        const result = await getSolarPanel("0");

        expect(result).toEqual(apiPanel);
    });

    it("falls back to the mock when VITE_MOCKS is FALLBACK and the API fails", async () => {
        vi.stubEnv("VITE_MOCKS", MocksMode.Fallback);
        fetchMock.mockResolvedValue({ ok: false });

        const result = await getSolarPanel("0");

        expect(result).toEqual(solarPanelAnnouncementMocks[0]);
    });

    it("propagates the error when VITE_MOCKS is DEACTIVATED and the API fails", async () => {
        vi.stubEnv("VITE_MOCKS", MocksMode.Deactivated);
        fetchMock.mockResolvedValue({ ok: false });

        await expect(getSolarPanel("0")).rejects.toThrow();
    });

    it("does not call the API and returns all mocks when VITE_MOCKS is ALWAYS for getSolarPanels", async () => {
        vi.stubEnv("VITE_MOCKS", MocksMode.Always);

        const result = await getSolarPanels(["0", "1"]);

        expect(fetchMock).not.toHaveBeenCalled();
        expect(result).toEqual(solarPanelAnnouncementMocks);
    });
});
