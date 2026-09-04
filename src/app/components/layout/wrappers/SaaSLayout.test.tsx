import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import SaaSLayout from "./SaaSLayout";
import { SidebarOption } from "@@/layout/sidebar/Sidebar.reusable";

describe("SaaSLayout", () => {
  it("renders the sidebar options and the main content", () => {
    render(
      <MemoryRouter>
        <SaaSLayout sidebar={<SidebarOption to="/inicio" icon="home" content="Início" />}>
          <p>Conteúdo</p>
        </SaaSLayout>
      </MemoryRouter>,
    );

    expect(screen.getByText("Início")).toBeInTheDocument();
    expect(screen.getByText("Conteúdo")).toBeInTheDocument();
  });

  it("renders the adapterSidebar content when passed", () => {
    render(
      <MemoryRouter>
        <SaaSLayout sidebar={<SidebarOption to="/inicio" icon="home" content="Início" />} adapterSidebar={<p>Painel lateral</p>}>
          <p>Conteúdo</p>
        </SaaSLayout>
      </MemoryRouter>,
    );

    expect(screen.getByText("Painel lateral")).toBeInTheDocument();
  });
});
