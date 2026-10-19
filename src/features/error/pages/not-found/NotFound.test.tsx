import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { NotFoundPage } from "./NotFound";

vi.mock("@@/layout/access/canvas/SideCanvas", () => ({ default: () => <div data-testid="error-canvas" /> }));
vi.mock("@@/brand/logo/OrganicLogo", () => ({ default: () => <span role="img" aria-label="Solaria" /> }));

describe("NotFoundPage", () => {
  it("renders the error with side canvas and returns home even on a direct visit", () => {
    render(
      <MemoryRouter initialEntries={["/pt-BR/missing"]}>
        <Routes>
          <Route path="/:lang/missing" element={<NotFoundPage />} />
          <Route path="/pt-BR" element={<p>Home</p>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { name: "Oops... Parece que essa p\u00e1gina n\u00e3o existe..." })).toBeInTheDocument();
    expect(screen.queryByText("404")).not.toBeInTheDocument();
    expect(screen.getByTestId("error-canvas")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Voltar ao in\u00edcio" }));
    expect(screen.getByText("Home")).toBeInTheDocument();
  });
});
