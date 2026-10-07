import { fireEvent, render, screen } from "@testing-library/react";
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

it("does not invent photos for profiles without images", () => {
  const { container } = render(<ProfilePage name="Marina" />);
  expect(container.querySelector("img")).toBeNull();
  expect(container.innerHTML).not.toMatch(/picsum|pravatar/);
});
it("shows the empty photo state when an API image fails", () => {
  render(<ProfilePage name="Marina" avatarUrl="https://res.cloudinary.com/solaria/image/upload/mocks/missing.webp" />);
  fireEvent.error(screen.getByRole("img", { name: "Marina" }));
  expect(screen.queryByRole("img", { name: "Marina" })).not.toBeInTheDocument();
});
