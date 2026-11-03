import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ContextMenuProvider } from "./provider/ContextMenuProvider";
import { useGeneralContextMenu } from "./useGeneralContextMenu";

function Page() {
  const handleContextMenu = useGeneralContextMenu("/inicio");
  return (
    <div onContextMenu={handleContextMenu}>
      <a href="/destino">Link da página</a>
      <input aria-label="Campo" />
      <p>Texto</p>
    </div>
  );
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/pt-BR/tela"]}>
      <ContextMenuProvider>
        <Routes>
          <Route path="/pt-BR/tela" element={<Page />} />
          <Route path="/inicio" element={<p>Início</p>} />
        </Routes>
      </ContextMenuProvider>
    </MemoryRouter>,
  );
}

describe("useGeneralContextMenu", () => {
  it("offers the navigation and page actions anywhere on the page", () => {
    renderPage();

    fireEvent.contextMenu(screen.getByText("Texto"));

    expect(screen.getAllByRole("menuitem").map((item) => item.textContent)).toEqual([
      "voltar",
      "avançar",
      "recarregar",
      "copiar link da página",
      "ir para o início",
    ]);
  });

  it("adds the link address action when the target is a link", () => {
    renderPage();

    fireEvent.contextMenu(screen.getByRole("link", { name: "Link da página" }));

    expect(screen.getByRole("menuitem", { name: "copiar endereço do link" })).toBeInTheDocument();
  });

  it("copies the page link and goes to the home route", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    renderPage();

    fireEvent.contextMenu(screen.getByText("Texto"));
    fireEvent.click(screen.getByRole("menuitem", { name: "copiar link da página" }));
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining("/pt-BR/tela"));

    fireEvent.contextMenu(screen.getByText("Texto"));
    fireEvent.click(screen.getByRole("menuitem", { name: "ir para o início" }));
    expect(await screen.findByText("Início")).toBeInTheDocument();
  });

  it("keeps the native menu on text fields", () => {
    renderPage();

    const prevented = !fireEvent.contextMenu(screen.getByRole("textbox", { name: "Campo" }));

    expect(prevented).toBe(false);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
