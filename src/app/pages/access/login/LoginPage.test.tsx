import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import LoginPage from "./LoginPage";
import Auth from "@/features/access/auth/Auth";
import { useAuth } from "@/features/access/auth/Auth.utils";

function renderLoginPage() {
  return render(
    <MemoryRouter>
      <Auth>
        <LoginPage />
      </Auth>
    </MemoryRouter>,
  );
}

function HomeProbe() {
  const { authenticated } = useAuth();
  return <p>{authenticated ? "logado na home" : "deslogado na home"}</p>;
}

function renderLoginPageWithHomeRoute() {
  return render(
    <MemoryRouter initialEntries={["/pt-BR/login"]}>
      <Auth>
        <Routes>
          <Route path="/pt-BR/login" element={<LoginPage />} />
          <Route path="/pt-BR" element={<HomeProbe />} />
        </Routes>
      </Auth>
    </MemoryRouter>,
  );
}

describe("LoginPage", () => {
  it("renders the login form fields and submit button", () => {
    renderLoginPage();

    expect(screen.getByPlaceholderText("seuemailaqui@email.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("suasenhaaqui")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Prosseguir" })).toBeInTheDocument();
  });

  it("links to the register and forgot-password routes", () => {
    renderLoginPage();

    expect(screen.getByRole("link", { name: "Cadastre-se" })).toHaveAttribute("href", "/pt-BR/cadastro");
    expect(screen.getByRole("link", { name: "Esqueci minha senha" })).toHaveAttribute("href", "/pt-BR/esqueci-senha");
  });

  it("authenticates and navigates home on submit", () => {
    renderLoginPageWithHomeRoute();

    fireEvent.change(screen.getByPlaceholderText("seuemailaqui@email.com"), { target: { value: "ana@inter.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Prosseguir" }));

    expect(screen.getByText("logado na home")).toBeInTheDocument();
  });
});
