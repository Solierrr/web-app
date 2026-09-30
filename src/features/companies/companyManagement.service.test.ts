import { describe, expect, it, vi } from "vitest";
import {
  createPosition,
  generateAccessCode,
  grantPermission,
  linkPositionToCompany,
  listEmployees,
  redeemAccessCode,
  removeEmployee,
  revokeAccessCode,
  updateEmployeePosition,
} from "./companyManagement.service";
import { httpJson } from "@/shared/http/http.service";

vi.mock("@/shared/http/http.service", () => ({ httpJson: vi.fn() }));

describe("companyManagement.service", () => {
  it("creates a position with no default accesses", async () => {
    vi.mocked(httpJson).mockResolvedValue({ id: "position-1" });
    await createPosition("Instalador");
    expect(httpJson).toHaveBeenCalledWith(
      expect.stringContaining("/positions"),
      expect.objectContaining({ method: "POST", body: { name: "Instalador", accesses: "" } }),
    );
  });

  it("links a position to a company", async () => {
    vi.mocked(httpJson).mockResolvedValue({ id: "link-1" });
    await linkPositionToCompany("company-1", "position-1");
    expect(httpJson).toHaveBeenCalledWith(
      expect.stringContaining("/company-positions"),
      expect.objectContaining({ method: "POST", body: { companyId: "company-1", positionId: "position-1" } }),
    );
  });

  it("grants a permission to a position", async () => {
    vi.mocked(httpJson).mockResolvedValue({ id: "grant-1" });
    await grantPermission("position-1", "permission-1");
    expect(httpJson).toHaveBeenCalledWith(
      expect.stringContaining("/position-permissions"),
      expect.objectContaining({ method: "POST", body: { positionId: "position-1", permissionId: "permission-1" } }),
    );
  });

  it("lists employees for a company", async () => {
    vi.mocked(httpJson).mockResolvedValue([]);
    await listEmployees("company-1");
    expect(httpJson).toHaveBeenCalledWith(expect.stringContaining("/user-companies/company/company-1"), expect.anything());
  });

  it("updates an employee's position", async () => {
    vi.mocked(httpJson).mockResolvedValue({});
    await updateEmployeePosition("uc-1", "position-2");
    expect(httpJson).toHaveBeenCalledWith(
      expect.stringContaining("/user-companies/uc-1/position"),
      expect.objectContaining({ method: "PATCH", body: { positionId: "position-2" } }),
    );
  });

  it("removes an employee", async () => {
    vi.mocked(httpJson).mockResolvedValue(undefined);
    await removeEmployee("uc-1");
    expect(httpJson).toHaveBeenCalledWith(expect.stringContaining("/user-companies/uc-1"), expect.objectContaining({ method: "DELETE" }));
  });

  it("generates an access code", async () => {
    vi.mocked(httpJson).mockResolvedValue({ code: "ABC12345" });
    await generateAccessCode("company-1", "position-1");
    expect(httpJson).toHaveBeenCalledWith(
      expect.stringContaining("/access-codes"),
      expect.objectContaining({ method: "POST", body: { companyId: "company-1", positionId: "position-1" } }),
    );
  });

  it("revokes an access code", async () => {
    vi.mocked(httpJson).mockResolvedValue(undefined);
    await revokeAccessCode("code-1", "company-1");
    expect(httpJson).toHaveBeenCalledWith(
      expect.stringContaining("/access-codes/code-1/company/company-1"),
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("redeems an access code", async () => {
    vi.mocked(httpJson).mockResolvedValue({ companyId: "company-1", position: { id: "p1", name: "MEMBER", accesses: "" } });
    await redeemAccessCode("ABC12345");
    expect(httpJson).toHaveBeenCalledWith(
      expect.stringContaining("/access-codes/redeem"),
      expect.objectContaining({ method: "POST", body: { code: "ABC12345" } }),
    );
  });
});
