import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import i18n from "@/config/i18n/internationalization";
import BrandSelect from "./BrandSelect";
vi.mock("../brand.service", () => ({ listBrands: vi.fn().mockResolvedValue([]) }));
vi.mock("../manager/BrandManager", () => ({ default: ({ onClose }: { onClose: () => void }) => <button onClick={onClose}>Cancelar edição</button> }));
it("opens a centered dialog and closes it without submitting the outer form", async () => {
  const submit = vi.fn((e: React.FormEvent) => e.preventDefault());
  render(
    <form onSubmit={submit}>
      <BrandSelect presentation="dialog" label="Marca" value="" onChange={vi.fn()} />
    </form>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Gerenciar marcas" }));
  const dialog = screen.getByRole("dialog", { name: "Gerenciar marcas" });
  expect(dialog.tagName).toBe("DIALOG");
  expect(within(dialog).getByRole("heading", { name: "Gerenciar marcas" })).toBeInTheDocument();
  fireEvent.click(within(dialog).getByRole("button", { name: i18n.t("actions.close", { ns: "commons" }) }));
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  expect(submit).not.toHaveBeenCalled();
});
