import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import OperationalTable from "./OperationalTable";

const columns = [{ key: "name", label: "Nome", render: (item: string) => item }];
const items = Array.from({ length: 11 }, (_, index) => `Item ${index + 1}`);
const table = (data: string[] | null) => (
  <MemoryRouter>
    <OperationalTable label="Itens" items={data} columns={columns} getKey={(item) => item} empty="Sem itens" />
  </MemoryRouter>
);

describe("OperationalTable", () => {
  it("paginates by five and clamps the page after deletion", () => {
    const { rerender } = render(table(items));
    expect(screen.getByText("Item 5")).toBeInTheDocument();
    expect(screen.queryByText("Item 6")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Última página" }));
    expect(screen.getByText("Item 11")).toBeInTheDocument();
    rerender(table(items.slice(0, 5)));
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Próxima página" })).toBeDisabled();
  });

  it("keeps headers visible while loading and renders the empty state", () => {
    const { rerender } = render(table(null));
    expect(screen.getByText("Nome")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Nome" })).toBeDisabled();
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    rerender(table([]));
    expect(screen.getByText("Nome")).toBeInTheDocument();
    expect(screen.getByText("Sem itens")).toBeInTheDocument();
  });
  it("sorts numeric values in both directions and restores original order", () => {
    render(
      <MemoryRouter>
        <OperationalTable
          label="Potencias"
          items={[450, 90, 600]}
          columns={[{ key: "power", label: "Potencia", render: (value) => value, value: (value) => value }]}
          getKey={String}
          empty="Vazio"
        />
      </MemoryRouter>,
    );
    const values = () =>
      within(screen.getByRole("table"))
        .getAllByRole("row")
        .slice(1)
        .map((row) => within(row).getAllByRole("cell")[0].textContent);
    fireEvent.click(screen.getByRole("button", { name: "Potencia" }));
    expect(values()).toEqual(["90", "450", "600"]);
    fireEvent.click(screen.getByRole("button", { name: "Potencia" }));
    expect(values()).toEqual(["600", "450", "90"]);
    fireEvent.click(screen.getByRole("button", { name: "Potencia" }));
    expect(values()).toEqual(["450", "90", "600"]);
  });
  it("combines search and categorical filters and clears only the filter", () => {
    render(
      <MemoryRouter>
        <OperationalTable
          label="Itens"
          items={[
            { name: "Solar", status: "Aprovada" },
            { name: "Solar Nova", status: "Recusada" },
            { name: "Outra", status: "Aprovada" },
          ]}
          columns={[
            { key: "name", label: "Nome", render: (item) => item.name },
            { key: "status", label: "Status", filterable: true, render: (item) => item.status },
          ]}
          getKey={(item) => item.name}
          empty="Vazio"
        />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByRole("textbox", { name: "Buscar na tabela" }), { target: { value: "solar" } });
    expect(screen.queryByText("Outra")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Filtros" }));
    fireEvent.click(within(screen.getByRole("dialog", { name: "Filtros" })).getByRole("button", { name: "Status" }));
    fireEvent.click(screen.getByRole("option", { name: "Aprovada" }));
    fireEvent.click(screen.getByRole("button", { name: "Fechar" }));
    expect(screen.queryByText("Solar Nova")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Limpar filtros" }));
    expect(screen.getByText("Solar Nova")).toBeInTheDocument();
    expect(screen.queryByText("Outra")).not.toBeInTheDocument();
  });
});

it("exposes the entire ordered collection independently of text search and pagination", () => {
  const change = vi.fn();
  render(
    <MemoryRouter>
      <OperationalTable label="Queue" items={items} columns={columns} getKey={(item) => item} empty="Empty" onOrderedItemsChange={change} />
    </MemoryRouter>,
  );
  expect(change).toHaveBeenLastCalledWith(items, null);
  fireEvent.change(screen.getByRole("textbox", { name: "Buscar na tabela" }), { target: { value: "Item 2" } });
  expect(screen.queryByText("Item 1")).not.toBeInTheDocument();
  expect(change).toHaveBeenLastCalledWith(items, null);
  fireEvent.click(screen.getByRole("button", { name: "Nome" }));
  expect(change).toHaveBeenLastCalledWith(items, { key: "name", direction: "asc" });
});
