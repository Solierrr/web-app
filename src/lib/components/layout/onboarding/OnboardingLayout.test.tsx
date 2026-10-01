import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import OnboardingLayout from "./OnboardingLayout";

const steps = ["Dados", "Validação", "Concluir"];

describe("OnboardingLayout", () => {
  it("renders the title, the eyebrow and one progress marker per step", () => {
    render(<OnboardingLayout title="Validação" eyebrow="Empresa · Etapa 2 de 3" steps={steps} step={1} submitLabel="Continuar" progressLabel="Progresso" />);

    expect(screen.getByRole("heading", { name: "Validação" })).toBeInTheDocument();
    expect(screen.getByText("Empresa · Etapa 2 de 3")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByTitle("Validação")).toHaveAttribute("aria-current", "step");
  });

  it("names the progress list, renders the footer and disables the button while busy", () => {
    render(<OnboardingLayout title="Dados" steps={steps} step={0} submitLabel="Continuar" progressLabel="Etapa 1 de 3" footer={<a href="/login">Já tenho conta</a>} busy />);

    expect(screen.getByRole("list", { name: "Etapa 1 de 3" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Já tenho conta" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continuar" })).toBeDisabled();
  });

  it("submits the form through the labelled button and shows the error", () => {
    const onSubmit = vi.fn();
    render(<OnboardingLayout title="Dados" steps={steps} step={0} submitLabel="Continuar" error="Algo falhou" onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("alert")).toHaveTextContent("Algo falhou");
  });
});
