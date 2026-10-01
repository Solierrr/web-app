import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import UnitPage from "./UnitPage";
import { useActiveContext } from "@/lib/shared/context/ActiveContext";
import { listCompanyUnits } from "../unit.service";

vi.mock("@/lib/shared/context/ActiveContext", () => ({ useActiveContext: vi.fn() }));
vi.mock("../unit.service", () => ({ listCompanyUnits: vi.fn() }));

const unit = {
  id: "unit-1", requesterId: "r1", complement: "Bloco B", locationType: "HOUSE" as const,
  address: { id: "a1", state: "SP", city: "Campinas", neighborhood: null, zipCode: "13010000", street: "Rua das Flores", number: "250" },
};

describe("UnitPage", () => {
  beforeEach(() => {
    vi.mocked(useActiveContext).mockReturnValue({ loading: false, kind: "company", setKind: vi.fn(), company: { id: "c1" } as never, isAdmin: true, hasCompany: true, isPlatformAdmin: false });
  });

  it("shows the unit address and links to it on Google Maps", async () => {
    vi.mocked(listCompanyUnits).mockResolvedValue([unit]);

    render(
      <MemoryRouter initialEntries={["/pt-BR/admin/unidades/unit-1"]}>
        <Routes>
          <Route path="/pt-BR/admin/unidades/:unitId" element={<UnitPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText("Rua das Flores, 250")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: "Ver no Google Maps" });
    expect(link.getAttribute("href")).toContain("google.com/maps/search/?api=1&query=Rua%20das%20Flores%20250");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("shows an error when the unit does not exist", async () => {
    vi.mocked(listCompanyUnits).mockResolvedValue([]);

    render(
      <MemoryRouter initialEntries={["/pt-BR/admin/unidades/missing"]}>
        <Routes>
          <Route path="/pt-BR/admin/unidades/:unitId" element={<UnitPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
});
