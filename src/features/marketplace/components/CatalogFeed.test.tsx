import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import CatalogFeed from "./CatalogFeed";
import { panelOffer, infrastructureOffer } from "./CatalogFeed.stories.fixtures";
import { DEFAULT } from "@/config/i18n/browser/languages";
function view(kind: "PANEL" | "INFRASTRUCTURE", load = async () => [panelOffer, infrastructureOffer]) {
  return render(
    <MemoryRouter>
      <CatalogFeed kind={kind} lang={DEFAULT} load={load} />
    </MemoryRouter>,
  );
}
describe("CatalogFeed", () => {
  it("keeps twelve unique offers per page across spotlight, grid and rail", async () => {
    const offers = Array.from({ length: 13 }, (_, i) => ({ ...panelOffer, id: `offer-${i}`, slug: `offer-${i}`, title: `Oferta ${i + 1}` }));
    view("PANEL", async () => offers);
    await screen.findByRole("heading", { name: "Oferta 1" });
    expect(screen.getAllByRole("link", { name: /Oferta \d/ })).toHaveLength(12);
    expect(screen.queryByText("Oferta 13")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Próxima página" }));
    expect(screen.getByRole("link", { name: /Oferta 13/ })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Oferta 1" })).not.toBeInTheDocument();
  });
  it("separates infrastructure from panels and links to its own detail route", async () => {
    view("INFRASTRUCTURE");
    const link = await screen.findByRole("link", { name: /Trilho de alumínio/ });
    expect(link).toHaveAttribute("href", "/pt-BR/infraestrutura/aurora/trilho-aluminio");
    expect(screen.queryByRole("link", { name: /Painel solar 450/ })).not.toBeInTheDocument();
    expect(screen.queryByText("450 W")).not.toBeInTheDocument();
  });
  it("searches suppliers and gives feedback when there are no results", async () => {
    view("PANEL");
    await screen.findByRole("link", { name: /Painel solar 450/ });
    fireEvent.change(screen.getByRole("textbox", { name: "Buscar oferta, marca ou fornecedor" }), { target: { value: "não existe" } });
    expect(screen.getByText("Nenhuma oferta corresponde à sua busca.")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox", { name: "Buscar oferta, marca ou fornecedor" }), { target: { value: "Aurora" } });
    expect(screen.getByRole("link", { name: /Painel solar 450/ })).toBeInTheDocument();
  });
  it("retries a failed request without a page reload", async () => {
    const load = vi.fn().mockRejectedValueOnce(new Error("Offline")).mockResolvedValueOnce([panelOffer]);
    view("PANEL", load);
    await screen.findByRole("alert");
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(await screen.findByRole("link", { name: /Painel solar 450/ })).toBeInTheDocument();
    expect(load).toHaveBeenCalledTimes(2);
  });
  it("clears the selected infrastructure type in both results and the control", async () => {
    const kit = {
      ...infrastructureOffer,
      id: "kit",
      title: "Kit de instalação",
      slug: "kit",
      photos: { ...infrastructureOffer.photos, heroImage: { ...infrastructureOffer.photos.heroImage, description: "Kit de instalação" } },
      panel: { ...infrastructureOffer.panel, infrastructureType: "KIT" as const },
    };
    view("INFRASTRUCTURE", async () => [infrastructureOffer, kit]);
    await screen.findByRole("link", { name: /Kit de instalação/ });
    fireEvent.click(screen.getByRole("button", { name: "Filtros" }));
    fireEvent.click(screen.getByRole("button", { name: "Tipo de infraestrutura" }));
    fireEvent.click(screen.getByRole("option", { name: "Kits" }));
    expect(screen.queryByRole("link", { name: /Trilho de alumínio/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Limpar filtros" }));
    expect(screen.getByRole("link", { name: /Trilho de alumínio/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tipo de infraestrutura" })).toHaveTextContent("Todos os tipos");
  });
});
