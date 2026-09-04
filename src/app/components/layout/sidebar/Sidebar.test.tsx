import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import Sidebar from "./Sidebar";
import { SidebarOption } from "./Sidebar.reusable";

function renderSidebar(initialPath: string, defaultCollapsed?: boolean) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Sidebar defaultCollapsed={defaultCollapsed}>
        <SidebarOption to="/inicio" icon="home" content="Início" />
        <SidebarOption to="/perfil" icon="user" content="Perfil" />
      </Sidebar>
    </MemoryRouter>,
  );
}

describe("Sidebar", () => {
  it("renders every option passed as children", () => {
    renderSidebar("/inicio");

    expect(screen.getByText("Início")).toBeInTheDocument();
    expect(screen.getByText("Perfil")).toBeInTheDocument();
  });

  it("highlights the option whose `to` matches the current route", () => {
    renderSidebar("/perfil");

    expect(screen.getByRole("link", { name: /perfil/i })).toHaveClass("bg-input-bg");
    expect(screen.getByRole("link", { name: /início/i })).not.toHaveClass("bg-input-bg");
  });

  it("starts expanded (labels visible) by default", () => {
    renderSidebar("/inicio");

    expect(screen.getByText("Início")).toBeInTheDocument();
  });

  it("starts collapsed when defaultCollapsed is true, hiding labels", () => {
    renderSidebar("/inicio", true);

    expect(screen.queryByText("Início")).not.toBeInTheDocument();
  });

  it("hides option labels after clicking the collapse toggle", () => {
    renderSidebar("/inicio");

    fireEvent.click(screen.getByRole("button", { name: /recolher menu/i }));

    expect(screen.queryByText("Início")).not.toBeInTheDocument();
  });

  it("shows option labels again after toggling twice", () => {
    renderSidebar("/inicio");

    fireEvent.click(screen.getByRole("button", { name: /recolher menu/i }));
    fireEvent.click(screen.getByRole("button", { name: /expandir menu/i }));

    expect(screen.getByText("Início")).toBeInTheDocument();
  });

  it("keeps an accessible name for a collapsed option via the title attribute", () => {
    renderSidebar("/inicio", true);

    expect(screen.getByRole("link", { name: "Início" })).toHaveAttribute("title", "Início");
  });
});
