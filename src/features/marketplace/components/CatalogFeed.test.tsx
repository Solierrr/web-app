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
  it("renders offer shelves without feed search or pagination", async () => {
    const offers = Array.from({ length: 12 }, (_, i) => ({ ...panelOffer, id: `offer-${i}`, slug: `offer-${i}`, title: `Oferta ${i + 1}` }));
    view("PANEL", async () => offers);
    expect((await screen.findAllByRole("link", { name: "Oferta 12" }))[0]).toHaveAttribute("href", "/pt-BR/placa-solar/aurora/offer-11");
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Próxima página" })).not.toBeInTheDocument();
  });
  it("separates infrastructure from panels and links to its own detail route", async () => {
    view("INFRASTRUCTURE", async () => Array.from({ length: 3 }, (_, i) => ({ ...infrastructureOffer, id: `infra-${i}` })));
    const link = (await screen.findAllByRole("link", { name: /Trilho de alumínio/ }))[0];
    expect(link).toHaveAttribute("href", "/pt-BR/infraestrutura/aurora/trilho-aluminio");
    expect(screen.queryByRole("link", { name: /Painel solar 450/ })).not.toBeInTheDocument();
    expect(screen.queryByText("450 W")).not.toBeInTheDocument();
  });
  it("retries a failed request without a page reload", async () => {
    const load = vi
      .fn()
      .mockRejectedValueOnce(new Error("Offline"))
      .mockResolvedValueOnce(Array.from({ length: 3 }, (_, i) => ({ ...panelOffer, id: `offer-${i}` })));
    view("PANEL", load);
    await screen.findByRole("alert");
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect((await screen.findAllByRole("link", { name: /Painel solar 450/ }))[0]).toBeInTheDocument();
    expect(load).toHaveBeenCalledTimes(2);
  });
});
