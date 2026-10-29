import Toast from "@@/feedback/toast/Toast";
import { beforeEach as beforeToastTest } from "vitest";
beforeToastTest(() => {
  render(<Toast />);
});
vi.mock("@/lib/shared/accessibility/aiAccessibility.service", () => ({
  analyzeImage: vi.fn().mockResolvedValue({ status: "suggested", altText: "Painel solar sobre telhado" }),
}));
vi.mock("@/features/brands/brand.service", () => ({
  listBrands: vi.fn().mockResolvedValue(
    ["SolTech", "PreviewBrand", "Nova marca", "Brand"].map((name) => ({
      id: `brand-${name}`,
      name,
      visibility: "PUBLIC",
      archived: false,
      legacy: false,
    })),
  ),
}));
import { notify } from "@@/feedback/toast/Toast.utils";
vi.mock("@@/feedback/toast/Toast.utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@@/feedback/toast/Toast.utils")>();
  return { ...actual, notify: vi.fn(actual.notify) };
});
import { listModelPhotos, uploadModelPhoto, type ModelPhoto } from "@/features/solar-panel/solarPanel.photo.service";
vi.mock("@/features/solar-panel/solarPanel.photo.service", () => ({
  listModelPhotos: vi.fn().mockResolvedValue([]),
  uploadModelPhoto: vi.fn(),
  deleteModelPhoto: vi.fn(),
}));
import { MemoryRouter } from "react-router-dom";
import { HttpResponseError } from "@/lib/shared/http/http.service";
import { act, fireEvent, render, screen, within, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import SolarPanelModelCrud from "./SolarPanelModelCrud";
import { useActiveContext } from "@/lib/shared/context/ActiveContext";

vi.mock("@/lib/shared/context/ActiveContext", () => ({ useActiveContext: vi.fn() }));

vi.mock("@/features/solar-panel/solarPanel.service", () => ({
  listSolarPanelModels: vi.fn(),
  createSolarPanel: vi.fn(),
  updateSolarPanel: vi.fn(),
  deleteSolarPanel: vi.fn(),
}));

import { createSolarPanel, deleteSolarPanel, listSolarPanelModels, updateSolarPanel } from "@/features/solar-panel/solarPanel.service";
import { SolarPanelType, SolarPanelModelStatus } from "@/features/solar-panel/solarPanel.enum";
import type { SolarPanel } from "@/features/solar-panel/solarPanel";

const mockedListSolarPanelModels = vi.mocked(listSolarPanelModels);

const items: SolarPanel[] = [
  {
    id: "panel-1",
    brand: "SolTech",
    brandId: "brand-SolTech",
    model: "ST-450",
    type: SolarPanelType.MONOCRYSTALLINE,
    status: SolarPanelModelStatus.APPROVED,
    powerOutput: 450,
  },
];

function fillTechnicalFields() {
  for (const name of ["Características técnicas", "Dimensões"]) {
    const toggle = screen.getByRole("button", { name });
    if (toggle.getAttribute("aria-expanded") === "false") fireEvent.click(toggle);
  }
  for (const [label, value] of [
    ["Potência (Wp)", "450"],
    ["Eficiência (%)", "21.5"],
    ["Peso (kg)", "22"],
    ["Largura (m)", "1.13"],
    ["Comprimento (m)", "1.72"],
  ]) {
    fireEvent.change(screen.getByRole("spinbutton", { name: label }), { target: { value } });
  }
}

describe("SolarPanelModelCrud", () => {
  it("displays the translated API reason when a model cannot be removed", async () => {
    const pending = { ...items[0], creatorCompanyId: "company-1", status: SolarPanelModelStatus.UNDERANALYSIS };
    mockedListSolarPanelModels.mockResolvedValue([pending]);
    vi.mocked(deleteSolarPanel).mockRejectedValueOnce(
      new Error("Service failure", {
        cause: new HttpResponseError(422, "MODEL_NOT_REMOVABLE", "Untranslated server detail"),
      }),
    );
    render(
      <MemoryRouter>
        <SolarPanelModelCrud />
      </MemoryRouter>,
    );
    await screen.findByText("ST-450");
    fireEvent.click(screen.getByRole("button", { name: "Opções de SolTech ST-450" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Remover" }));
    fireEvent.click(screen.getByRole("button", { name: /confirmar/i }));
    await act(async () => {});
    expect(notify).toHaveBeenCalledWith("Somente modelos em análise podem ser excluídos.");
    expect(screen.getByText("ST-450")).toBeVisible();
  });

  it("opens the existing prefilled form from the details edit URL", async () => {
    mockedListSolarPanelModels.mockResolvedValue([{ ...items[0], creatorCompanyId: "company-1", status: SolarPanelModelStatus.UNDERANALYSIS }]);
    render(
      <MemoryRouter initialEntries={["/pt-BR/admin/modelos-de-placa-solar?edit=panel-1"]}>
        <SolarPanelModelCrud />
      </MemoryRouter>,
    );
    expect(await screen.findByRole("heading", { name: "Editar modelo" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Modelo" })).toHaveValue("ST-450");
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      "URL",
      class extends URL {
        static createObjectURL = vi.fn(() => "blob:preview");
        static revokeObjectURL = vi.fn();
      },
    );
    vi.mocked(listModelPhotos).mockReset().mockResolvedValue([]);
    mockedListSolarPanelModels.mockReset();
    vi.mocked(useActiveContext).mockReturnValue({
      loading: false,
      kind: "company",
      setKind: vi.fn(),
      isAdmin: true,
      hasCompany: true,
      isPlatformAdmin: false,
      can: () => true,
      company: {
        id: "company-1",
        status: "APPROVED",
        type: "SUPPLIER",
        cnpj: "1",
        tradeName: "Solaria",
        corporateName: "Solaria Ltda",
        slug: "solaria",
      } as never,
    });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("opens the form from the initial table and returns on cancel", () => {
    mockedListSolarPanelModels.mockReturnValue(new Promise(() => {}));

    render(
      <MemoryRouter>
        <SolarPanelModelCrud />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Placas Solares" })).toBeInTheDocument();
    const table = screen.getByRole("table");
    expect(table).toBeInTheDocument();
    expect(within(table).getByRole("columnheader", { name: "Marca" })).toBeInTheDocument();
    expect(within(table).getByRole("columnheader", { name: "Modelo" })).toBeInTheDocument();
    expect(table.querySelector("thead .shimmer")).toBeNull();
    const loadingRows = Array.from(table.querySelectorAll("tbody tr"));
    expect(loadingRows).toHaveLength(3);
    for (const row of loadingRows) {
      expect(row.querySelectorAll(".shimmer")).toHaveLength(1);
      expect(row.querySelector("td")?.colSpan).toBe(9);
      expect(within(row as HTMLElement).getByRole("button", { name: /carregando/i })).toBeDisabled();
    }
    expect(screen.queryByRole("combobox", { name: "Marca" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Adicionar modelo" }));
    expect(screen.getByRole("combobox", { name: "Marca" })).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Cancelar edição" }));
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(createSolarPanel).not.toHaveBeenCalled();
  });

  it("starts numerical fields empty and allows clearing a dimension without restoring zero", () => {
    mockedListSolarPanelModels.mockReturnValue(new Promise(() => {}));
    render(
      <MemoryRouter>
        <SolarPanelModelCrud />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Adicionar modelo" }));
    expect(screen.queryByRole("heading", { name: "Identificação" })).not.toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Marca" })).toBeVisible();
    expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();
    for (const name of ["Características técnicas", "Dimensões", "Fotos da placa"]) {
      expect(screen.getByRole("button", { name })).toHaveAttribute("aria-expanded", "false");
    }
    fireEvent.click(screen.getByRole("button", { name: "Características técnicas" }));
    fireEvent.click(screen.getByRole("button", { name: "Dimensões" }));
    for (const input of screen.getAllByRole("spinbutton")) expect(input).toHaveValue(null);
    const width = screen.getByRole("spinbutton", { name: "Largura (m)" });
    expect(width).toHaveAttribute("placeholder", "Ex.: 1.13");
    fireEvent.change(width, { target: { value: "1.2" } });
    expect(width).toHaveValue(1.2);
    const dimensions = screen.getByRole("button", { name: "Dimensões" });
    fireEvent.click(dimensions);
    expect(dimensions).toHaveAttribute("aria-expanded", "false");
    expect(width).toBeInTheDocument();
    expect(width).toHaveValue(1.2);
    expect(screen.queryByRole("spinbutton", { name: "Largura (m)" })).not.toBeInTheDocument();
    fireEvent.click(dimensions);
    expect(dimensions).toHaveAttribute("aria-expanded", "true");
    fireEvent.change(width, { target: { value: "" } });
    expect(width).toHaveValue(null);
    fireEvent.click(dimensions);
    fireEvent.invalid(width);
    expect(dimensions).toHaveAttribute("aria-expanded", "true");
    expect((width as HTMLInputElement).checkValidity()).toBe(false);
  });

  it("uploads the main photo and product photos with their separate roles", async () => {
    mockedListSolarPanelModels.mockReturnValue(new Promise(() => {}));
    render(
      <MemoryRouter>
        <SolarPanelModelCrud />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Adicionar modelo" }));
    fireEvent.change(screen.getByRole("combobox", { name: "Marca" }), { target: { value: "PreviewBrand" } });
    fireEvent.click(await screen.findByRole("option", { name: "PreviewBrand" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Modelo" }), { target: { value: "PreviewModel" } });
    fillTechnicalFields();
    expect(screen.getAllByRole("heading", { name: "Dimensões" })).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Fotos da placa" }));
    const main = screen.getByLabelText("Selecionar foto principal", { selector: "input" });
    const gallery = screen.getByLabelText("Selecionar fotos", { selector: "input" });
    expect(main).not.toHaveAttribute("multiple");
    expect(gallery).toHaveAttribute("multiple");
    fireEvent.change(main, { target: { files: [new File(["image"], "main.png", { type: "image/png" })] } });
    await screen.findByLabelText("Texto alternativo: main.png");
    fireEvent.change(gallery, { target: { files: [new File(["image"], "gallery.png", { type: "image/png" })] } });
    await screen.findByLabelText("Texto alternativo: gallery.png");
    expect(createSolarPanel).not.toHaveBeenCalled();
    expect(uploadModelPhoto).not.toHaveBeenCalled();
    vi.mocked(createSolarPanel).mockResolvedValue({ ...items[0], id: "preview-model", brand: "PreviewBrand", model: "PreviewModel" });
    vi.mocked(uploadModelPhoto).mockResolvedValue({ id: "preview-photo", modelId: "preview-model", url: "/preview.png", createdAt: "" });
    fireEvent.click(screen.getByRole("button", { name: "Salvar modelo" }));
    expect(await screen.findByRole("table")).toBeVisible();
    expect(vi.mocked(uploadModelPhoto).mock.calls.map((call) => [call[1].name, call[2]])).toEqual([
      ["main.png", true],
      ["gallery.png", false],
    ]);
  });

  it("renders the mocked models in the table once loaded", async () => {
    mockedListSolarPanelModels.mockResolvedValue(items);

    render(
      <MemoryRouter>
        <SolarPanelModelCrud />
      </MemoryRouter>,
    );

    expect(await screen.findByText("ST-450")).toBeInTheDocument();
  });
  it("shows technical attributes without photos or IDs and preserves zero values", async () => {
    mockedListSolarPanelModels.mockResolvedValue([
      { ...items[0], creatorCompanyId: "company-1", efficiency: 0, dimension: { width: 1.2, length: 2.3 }, weight: 22.5 },
    ]);
    render(
      <MemoryRouter>
        <SolarPanelModelCrud />
      </MemoryRouter>,
    );
    const link = await screen.findByText("ST-450");
    const row = within(link.closest("tr")!);
    expect(row.getAllByRole("button")).toHaveLength(1);
    fireEvent.click(row.getByRole("button", { name: "Opções de SolTech ST-450" }));
    expect(screen.getByRole("menuitem", { name: "Ver detalhes" })).toBeVisible();
    fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
    expect(screen.getAllByRole("columnheader").at(-1)).toHaveTextContent("");
    expect(screen.queryByText("Ações")).not.toBeInTheDocument();
    for (const value of ["450 Wp", "0 %", "1,2 m", "2,3 m", "22,5 kg"]) expect(row.getByText(value)).toBeInTheDocument();
    for (const label of ["Eficiência", "Largura", "Comprimento", "Peso"])
      expect(screen.getByRole("columnheader", { name: label })).toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: /foto/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: /ID/i })).not.toBeInTheDocument();
    expect(row.queryByText("panel-1")).not.toBeInTheDocument();
    expect(row.queryByText("company-1")).not.toBeInTheDocument();
  });

  it("paginates five models per page and handles a partial last page", async () => {
    mockedListSolarPanelModels.mockResolvedValue(
      Array.from({ length: 12 }, (_, index) => ({ ...items[0], id: `panel-${index}`, model: `ST-${index}` })),
    );
    render(
      <MemoryRouter>
        <SolarPanelModelCrud />
      </MemoryRouter>,
    );
    await screen.findByText("ST-0");
    expect(screen.getAllByRole("row")).toHaveLength(6);
    expect(screen.queryByText("ST-5")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Primeira página" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Próxima página" }));
    expect(screen.getByText("ST-5")).toBeInTheDocument();
    expect(screen.queryByText("ST-0")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Última página" }));
    expect(screen.getAllByRole("row")).toHaveLength(3);
    expect(screen.getByRole("button", { name: "Próxima página" })).toBeDisabled();
    expect(screen.getByText("3 de 3", { exact: false })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Primeira página" }));
    expect(screen.getByText("ST-0")).toBeInTheDocument();
  });

  it("adds a model and returns to the updated table", async () => {
    mockedListSolarPanelModels.mockResolvedValue(items);
    vi.mocked(createSolarPanel).mockResolvedValue({ ...items[0], id: "panel-2", brand: "Nova marca", model: "Novo modelo" });
    render(
      <MemoryRouter>
        <SolarPanelModelCrud />
      </MemoryRouter>,
    );
    await screen.findByText("ST-450");
    fireEvent.click(screen.getByRole("button", { name: "Adicionar modelo" }));
    fireEvent.change(screen.getByLabelText("Marca"), { target: { value: "Nova marca" } });
    fireEvent.click(await screen.findByRole("option", { name: "Nova marca" }));
    fireEvent.change(screen.getByLabelText("Modelo"), { target: { value: "Novo modelo" } });
    fillTechnicalFields();
    fireEvent.click(screen.getByRole("button", { name: "Salvar modelo" }));
    expect(await screen.findByText("Novo modelo")).toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.queryByRole("combobox", { name: "Marca" })).not.toBeInTheDocument();
  });

  it("sorts before pagination, filters ranges and restores the original catalog", async () => {
    mockedListSolarPanelModels.mockResolvedValue(
      Array.from({ length: 12 }, (_, index) => ({
        ...items[0],
        id: `sorted-${index}`,
        model: `SORT-${index}`,
        powerOutput: (12 - index) * 50,
      })),
    );
    render(
      <MemoryRouter>
        <SolarPanelModelCrud />
      </MemoryRouter>,
    );
    await screen.findByText("SORT-0");
    expect(screen.getByRole("columnheader", { name: "Marca" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Modelo" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Próxima página" }));
    fireEvent.click(screen.getByRole("button", { name: "Potência" }));
    expect(screen.getByRole("columnheader", { name: "Potência" })).toHaveAttribute("aria-sort", "ascending");
    expect(screen.getAllByRole("row")[1]).toHaveTextContent("SORT-11");
    expect(screen.getByText("1 de 3", { exact: false })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Potência" }));
    expect(screen.getAllByRole("row")[1]).toHaveTextContent("SORT-0");
    fireEvent.click(screen.getByRole("button", { name: "Filtros" }));
    fireEvent.change(screen.getByRole("spinbutton", { name: "Potência: Mínimo" }), { target: { value: "500" } });
    expect(screen.getAllByRole("row")).toHaveLength(4);
    expect(screen.getByText("1 de 1", { exact: false })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Remover filtro de Potência" }));
    expect(screen.getByText("1 de 3", { exact: false })).toBeInTheDocument();
    fireEvent.change(screen.getByRole("spinbutton", { name: "Potência: Mínimo" }), { target: { value: "900" } });
    expect(screen.getByText("0 de 0", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("Nenhum modelo corresponde aos filtros.")).toBeVisible();
    expect(within(screen.getByRole("dialog", { name: "Filtros" })).queryByRole("button", { name: "Limpar filtros" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Fechar filtros" }));
    fireEvent.click(screen.getByRole("button", { name: "Limpar filtros" }));
    fireEvent.click(screen.getByRole("button", { name: "Potência" }));
    expect(screen.getAllByRole("row")[1]).toHaveTextContent("SORT-0");
    expect(screen.getByRole("columnheader", { name: "Potência" })).toHaveAttribute("aria-sort", "none");
  });

  it("refreshes without clearing the visible rows and reports a failed retry", async () => {
    mockedListSolarPanelModels.mockResolvedValueOnce(items);
    render(
      <MemoryRouter>
        <SolarPanelModelCrud />
      </MemoryRouter>,
    );
    await screen.findByText("ST-450");
    let resolve!: (value: SolarPanel[]) => void;
    mockedListSolarPanelModels.mockReturnValueOnce(
      new Promise((done) => {
        resolve = done;
      }),
    );
    const refresh = () => {
      fireEvent.click(screen.getByRole("button", { name: "Configura\u00e7\u00f5es da tabela" }));
      fireEvent.click(screen.getByRole("menuitem", { name: "Atualizar dados" }));
    };
    refresh();
    expect(screen.getByText("ST-450")).toBeVisible();
    expect(screen.getByRole("table")).toHaveAttribute("aria-busy", "true");
    await act(async () => resolve([{ ...items[0], model: "ST-600" }]));
    expect(screen.getByText("ST-600")).toBeVisible();
    expect(notify).toHaveBeenCalledWith("Dados atualizados");
    mockedListSolarPanelModels.mockRejectedValueOnce(new Error("Offline"));
    refresh();
    await act(async () => {});
    expect(screen.getByText("ST-600")).toBeVisible();
    expect(screen.getByRole("table")).toHaveAttribute("aria-busy", "false");
    expect(notify).toHaveBeenCalledWith("N\u00e3o foi poss\u00edvel atualizar os dados. Tente novamente.");
  });

  it("opens editing without the table and returns after saving", async () => {
    const pending = { ...items[0], creatorCompanyId: "company-1", status: SolarPanelModelStatus.UNDERANALYSIS };
    mockedListSolarPanelModels.mockResolvedValue([pending]);
    vi.mocked(updateSolarPanel).mockResolvedValue({ ...pending, model: "ST-500" });
    render(
      <MemoryRouter>
        <SolarPanelModelCrud />
      </MemoryRouter>,
    );
    await screen.findByText("ST-450");
    fireEvent.click(screen.getByRole("button", { name: "Opções de SolTech ST-450" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Editar" }));
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Modelo")).toHaveValue("ST-450");
    fireEvent.change(screen.getByLabelText("Modelo"), { target: { value: "ST-500" } });
    fillTechnicalFields();
    fireEvent.click(screen.getByRole("button", { name: "Salvar modelo" }));
    expect(await screen.findByText("ST-500")).toBeInTheDocument();
  });

  it("limits the row menu to actions allowed by permissions", async () => {
    vi.mocked(useActiveContext).mockReturnValue({ ...vi.mocked(useActiveContext)(), can: () => false });
    mockedListSolarPanelModels.mockResolvedValue(items);
    render(
      <MemoryRouter>
        <SolarPanelModelCrud />
      </MemoryRouter>,
    );
    await screen.findByText("ST-450");
    fireEvent.click(screen.getByRole("button", { name: "Op\u00e7\u00f5es de SolTech ST-450" }));
    expect(screen.getByRole("menuitem", { name: "Ver detalhes" })).toBeVisible();
    expect(screen.queryByRole("menuitem", { name: "Editar" })).not.toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Remover" })).not.toBeInTheDocument();
  });

  it("removes through the row menu and preserves data on failure", async () => {
    const pending = { ...items[0], creatorCompanyId: "company-1", status: SolarPanelModelStatus.UNDERANALYSIS };
    mockedListSolarPanelModels.mockResolvedValue([pending]);
    vi.mocked(deleteSolarPanel).mockRejectedValueOnce(new Error("Offline")).mockResolvedValueOnce(undefined);
    render(
      <MemoryRouter>
        <SolarPanelModelCrud />
      </MemoryRouter>,
    );
    await screen.findByText("ST-450");
    const remove = () => {
      fireEvent.click(screen.getByRole("button", { name: "Op\u00e7\u00f5es de SolTech ST-450" }));
      fireEvent.click(screen.getByRole("menuitem", { name: "Remover" }));
      fireEvent.click(screen.getByRole("button", { name: /confirmar/i }));
    };
    remove();
    await act(async () => {});
    expect(screen.getByText("ST-450")).toBeVisible();
    expect(notify).toHaveBeenCalledWith("N\u00e3o foi poss\u00edvel remover o modelo. Tente novamente.");
    remove();
    await act(async () => {});
    expect(deleteSolarPanel).toHaveBeenLastCalledWith("panel-1");
    expect(screen.queryByText("ST-450")).not.toBeInTheDocument();
    expect(notify).toHaveBeenCalledWith("Modelo removido.");
  });

  it("keeps the search bar visible, combines search with filters and can hide the bar", async () => {
    mockedListSolarPanelModels.mockResolvedValue([...items, { ...items[0], id: "panel-2", brand: "Outra", model: "Modelo-2" }]);
    render(
      <MemoryRouter>
        <SolarPanelModelCrud />
      </MemoryRouter>,
    );
    await screen.findByText("ST-450");
    const search = screen.getByRole("textbox", { name: "Buscar marca, modelo ou tipo" });
    fireEvent.change(search, { target: { value: "soltech" } });
    expect(screen.queryByText("Modelo-2")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Filtros" }));
    expect(screen.getByRole("dialog", { name: "Filtros" })).toBeVisible();
    fireEvent.change(screen.getByRole("spinbutton", { name: "Pot\u00eancia: M\u00ednimo" }), { target: { value: "500" } });
    expect(screen.getByText("0 de 0", { exact: false })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Fechar filtros" }));
    fireEvent.click(screen.getByRole("button", { name: "Configura\u00e7\u00f5es da tabela" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Ocultar barra de pesquisa" }));
    expect(screen.queryByRole("textbox", { name: "Buscar marca, modelo ou tipo" })).not.toBeInTheDocument();
  });

  it("requires confirmation before removing and cancel preserves the model", async () => {
    mockedListSolarPanelModels.mockResolvedValue([{ ...items[0], creatorCompanyId: "company-1", status: SolarPanelModelStatus.UNDERANALYSIS }]);
    render(
      <MemoryRouter>
        <SolarPanelModelCrud />
      </MemoryRouter>,
    );
    await screen.findByText("ST-450");
    fireEvent.click(screen.getByRole("button", { name: "Op\u00e7\u00f5es de SolTech ST-450" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Remover" }));
    expect(screen.getByRole("dialog", { name: "Remover" })).toBeVisible();
    expect(deleteSolarPanel).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(screen.getByText("ST-450")).toBeVisible();
    expect(deleteSolarPanel).not.toHaveBeenCalled();
  });

  it("keeps form values when saving fails", async () => {
    mockedListSolarPanelModels.mockResolvedValue(items);
    vi.mocked(createSolarPanel).mockRejectedValue(new Error("Offline"));
    render(
      <MemoryRouter>
        <SolarPanelModelCrud />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Adicionar modelo" }));
    fireEvent.change(screen.getByLabelText("Marca"), { target: { value: "Nova marca" } });
    fireEvent.click(await screen.findByRole("option", { name: "Nova marca" }));
    fireEvent.change(screen.getByLabelText("Modelo"), { target: { value: "Novo modelo" } });
    fillTechnicalFields();
    fireEvent.click(screen.getByRole("button", { name: "Salvar modelo" }));
    expect(await screen.findByText("Não foi possível salvar", { exact: false })).toBeInTheDocument();
    expect(screen.getByLabelText("Marca")).toHaveValue("Nova marca");
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
  it("retries only failed files without creating the model twice", async () => {
    mockedListSolarPanelModels.mockResolvedValue([]);
    let resolvePhotos!: (photos: ModelPhoto[]) => void;
    vi.mocked(listModelPhotos).mockReturnValue(
      new Promise((resolve) => {
        resolvePhotos = resolve;
      }),
    );
    const saved = { ...items[0], id: "created-panel", brand: "Brand", model: "Model", status: SolarPanelModelStatus.UNDERANALYSIS };
    vi.mocked(createSolarPanel).mockResolvedValue(saved);
    vi.mocked(updateSolarPanel).mockResolvedValue(saved);
    const first = new File(["first"], "first.png", { type: "image/png" });
    const second = new File(["second"], "second.png", { type: "image/png" });
    vi.mocked(uploadModelPhoto)
      .mockResolvedValueOnce({ id: "photo-1", modelId: saved.id, url: "/first.png", createdAt: "" })
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce({ id: "photo-2", modelId: saved.id, url: "/second.png", createdAt: "" });
    render(
      <MemoryRouter>
        <SolarPanelModelCrud />
      </MemoryRouter>,
    );
    await screen.findByText("Nenhum modelo cadastrado.");
    fireEvent.click(screen.getByRole("button", { name: "Adicionar modelo" }));
    fireEvent.change(screen.getByLabelText("Marca"), { target: { value: "Brand" } });
    fireEvent.click(await screen.findByRole("option", { name: "Brand" }));
    fireEvent.change(screen.getByLabelText("Modelo"), { target: { value: "Model" } });
    fireEvent.click(screen.getByRole("button", { name: "Fotos da placa" }));
    fireEvent.change(screen.getByLabelText("Selecionar fotos", { selector: "input" }), { target: { files: [first, second] } });
    await screen.findByLabelText("Texto alternativo: second.png");
    fillTechnicalFields();
    fireEvent.click(screen.getByRole("button", { name: "Salvar modelo" }));
    await waitFor(() => expect(screen.getAllByRole("status").some((item) => item.textContent?.includes("fotos"))).toBe(true));
    expect(createSolarPanel).toHaveBeenCalledOnce();
    await act(async () => resolvePhotos([]));
    expect(screen.getAllByAltText("Brand Model")).toHaveLength(1);
    fillTechnicalFields();
    fireEvent.click(screen.getByRole("button", { name: "Salvar modelo" }));
    expect(await screen.findByText("Model")).toBeInTheDocument();
    expect(createSolarPanel).toHaveBeenCalledOnce();
    expect(vi.mocked(uploadModelPhoto).mock.calls.map((call) => call[1].name)).toEqual(["first.png", "second.png", "second.png"]);
  });
});
