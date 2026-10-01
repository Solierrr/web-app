import { describe, expect, it, vi } from "vitest";
import { validateCertificates, validateCnpjCategory } from "./aiValidation.service";
import { httpJson } from "@/lib/shared/http/http.service";

vi.mock("@/lib/shared/http/http.service", () => ({ httpJson: vi.fn() }));

describe("aiValidation.service", () => {
  it("sends the cnpj without authentication", async () => {
    vi.mocked(httpJson).mockResolvedValue({ status: "VALID" });

    await validateCnpjCategory("12345678000190");

    expect(httpJson).toHaveBeenCalledWith(
      expect.stringContaining("/companies/validate-cnpj"),
      expect.objectContaining({ method: "POST", body: { cnpj: "12345678000190" }, authenticated: false }),
    );
  });

  it("sends both certificate urls without authentication", async () => {
    vi.mocked(httpJson).mockResolvedValue({ status: "ACCEPT" });

    await validateCertificates("https://example.com/nr10.jpg", "https://example.com/nr35.jpg");

    expect(httpJson).toHaveBeenCalledWith(
      expect.stringContaining("/certificates/validate"),
      expect.objectContaining({
        method: "POST",
        body: { cert_nr10_url: "https://example.com/nr10.jpg", cert_nr35_url: "https://example.com/nr35.jpg" },
        authenticated: false,
      }),
    );
  });
});
