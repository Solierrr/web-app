import { MemoryRouter } from "react-router-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import UnitsPage from "./UnitsPage";
import { useActiveContext } from "@/lib/shared/context/ActiveContext";
import * as unitService from "@/features/units/unit.service";

vi.mock("@/lib/shared/context/ActiveContext", () => ({ useActiveContext: vi.fn() }));
vi.mock("@/features/units/unit.service", () => ({
  getMyRequester: vi.fn(),
  listCompanyUnits: vi.fn(),
  createAddress: vi.fn(),
  createGeolocalization: vi.fn(),
  createUnit: vi.fn(),
  updateUnit: vi.fn(),
  deleteUnit: vi.fn(),
}));

const company = {
  id: "company-1",
  status: "APPROVED",
  type: "DEMANDANT",
  cnpj: "1",
  tradeName: "Solaria",
  corporateName: "Solaria Ltda",
  slug: "solaria",
} as never;

describe("UnitsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useActiveContext).mockReturnValue({
      loading: false,
      kind: "company",
      setKind: vi.fn(),
      company,
      isAdmin: true,
      hasCompany: true,
      isPlatformAdmin: false,
      can: () => true,
    });
    vi.mocked(unitService.getMyRequester).mockResolvedValue({ id: "requester-1", companyId: "company-1" });
  });

  it("shows a fallback lat/lng input when no maps key is configured", async () => {
    vi.mocked(unitService.listCompanyUnits).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <UnitsPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText(/Mapa interativo indisponível/)).toBeInTheDocument();
  });

  it("lists existing units", async () => {
    vi.mocked(unitService.listCompanyUnits).mockResolvedValue([
      {
        id: "unit-1",
        requesterId: "requester-1",
        address: { id: "address-1", state: "SP", city: "Campinas", neighborhood: null, zipCode: "13010000", street: "Rua das Flores", number: "250" },
        complement: null,
        locationType: "HOUSE",
      },
    ]);

    render(
      <MemoryRouter>
        <UnitsPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Rua das Flores, 250")).toBeInTheDocument();
  });

  it("creates a unit by first creating the address", async () => {
    vi.mocked(unitService.listCompanyUnits).mockResolvedValue([]);
    vi.mocked(unitService.createAddress).mockResolvedValue({ id: "address-1" });
    vi.mocked(unitService.createUnit).mockResolvedValue({} as never);

    render(
      <MemoryRouter>
        <UnitsPage />
      </MemoryRouter>,
    );
    await screen.findByText("Nenhuma unidade cadastrada ainda.");

    fireEvent.change(screen.getByLabelText("CEP"), { target: { value: "13010000" } });
    fireEvent.change(screen.getByLabelText("UF"), { target: { value: "SP" } });
    fireEvent.change(screen.getByLabelText("Cidade"), { target: { value: "Campinas" } });
    fireEvent.change(screen.getByLabelText("Rua"), { target: { value: "Rua das Flores" } });
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar unidade" }));

    await waitFor(() => expect(unitService.createAddress).toHaveBeenCalledWith(expect.objectContaining({ city: "Campinas", state: "SP" })));
    expect(unitService.createUnit).toHaveBeenCalledWith(expect.objectContaining({ requesterId: "requester-1", addressId: "address-1" }));
  });
});
