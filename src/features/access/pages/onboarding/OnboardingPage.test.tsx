import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import OnboardingPage from "./OnboardingPage";

const companyFields = {
  cnpj: "11222333000181",
  tradeName: "Solar XPTO",
  corporateName: "Solar XPTO Ltda",
  companyEmail: "contato@gmail.com",
  zipCode: "13010000",
  state: "SP",
  city: "Campinas",
  street: "Rua das Flores",
};

function seed(step: number, fields: Record<string, string> = {}) {
  localStorage.setItem("solaria.registration.visitor.company", JSON.stringify({ kind: "company", step, fields }));
}

function renderCompany() {
  render(
    <MemoryRouter>
      <OnboardingPage kind="company" />
    </MemoryRouter>,
  );
}

describe("OnboardingPage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubEnv("VITE_MOCKS", "DEACTIVATED");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("asks for a corporate e-mail instead of a free mail provider on the company data step", async () => {
    seed(1, { ...companyFields, type: "SUPPLIER" });
    renderCompany();

    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));

    expect(await screen.findByText("Use o e-mail corporativo da empresa, não um e-mail pessoal.")).toBeInTheDocument();
  });

  it("invites the company owner to add other administrators once the registration is sent", () => {
    seed(4, { ...companyFields, companyEmail: "contato@solarxpto.com.br", type: "SUPPLIER" });
    renderCompany();

    expect(screen.getByRole("link", { name: "Convidar outros administradores" })).toHaveAttribute("href", "/pt-BR/admin/funcionarios");
  });

  it("shows the progress of the registration with one marker per step", () => {
    seed(2, { ...companyFields, type: "SUPPLIER" });
    renderCompany();

    expect(screen.getByRole("list", { name: /Etapa 3 de 5/ })).toBeInTheDocument();
  });
});
