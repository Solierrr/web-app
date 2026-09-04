import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Access from "./Access";

describe("Access", () => {
  it("renders the heading and helper text", () => {
    render(<Access heading="Solaria" helperText="Não encontrou sua empresa?" fields={[]} submitLabel="Prosseguir" />);

    expect(screen.getByRole("heading", { name: "Solaria" })).toBeInTheDocument();
    expect(screen.getByText("Não encontrou sua empresa?")).toBeInTheDocument();
  });

  it("renders one input per field, using the field name as the accessible label", () => {
    render(
      <Access
        heading="Solaria"
        fields={[
          { name: "email", placeholder: "seuemailaqui@email.com" },
          { name: "password", placeholder: "suasenhaaqui", password: true },
        ]}
        submitLabel="Prosseguir"
      />,
    );

    expect(screen.getByRole("textbox", { name: "email" })).toHaveAttribute("placeholder", "seuemailaqui@email.com");
    expect(screen.getByPlaceholderText("suasenhaaqui")).toHaveAttribute("type", "password");
  });

  it("renders the submit button with the given label", () => {
    render(<Access heading="Solaria" fields={[]} submitLabel="Cadastrar" />);

    expect(screen.getByRole("button", { name: "Cadastrar" })).toBeInTheDocument();
  });

  it("calls onSubmit when the form is submitted", () => {
    const handleSubmit = vi.fn();
    render(
      <Access
        heading="Solaria"
        fields={[{ name: "email", placeholder: "seuemailaqui@email.com" }]}
        submitLabel="Prosseguir"
        onSubmit={handleSubmit}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Prosseguir" }));

    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  it("renders the footer content when provided", () => {
    render(<Access heading="Solaria" fields={[]} submitLabel="Prosseguir" footer={<p>Não tem uma conta?</p>} />);

    expect(screen.getByText("Não tem uma conta?")).toBeInTheDocument();
  });
});
