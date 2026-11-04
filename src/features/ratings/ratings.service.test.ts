import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { averageRating, createRating, excludeRating, listRatingsOf, updateRating, type Rating } from "./ratings.service";

vi.mock("@/config/logging/logger", () => ({ default: { serviceError: vi.fn() } }));
vi.mock("@/lib/shared/auth/authToken.utils", () => ({ getAuthSession: () => ({ accessToken: "test-token" }) }));

const fetchMock = vi.fn();
function respond(body: unknown, status = 200) {
  fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }));
}
const request = (call: number) => ({ url: fetchMock.mock.calls[call][0] as string, init: fetchMock.mock.calls[call][1] as RequestInit });
const rating = (value: number, status: Rating["status"] = "ACTIVE"): Rating => ({
  id: String(value),
  evaluatorId: "ana",
  evaluatedId: "pro",
  typeRate: "PROFISSIONAL",
  comment: null,
  rating: value,
  status,
  timestamp: "x",
});

describe("Ratings service", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_MOCKS", "ALWAYS");
    vi.stubEnv("VITE_MESSENGER_MOCKS", "DEACTIVATED");
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("follows the messenger rating routes", async () => {
    respond([]);
    await listRatingsOf("pro");
    expect(request(0).url).toMatch(/\/messaging\/ratings\/evaluated\/pro$/);

    respond(rating(5));
    await createRating({ evaluatedId: "pro", typeRate: "PROFISSIONAL", rating: 5, comment: "Ótimo" });
    expect(request(1).init.method).toBe("POST");
    expect(JSON.parse(request(1).init.body as string)).toEqual({ evaluatedId: "pro", typeRate: "PROFISSIONAL", rating: 5, comment: "Ótimo" });

    respond(rating(4));
    await updateRating("r1", { rating: 4 });
    expect(request(2).url).toMatch(/\/messaging\/ratings\/r1$/);
    expect(request(2).init.method).toBe("PATCH");

    respond(rating(4, "EXCLUDED"));
    await excludeRating("r1");
    expect(request(3).url).toMatch(/\/messaging\/ratings\/r1\/status$/);
    expect(JSON.parse(request(3).init.body as string)).toEqual({ status: "EXCLUDED" });
  });

  it("averages only the active ratings", () => {
    expect(averageRating([])).toBeNull();
    expect(averageRating([rating(5), rating(4), rating(1, "EXCLUDED")])).toBe(4.5);
  });
});
