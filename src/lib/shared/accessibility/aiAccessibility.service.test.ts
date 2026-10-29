import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HttpResponseError, httpJson } from "@/lib/shared/http/http.service";
import { refresh } from "@/features/access/access.service";
import { analyzeImage, requestImageAnalysis } from "./aiAccessibility.service";

vi.mock("@/lib/shared/http/http.service", async (importOriginal) => ({ ...(await importOriginal<object>()), httpJson: vi.fn() }));
vi.mock("@/features/access/access.service", () => ({ refresh: vi.fn() }));

const image = new File(["image"], "panel.png", { type: "image/png" });
const approved = {
  analysis_id: "a",
  request_id: "r",
  decision: "approved",
  reason_codes: [],
  risk_categories: [],
  alt_text: "Painel solar",
  policy_version: "v4",
  model_version: "m",
};
const failure = (status: number) => new Error(`HTTP ${status}`, { cause: new HttpResponseError(status, "HTTP_ERROR") });

describe("aiAccessibility.service", () => {
  beforeEach(() => {
    vi.mocked(httpJson).mockReset();
    vi.mocked(refresh).mockReset();
  });
  afterEach(() => vi.unstubAllEnvs());

  it("posts the image as multipart with the purpose, context and a long timeout", async () => {
    vi.mocked(httpJson).mockResolvedValue(approved);

    await expect(analyzeImage(image, { purpose: "product", contextTitle: "SolTech ST-450" })).resolves.toEqual({
      status: "suggested",
      altText: "Painel solar",
    });

    const [url, options] = vi.mocked(httpJson).mock.calls[0];
    const body = options.body as FormData;
    expect(url).toContain("/v1/images/analyze");
    expect(options).toMatchObject({ method: "POST", timeoutMs: 120_000 });
    expect(options.authenticated).not.toBe(false);
    expect(body.get("image")).toBeInstanceOf(File);
    expect(body.get("purpose")).toBe("product");
    expect(body.get("context_title")).toBe("SolTech ST-450");
    expect(body.get("max_alt_chars")).toBe("150");
    expect(String(body.get("request_id"))).toMatch(/^[A-Za-z0-9._:-]{1,100}$/);
  });

  it("renews the session once after a 401", async () => {
    vi.mocked(httpJson).mockRejectedValueOnce(failure(401)).mockResolvedValueOnce(approved);
    vi.mocked(refresh).mockResolvedValue({} as never);

    await expect(requestImageAnalysis(image, { purpose: "product" })).resolves.toMatchObject({ decision: "approved" });
    expect(refresh).toHaveBeenCalledOnce();
  });

  it.each([[429], [503], [401], [500]])("never blocks the upload when the service answers HTTP %i", async (status) => {
    vi.mocked(httpJson).mockRejectedValue(failure(status));
    vi.mocked(refresh).mockResolvedValue(null);

    const verdict = await analyzeImage(image, { purpose: "product" });

    expect(verdict.status).toBe("unavailable");
  });

  it("blocks a file that the gate refuses as too large", async () => {
    vi.mocked(httpJson).mockRejectedValue(failure(413));

    await expect(analyzeImage(image, { purpose: "product" })).resolves.toEqual({ status: "blocked", reason: "invalid" });
  });

  it("answers locally in mock mode and flags names that look inappropriate", async () => {
    vi.stubEnv("DEV", true);
    vi.stubEnv("VITE_AI_MOCKS", "ALWAYS");
    vi.stubEnv("VITE_MOCKS_DELAY_SECONDS", "0");

    await expect(analyzeImage(image, { purpose: "company_profile" })).resolves.toMatchObject({ status: "suggested" });
    await expect(analyzeImage(new File(["x"], "blocked.png", { type: "image/png" }), { purpose: "product" })).resolves.toEqual({
      status: "blocked",
      reason: "inappropriate",
    });
    expect(httpJson).not.toHaveBeenCalled();
  });
});
