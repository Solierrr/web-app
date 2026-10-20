import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import BrandManager from "./BrandManager";
import { createBrand, submitBrand } from "../brand.service";
import type { Brand } from "../brand";
vi.mock("../brand.service", () => ({
  createBrand: vi.fn(),
  submitBrand: vi.fn(),
  updateBrand: vi.fn(),
  archiveBrand: vi.fn(),
  uploadBrandLogo: vi.fn(),
}));
vi.mock("@/lib/shared/context/ActiveContext", () => ({ useActiveContext: () => ({ can: () => true }) }));
vi.mock("@@/feedback/toast/Toast.utils", () => ({ notify: vi.fn() }));
const brand: Brand = {
  id: "brand-1",
  ownerCompanyId: "company-1",
  name: "Solar",
  visibility: "PRIVATE",
  archived: false,
  legacy: false,
  revision: 0,
};
beforeEach(() => vi.clearAllMocks());
describe("BrandManager", () => {
  it("prefills the existing brand form when opened from details", () => {
    render(<BrandManager brands={[brand]} initialBrandId={brand.id} onSaved={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByRole("textbox", { name: "Nome da marca" })).toHaveValue("Solar");
    expect(screen.queryByRole("button", { name: "Marca cadastrada" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Salvar marca" })).toBeInTheDocument();
  });
  it("shows required-field feedback and focuses the name without submitting", () => {
    render(<BrandManager brands={[]} onSaved={vi.fn()} onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Salvar marca" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Preencha");
    expect(screen.getByRole("textbox", { name: "Nome da marca" })).toHaveFocus();
    expect(createBrand).not.toHaveBeenCalled();
  });
  it("creates a private record before requesting public approval", async () => {
    vi.mocked(createBrand).mockResolvedValue(brand);
    vi.mocked(submitBrand).mockResolvedValue({} as never);
    const saved = vi.fn().mockResolvedValue(undefined);
    render(<BrandManager brands={[]} onSaved={saved} onClose={vi.fn()} />);
    fireEvent.change(screen.getByRole("textbox", { name: "Nome da marca" }), { target: { value: "Solar" } });
    fireEvent.click(screen.getByRole("button", { name: "Privacidade" }));
    fireEvent.click(screen.getByRole("option", { name: "Pública" }));
    fireEvent.click(screen.getByRole("button", { name: "Solicitar publicação" }));
    await waitFor(() => expect(submitBrand).toHaveBeenCalledWith(brand.id, { name: "Solar", referenceUrl: null, logoUrl: null }));
    expect(createBrand).toHaveBeenCalledOnce();
  });
});

it("delegates the dialog title and close control to the shared shell", () => {
  const close = vi.fn();
  render(<BrandManager presentation="dialog" brands={[]} onSaved={vi.fn()} onClose={close} />);
  expect(screen.queryByRole("heading", { name: "Gerenciar marcas" })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Fechar" })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
  expect(close).toHaveBeenCalledOnce();
});

it("blocks dialog actions while saving and reports the busy state", async () => {
  let finish!: (value: Brand) => void;
  vi.mocked(createBrand).mockReturnValueOnce(
    new Promise<Brand>((resolve) => {
      finish = resolve;
    }),
  );
  const busy = vi.fn();
  render(<BrandManager presentation="dialog" brands={[]} onSaved={vi.fn().mockResolvedValue(undefined)} onClose={vi.fn()} onBusyChange={busy} />);
  fireEvent.change(screen.getByRole("textbox", { name: "Nome da marca" }), { target: { value: "Solar" } });
  fireEvent.click(screen.getByRole("button", { name: "Salvar marca" }));
  await waitFor(() => expect(busy).toHaveBeenLastCalledWith(true));
  expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
  expect(screen.getByRole("textbox", { name: "Nome da marca" })).toBeDisabled();
  finish(brand);
  await waitFor(() => expect(busy).toHaveBeenLastCalledWith(false));
});
