import { fireEvent, render, screen } from "@testing-library/react";
import { Link, MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import OfferPage from "./OfferPage";
import { useActiveContext } from "@/lib/shared/context/ActiveContext";
import { listCompanyOffers } from "../offer.service";

vi.mock("@@/layout/access/canvas/SideCanvas", () => ({ default: () => null }));
vi.mock("@/lib/shared/context/ActiveContext", () => ({ useActiveContext: vi.fn() }));
vi.mock("../offer.service", () => ({ listCompanyOffers: vi.fn() }));

const offer = {
  id: "first",
  model: { brand: "Marca", model: "Modelo" },
  unitPrice: 100,
  availability: 2,
  translations: [{ locale: "pt-BR", title: "Oferta inicial", description: "Descrição" }],
} as never;
function page() {
  return (
    <MemoryRouter initialEntries={["/pt-BR/admin/ofertas/first"]}>
      <Link to="/pt-BR/admin/ofertas/second">Outra oferta</Link>
      <Routes>
        <Route path="/:lang/admin/ofertas/:offerId" element={<OfferPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("OfferPage", () => {
  beforeEach(() => {
    vi.mocked(useActiveContext).mockReturnValue({ company: { id: "company" }, can: () => true } as never);
  });

  it("hides stale details while navigating to another offer", async () => {
    vi.mocked(listCompanyOffers)
      .mockResolvedValueOnce([offer])
      .mockReturnValueOnce(new Promise(() => {}));
    render(page());
    expect(await screen.findByRole("heading", { name: "Oferta inicial" })).toBeInTheDocument();
    expect(screen.getByText("Marca Modelo")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("link", { name: "Outra oferta" }));
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    expect(screen.queryByText("Marca Modelo")).not.toBeInTheDocument();
  });

  it("shows an error and retains the return action if the offer is missing", async () => {
    vi.mocked(listCompanyOffers).mockResolvedValueOnce([]);
    render(page());
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Voltar à lista" })).toHaveAttribute("href", "/pt-BR/admin/ofertas");
  });
});
