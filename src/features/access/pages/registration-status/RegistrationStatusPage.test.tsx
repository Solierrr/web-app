import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import RegistrationStatusPage from "./RegistrationStatusPage";
import { getMyCompany } from "@/features/companies/company.service";

vi.mock("@/features/companies/company.service", () => ({ getMyCompany: vi.fn() }));

describe("RegistrationStatusPage", () => {
  it("shows the manual review stage as the current step", async () => {
    vi.mocked(getMyCompany).mockResolvedValue({ id: "c1", status: "UNDER_ANALYSIS" } as never);

    render(<RegistrationStatusPage />);

    expect(await screen.findByText(/está em análise manual/)).toBeInTheDocument();
    expect(screen.getByText("Análise manual")).toHaveAttribute("aria-current", "step");
  });

  it("shows the result step once the registration is approved", async () => {
    vi.mocked(getMyCompany).mockResolvedValue({ id: "c1", status: "APPROVED" } as never);

    render(<RegistrationStatusPage />);

    expect(await screen.findByText(/Cadastro aprovado/)).toBeInTheDocument();
    expect(screen.getByText("Resultado")).toHaveAttribute("aria-current", "step");
  });

  it("explains rejection and tells when there is no registration", async () => {
    vi.mocked(getMyCompany).mockResolvedValueOnce({ id: "c1", status: "REJECTED" } as never);
    const { unmount } = render(<RegistrationStatusPage />);
    expect(await screen.findByText(/Cadastro reprovado/)).toBeInTheDocument();
    unmount();

    vi.mocked(getMyCompany).mockResolvedValueOnce(null);
    render(<RegistrationStatusPage />);
    expect(await screen.findByText("Você ainda não tem um cadastro de empresa.")).toBeInTheDocument();
  });

  it("reports a load failure", async () => {
    vi.mocked(getMyCompany).mockRejectedValue(new Error("offline"));

    render(<RegistrationStatusPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível carregar o status do cadastro.");
  });
});
