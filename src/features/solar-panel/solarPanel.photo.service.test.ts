import { afterEach, describe, expect, it, vi } from "vitest";
import { listModelPhotos, uploadModelPhoto, deleteModelPhoto } from "./solarPanel.photo.service";
import { httpJson } from "@/lib/shared/http/http.service";
vi.mock("@/lib/shared/http/http.service", () => ({ httpJson: vi.fn() }));
vi.mock("@/config/mocks/mockMode.utils", () => ({ isAlwaysMockMode: () => false }));
afterEach(() => vi.clearAllMocks());
describe("model photo storage", () => {
  it("sends actual file bytes as multipart to api-core", async () => {
    const file = new File([new Uint8Array([1, 2, 3])], "panel.png", { type: "image/png" });
    vi.mocked(httpJson).mockResolvedValue({ id: "photo-1" });
    await uploadModelPhoto("model-1", file, true);
    const [url, options] = vi.mocked(httpJson).mock.calls[0];
    expect(url).toContain("/api/model-photos");
    expect(options.method).toBe("POST");
    expect(options.body).toBeInstanceOf(FormData);
    expect((options.body as FormData).get("file")).toEqual(file);
    expect((options.body as FormData).get("modelId")).toBe("model-1");
    expect((options.body as FormData).get("primary")).toBe("true");
  });
  it("rejects unsupported or oversized files before sending", async () => {
    await expect(uploadModelPhoto("model-1", new File(["file"], "a.pdf", { type: "application/pdf" }))).rejects.toThrow();
    await expect(uploadModelPhoto("model-1", new File([new Uint8Array(8 * 1024 * 1024 + 1)], "a.png", { type: "image/png" }))).rejects.toThrow();
    expect(httpJson).not.toHaveBeenCalled();
  });
  it("lists and deletes using existing model photo endpoints", async () => {
    vi.mocked(httpJson).mockResolvedValue([]);
    await listModelPhotos("model-1");
    await deleteModelPhoto("photo-1");
    expect(httpJson).toHaveBeenCalledWith(expect.stringContaining("/api/model-photos/model/model-1"), expect.anything());
    expect(httpJson).toHaveBeenCalledWith(expect.stringContaining("/api/model-photos/photo-1"), expect.objectContaining({ method: "DELETE" }));
  });
});
