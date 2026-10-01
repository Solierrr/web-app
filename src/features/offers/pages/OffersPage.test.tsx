import { MemoryRouter } from "react-router-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import OffersPage from "./OffersPage";
import { useActiveContext } from "@/lib/shared/context/ActiveContext";
import { listApprovedSolarPanelModels } from "@/features/solar-panel/solarPanel.service";
import * as offerService from "@/features/offers/offer.service";

vi.mock("@/lib/shared/context/ActiveContext", () => ({ useActiveContext: vi.fn() }));
vi.mock("@/features/solar-panel/solarPanel.service", () => ({ listApprovedSolarPanelModels: vi.fn() }));
vi.mock("@/features/offers/offer.service", () => ({
  getMySupplier: vi.fn(),
  listCompanyOffers: vi.fn(),
  createOffer: vi.fn(),
  updateOffer: vi.fn(),
  deleteOffer: vi.fn(),
  changeOfferStatus: vi.fn(),
}));

const company = {
  id: "company-1",
  status: "APPROVED",
  type: "SUPPLIER",
  cnpj: "1",
  tradeName: "Solaria",
  corporateName: "Solaria Ltda",
  slug: "solaria",
} as never;

describe("OffersPage", () => {
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
    vi.mocked(offerService.getMySupplier).mockResolvedValue({ id: "supplier-1", companyId: "company-1" });
  });

  it("shows a hint when there are no approved models yet", async () => {
    vi.mocked(listApprovedSolarPanelModels).mockResolvedValue([]);
    vi.mocked(offerService.listCompanyOffers).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <OffersPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText(/Nenhum modelo de placa solar aprovado/)).toBeInTheDocument();
  });

  it("lists existing offers", async () => {
    vi.mocked(listApprovedSolarPanelModels).mockResolvedValue([]);
    vi.mocked(offerService.listCompanyOffers).mockResolvedValue([
      {
        id: "offer-1",
        supplierId: "supplier-1",
        model: { id: "model-1", brand: "SolarTech", model: "ST-450W" },
        slug: "placa",
        unitPrice: 899.9,
        availability: 10,
        expirationDate: null,
        discountPercentage: null,
        serviceRegions: null,
        translationStatus: "COMPLETED",
        translations: [{ locale: "pt-BR", title: "Painel SolarTech", description: "desc", details: null }],
      },
    ]);

    render(
      <MemoryRouter>
        <OffersPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Painel SolarTech")).toBeInTheDocument();
  });

  it("creates a new offer with the selected model", async () => {
    vi.mocked(listApprovedSolarPanelModels).mockResolvedValue([
      {
        id: "model-1",
        brand: "SolarTech",
        model: "ST-450W",
        type: "Monocristalino" as never,
        powerOutput: 450,
        efficiency: 20,
        dimension: { width: 1, length: 2 },
        weight: 20,
        status: "APPROVED" as never,
      },
    ]);
    vi.mocked(offerService.listCompanyOffers).mockResolvedValue([]);
    vi.mocked(offerService.createOffer).mockResolvedValue({} as never);

    render(
      <MemoryRouter>
        <OffersPage />
      </MemoryRouter>,
    );
    await screen.findByText("Nenhuma oferta cadastrada ainda.");

    fireEvent.change(screen.getByLabelText("Modelo de placa"), { target: { value: "model-1" } });
    fireEvent.change(screen.getByLabelText("Título"), { target: { value: "Painel X" } });
    fireEvent.change(screen.getByLabelText("Descrição"), { target: { value: "Descrição da oferta" } });
    fireEvent.change(screen.getByLabelText("Preço unitário (R$)"), { target: { value: "1000" } });
    fireEvent.change(screen.getByLabelText("Disponibilidade"), { target: { value: "5" } });
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar oferta" }));

    await waitFor(() =>
      expect(offerService.createOffer).toHaveBeenCalledWith(
        expect.objectContaining({
          supplierId: "supplier-1",
          modelId: "model-1",
          title: "Painel X",
          description: "Descrição da oferta",
          unitPrice: 1000,
          availability: 5,
        }),
      ),
    );
  });

  it("pauses an active offer by sending zero availability", async () => {
    const offer = {
      id: "offer-1",
      supplierId: "supplier-1",
      model: { id: "model-1", brand: "SolarTech", model: "ST-450W" },
      slug: "placa",
      unitPrice: 899.9,
      availability: 10,
      expirationDate: null,
      discountPercentage: null,
      serviceRegions: null,
      translationStatus: "COMPLETED",
      translations: [{ locale: "pt-BR", title: "Painel SolarTech", description: "desc", details: null }],
    };
    vi.mocked(listApprovedSolarPanelModels).mockResolvedValue([]);
    vi.mocked(offerService.listCompanyOffers).mockResolvedValue([offer]);
    vi.mocked(offerService.changeOfferStatus).mockResolvedValue(offer);

    render(
      <MemoryRouter>
        <OffersPage />
      </MemoryRouter>,
    );
    await screen.findByText(/Ativa/);

    fireEvent.click(screen.getByRole("button", { name: "Pausar" }));

    await waitFor(() => expect(offerService.changeOfferStatus).toHaveBeenCalledWith(offer, "PAUSED"));
  });

  const baseOffer = {
    id: "offer-1",
    supplierId: "supplier-1",
    model: { id: "model-1", brand: "SolarTech", model: "ST-450W" },
    slug: "placa",
    unitPrice: 899.9,
    availability: 10,
    expirationDate: null,
    discountPercentage: null,
    serviceRegions: null,
    translationStatus: "COMPLETED",
    translations: [{ locale: "pt-BR", title: "Painel SolarTech", description: "desc", details: null }],
  };

  it("offers to resume a paused offer and to close it", async () => {
    vi.mocked(listApprovedSolarPanelModels).mockResolvedValue([]);
    vi.mocked(offerService.listCompanyOffers).mockResolvedValue([{ ...baseOffer, availability: 0 }]);
    vi.mocked(offerService.changeOfferStatus).mockResolvedValue(baseOffer);

    render(
      <MemoryRouter>
        <OffersPage />
      </MemoryRouter>,
    );
    await screen.findByText(/Pausada/);

    fireEvent.click(screen.getByRole("button", { name: "Reativar" }));
    await waitFor(() => expect(offerService.changeOfferStatus).toHaveBeenCalledWith({ ...baseOffer, availability: 0 }, "ACTIVE"));

    fireEvent.click(await screen.findByRole("button", { name: "Encerrar" }));
    await waitFor(() => expect(offerService.changeOfferStatus).toHaveBeenLastCalledWith({ ...baseOffer, availability: 0 }, "CLOSED"));
  });

  it("offers to reopen a closed offer and hides the pause action", async () => {
    const closed = { ...baseOffer, expirationDate: "2020-01-01T00:00:00Z" };
    vi.mocked(listApprovedSolarPanelModels).mockResolvedValue([]);
    vi.mocked(offerService.listCompanyOffers).mockResolvedValue([closed]);
    vi.mocked(offerService.changeOfferStatus).mockResolvedValue(baseOffer);

    render(
      <MemoryRouter>
        <OffersPage />
      </MemoryRouter>,
    );
    await screen.findByText(/Encerrada/);

    expect(screen.queryByRole("button", { name: "Pausar" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reabrir" }));

    await waitFor(() => expect(offerService.changeOfferStatus).toHaveBeenCalledWith(closed, "ACTIVE"));
  });

  it("blocks a second status change while the first one is running", async () => {
    vi.mocked(listApprovedSolarPanelModels).mockResolvedValue([]);
    vi.mocked(offerService.listCompanyOffers).mockResolvedValue([baseOffer]);
    let finish!: () => void;
    vi.mocked(offerService.changeOfferStatus).mockReturnValue(
      new Promise((resolve) => {
        finish = () => resolve(baseOffer);
      }),
    );

    render(
      <MemoryRouter>
        <OffersPage />
      </MemoryRouter>,
    );
    await screen.findByText(/Ativa/);

    fireEvent.click(screen.getByRole("button", { name: "Pausar" }));

    expect(await screen.findByRole("button", { name: "Pausar" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Encerrar" })).toBeDisabled();
    finish();
    await waitFor(() => expect(screen.getByRole("button", { name: "Pausar" })).not.toBeDisabled());
  });

  it("shows an error when the status change fails", async () => {
    vi.mocked(listApprovedSolarPanelModels).mockResolvedValue([]);
    vi.mocked(offerService.listCompanyOffers).mockResolvedValue([baseOffer]);
    vi.mocked(offerService.changeOfferStatus).mockRejectedValue(new Error("400"));

    render(
      <MemoryRouter>
        <OffersPage />
      </MemoryRouter>,
    );
    await screen.findByText(/Ativa/);

    fireEvent.click(screen.getByRole("button", { name: "Pausar" }));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
});
