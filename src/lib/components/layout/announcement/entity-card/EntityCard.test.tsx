import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, it } from "vitest";
import EntityCard from "./EntityCard";

it("does not request an unrelated avatar when the entity has no photo", () => {
  const { container } = render(
    <MemoryRouter>
      <EntityCard item={{ id: "1", name: "Marina", href: "/perfil" }} />
    </MemoryRouter>,
  );
  expect(container.querySelector("img")).toBeNull();
  expect(screen.getByRole("link", { name: "Marina" })).toHaveAttribute("href", "/perfil");
});
it("removes a failed API photo and accepts a new source", () => {
  const item = { id: "1", name: "Marina", href: "/perfil", avatarUrl: "/photo-one.webp" };
  const { rerender } = render(
    <MemoryRouter>
      <EntityCard item={item} />
    </MemoryRouter>,
  );
  fireEvent.error(screen.getByRole("img", { name: "Marina" }));
  expect(screen.queryByRole("img")).toBeNull();
  rerender(
    <MemoryRouter>
      <EntityCard item={{ ...item, avatarUrl: "/photo-two.webp" }} />
    </MemoryRouter>,
  );
  expect(screen.getByRole("img", { name: "Marina" })).toHaveAttribute("src", "/photo-two.webp");
});
