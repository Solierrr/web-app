import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import CompanyProfileProjects from "./CompanyProfileProjects";
import { projectApi } from "@/features/projects/projects.service";
vi.mock("@/features/projects/projects.service", () => ({ projectApi: { list: vi.fn() } }));
vi.mock("@/features/projects/components/ProjectGrid", () => ({
  default: ({ projects }: { projects: { id: string; name: string }[] | null }) => (
    <div>
      {projects?.map((p) => (
        <p key={p.id}>{p.name}</p>
      ))}
    </div>
  ),
}));
describe("CompanyProfileProjects", () => {
  beforeEach(() => vi.clearAllMocks());
  it("requests accessible projects for this company and excludes records from other owners", async () => {
    vi.mocked(projectApi.list).mockResolvedValue([
      { id: "a", name: "Projeto Aurora", ownerCompanyId: "company-1" },
      { id: "b", name: "Outro projeto", ownerCompanyId: "company-2" },
    ] as Awaited<ReturnType<typeof projectApi.list>>);
    render(<CompanyProfileProjects companyId="company-1" />);
    expect(await screen.findByText("Projeto Aurora")).toBeInTheDocument();
    expect(projectApi.list).toHaveBeenCalledWith("company-1");
    expect(screen.queryByText("Outro projeto")).not.toBeInTheDocument();
  });
  it("shows an error and retry action instead of leaving a permanent loading state", async () => {
    vi.mocked(projectApi.list).mockRejectedValue(new Error("Falha ao carregar"));
    render(<CompanyProfileProjects companyId="company-1" />);
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tentar novamente" })).toBeInTheDocument();
  });
});
