import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import Switcher from "./Switcher";

describe("Switcher", () => {
  it("marks the selected link and navigates to another option", () => {
    render(
      <MemoryRouter initialEntries={["/products"]}>
        <Routes>
          <Route
            path="/products"
            element={
              <Switcher
                label="Catálogo"
                activeUrl="/products"
                options={[
                  { content: "Produtos", url: "/products" },
                  { content: "Serviços", url: "/services" },
                ]}
              />
            }
          />
          <Route path="/services" element={<h1>Feed de serviços</h1>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("navigation", { name: "Catálogo" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Produtos" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Serviços" })).not.toHaveAttribute("aria-current");
    fireEvent.click(screen.getByRole("link", { name: "Serviços" }));
    expect(screen.getByRole("heading", { name: "Feed de serviços" })).toBeInTheDocument();
  });
});
