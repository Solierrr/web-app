import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProfessionalOnboarding from "./ProfessionalOnboarding";
import { getProfessions } from "../../professional.onboarding.service";
vi.mock("@@/layout/access/canvas/SideCanvas", () => ({ default: () => null }));
vi.mock("../../professional.onboarding.service", () => ({
  getProfessions: vi.fn(),
  createPerson: vi.fn(),
  createTechnician: vi.fn(),
  createProfessionalRegistration: vi.fn(),
}));
const page = () =>
  render(
    <MemoryRouter>
      <ProfessionalOnboarding />
    </MemoryRouter>,
  );
describe("ProfessionalOnboarding mocks", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubEnv("VITE_MOCKS", "ALWAYS");
    vi.stubEnv("VITE_MOCKS_DELAY_SECONDS", "0");
    vi.mocked(getProfessions).mockResolvedValue([{ id: "electric", name: "Eletricista" }]);
  });
  it("loads the profession catalog before showing the form", () => {
    vi.mocked(getProfessions).mockReturnValue(new Promise(() => {}));
    page();
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });
  it("keeps registration sections closed and preserves edited values", async () => {
    page();
    await screen.findByRole("button", { name: "Concluir cadastro" });
    const section = screen.getByRole("button", { name: "Registro profissional" });
    expect(section).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(section);
    fireEvent.change(screen.getByLabelText("CREA/registro profissional"), { target: { value: "SP123" } });
    fireEvent.click(section);
    fireEvent.click(section);
    expect(screen.getByLabelText("CREA/registro profissional")).toHaveValue("SP123");
  });
});
