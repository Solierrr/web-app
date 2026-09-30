import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import RegistrationStatus from "./RegistrationStatus";

describe("RegistrationStatus", () => {
  it("renders the pending label", () => {
    render(<RegistrationStatus status="PENDING" />);
    expect(screen.getByText("Em análise")).toBeInTheDocument();
  });

  it("renders the approved label", () => {
    render(<RegistrationStatus status="APPROVED" />);
    expect(screen.getByText("Aprovado")).toBeInTheDocument();
  });

  it("renders the rejected label and reason", () => {
    render(<RegistrationStatus status="REJECTED" reason="CNPJ inativo" />);
    expect(screen.getByText("Reprovado")).toBeInTheDocument();
    expect(screen.getByText("CNPJ inativo")).toBeInTheDocument();
  });
});
