import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import ProfileOnboarding from "./ProfileOnboarding";

describe("ProfileOnboarding", () => {
  it("renders the user onboarding fields by default", () => {
    render(
      <MemoryRouter>
        <ProfileOnboarding />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Personalize o banner do perfil" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("URL da imagem de banner")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("URL da foto de perfil")).toBeInTheDocument();
  });

  it("renders the company onboarding copy when kind is company", () => {
    render(
      <MemoryRouter>
        <ProfileOnboarding kind="company" />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Personalize o banner da empresa" })).toBeInTheDocument();
  });
});
