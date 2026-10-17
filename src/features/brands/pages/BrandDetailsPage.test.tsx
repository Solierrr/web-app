import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { beforeEach, expect, it, vi } from "vitest";
import BrandDetailsPage from "./BrandDetailsPage";
import { listBrands } from "../brand.service";
import type { Brand } from "../brand";
vi.mock("@@/layout/access/canvas/SideCanvas", () => ({ default: () => null }));
vi.mock("@/lib/shared/context/ActiveContext", () => ({ useActiveContext: () => ({ company: { id: "company-1" }, can: () => true }) }));
vi.mock("../brand.service", () => ({ listBrands: vi.fn() }));
vi.mock("../manager/BrandManager", () => ({ default: ({ initialBrandId }: { initialBrandId: string }) => <div>Editing {initialBrandId}</div> }));
const brand: Brand = {
  id: "brand-1",
  name: "Solar",
  ownerCompanyId: "company-1",
  visibility: "PRIVATE",
  archived: false,
  legacy: false,
  revision: 0,
};
beforeEach(() => vi.mocked(listBrands).mockResolvedValue([brand]));
function page(query = "") {
  render(
    <MemoryRouter initialEntries={[`/pt-BR/marcas/brand-1${query}`]}>
      <Routes>
        <Route path="/:lang/marcas/:brandId" element={<BrandDetailsPage />} />
      </Routes>
    </MemoryRouter>,
  );
}
it("shows private brand information and a route to the existing edit form", async () => {
  page();
  await screen.findByRole("heading", { name: "Solar" });
  expect(screen.getByRole("link", { name: "Editar marca" })).toHaveAttribute("href", "/pt-BR/marcas/brand-1?edit=true");
});
it("preselects the current brand when following the edit URL", async () => {
  page("?edit=true");
  expect(await screen.findByText("Editing brand-1")).toBeInTheDocument();
});
it("offers a correction request for public brands", async () => {
  vi.mocked(listBrands).mockResolvedValue([{ ...brand, visibility: "PUBLIC", ownerCompanyId: null }]);
  page();
  expect(await screen.findByRole("link", { name: "Solicitar correção" })).toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "Editar marca" })).not.toBeInTheDocument();
});
it("blocks editing during pending review even with an edit URL", async () => {
  vi.mocked(listBrands).mockResolvedValue([{ ...brand, pending: true }]);
  page("?edit=true");
  await screen.findByRole("heading", { name: "Solar" });
  expect(screen.queryByText("Editing brand-1")).not.toBeInTheDocument();
  expect(screen.getByText(/Dados bloqueados/)).toBeInTheDocument();
});
it("does not offer editing for another company’s private record", async () => {
  vi.mocked(listBrands).mockResolvedValue([{ ...brand, ownerCompanyId: "other" }]);
  page();
  await screen.findByRole("heading", { name: "Solar" });
  expect(screen.queryByRole("link", { name: "Editar marca" })).not.toBeInTheDocument();
});
