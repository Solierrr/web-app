import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import Corridor from "./Corridor";
import type { SolarPanelFeedSummary } from "@/features/products/solar-panel/solarPanelAnnouncement";

const items: SolarPanelFeedSummary[] = [
  {
    id: "1",
    slug: "coletor-solar-termico-vertical-de-cobre",
    companySlug: "solaria-energia",
    title: "Coletor Solar Térmico Vertical De Cobre",
    unitPrice: 200,
    photos: {
      heroImage: {
        description: "Placa solar 1",
        url: "https://example.com/1.png",
      },
      otherImages: [],
    },
  },
  {
    id: "2",
    slug: "painel-solar-monocristalino-517w",
    companySlug: "helios-instalacoes-solares",
    title: "Painel Solar Monocristalino 517W",
    unitPrice: 1432.6,
    photos: {
      heroImage: {
        description: "Placa solar 2",
        url: "https://example.com/2.png",
      },
      otherImages: [],
    },
  },
];

describe("Corridor", () => {
  it("renders the title", () => {
    render(
      <MemoryRouter>
        <Corridor title="Principais placas solares presentes no mercado" items={items} />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", {
        name: "Principais placas solares presentes no mercado",
      }),
    ).toBeInTheDocument();
  });

  it("renders one card per item, with title, price and a link to the product page", () => {
    render(
      <MemoryRouter>
        <Corridor title="Placas" items={items} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Coletor Solar Térmico Vertical De Cobre")).toBeInTheDocument();
    expect(screen.getByText("R$ 200.00 / uni")).toBeInTheDocument();

    expect(screen.getByRole("link", { name: /Painel Solar Monocristalino 517W/ })).toHaveAttribute(
      "href",
      "/pt-BR/placa-solar/helios-instalacoes-solares/painel-solar-monocristalino-517w",
    );
  });

  it("renders no cards when items is empty", () => {
    render(
      <MemoryRouter>
        <Corridor title="Placas" items={[]} />
      </MemoryRouter>,
    );

    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });

  it("defaults the action label and calls onActionClick when it is clicked", () => {
    const handleActionClick = vi.fn();
    render(
      <MemoryRouter>
        <Corridor title="Placas" items={items} onActionClick={handleActionClick} />
      </MemoryRouter>,
    );

    const action = screen.getByRole("button", {
      name: "acessar todas as peças",
    });
    action.click();

    expect(handleActionClick).toHaveBeenCalledTimes(1);
  });

  it("renders a custom action label when provided", () => {
    render(
      <MemoryRouter>
        <Corridor title="Placas" items={items} actionLabel="ver mais" />
      </MemoryRouter>,
    );

    expect(screen.getByRole("button", { name: "ver mais" })).toBeInTheDocument();
  });
});
