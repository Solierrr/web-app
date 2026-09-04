import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import WrapperLayout from "./WrapperLayout";

describe("WrapperLayout", () => {
  it("renders its children", () => {
    render(
      <WrapperLayout>
        <p>Conteúdo</p>
      </WrapperLayout>,
    );

    expect(screen.getByText("Conteúdo")).toBeInTheDocument();
  });

  it("does not render an AdapterSidebar when adapterSidebar is not passed", () => {
    render(
      <WrapperLayout>
        <p>Conteúdo</p>
      </WrapperLayout>,
    );

    expect(screen.queryByText("Painel lateral")).not.toBeInTheDocument();
  });

  it("renders the adapterSidebar content when passed", () => {
    render(
      <WrapperLayout adapterSidebar={<p>Painel lateral</p>}>
        <p>Conteúdo</p>
      </WrapperLayout>,
    );

    expect(screen.getByText("Painel lateral")).toBeInTheDocument();
  });

  it("calls onAdapterSidebarClose when the AdapterSidebar close button is clicked", () => {
    const onAdapterSidebarClose = vi.fn();

    render(
      <WrapperLayout adapterSidebar={<p>Painel lateral</p>} onAdapterSidebarClose={onAdapterSidebarClose}>
        <p>Conteúdo</p>
      </WrapperLayout>,
    );

    screen.getByRole("button", { name: /fechar/i }).click();

    expect(onAdapterSidebarClose).toHaveBeenCalledTimes(1);
  });
});
