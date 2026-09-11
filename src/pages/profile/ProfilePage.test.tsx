import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ProfilePage from "./ProfilePage";

describe("ProfilePage", () => {
  it("renders the name, subtitle, actions and children", () => {
    render(
      <ProfilePage name="Solaria Energia" subtitle="solaria.com.br" actions={<button>Editar</button>}>
        <p>Conteúdo específico do perfil</p>
      </ProfilePage>,
    );

    expect(screen.getByRole("heading", { name: "Solaria Energia" })).toBeInTheDocument();
    expect(screen.getByText("solaria.com.br")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Editar" })).toBeInTheDocument();
    expect(screen.getByText("Conteúdo específico do perfil")).toBeInTheDocument();
  });

  it("omits the subtitle when it is not provided", () => {
    render(<ProfilePage name="Marina Alves Ferreira" />);

    expect(screen.getByRole("heading", { name: "Marina Alves Ferreira" })).toBeInTheDocument();
  });
});
