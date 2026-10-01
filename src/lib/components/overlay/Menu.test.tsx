import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MenuList, MenuItem } from "./Menu";

describe("MenuItem", () => {
  it("calls onSelect when clicked", () => {
    const handleSelect = vi.fn();
    render(
      <MenuList role="menu">
        <MenuItem role="menuitem" onSelect={handleSelect}>
          Item
        </MenuItem>
      </MenuList>,
    );

    fireEvent.click(screen.getByRole("menuitem"));

    expect(handleSelect).toHaveBeenCalledOnce();
  });

  it("calls onSelect on Enter and Space", () => {
    const handleSelect = vi.fn();
    render(
      <MenuList role="menu">
        <MenuItem role="menuitem" onSelect={handleSelect}>
          Item
        </MenuItem>
      </MenuList>,
    );

    const item = screen.getByRole("menuitem");
    fireEvent.keyDown(item, { key: "Enter" });
    fireEvent.keyDown(item, { key: " " });

    expect(handleSelect).toHaveBeenCalledTimes(2);
  });

  it("does not call onSelect when disabled, and applies aria-disabled", () => {
    const handleSelect = vi.fn();
    render(
      <MenuList role="menu">
        <MenuItem role="menuitem" onSelect={handleSelect} disabled>
          Item
        </MenuItem>
      </MenuList>,
    );

    const item = screen.getByRole("menuitem");
    fireEvent.click(item);
    fireEvent.keyDown(item, { key: "Enter" });

    expect(handleSelect).not.toHaveBeenCalled();
    expect(item).toHaveAttribute("aria-disabled", "true");
    expect(item).toHaveAttribute("tabIndex", "-1");
  });

  it("calls a caller-provided onKeyDown alongside its own activation logic", () => {
    const handleKeyDown = vi.fn();
    const handleSelect = vi.fn();
    render(
      <MenuList role="menu">
        <MenuItem role="menuitem" onSelect={handleSelect} onKeyDown={handleKeyDown}>
          Item
        </MenuItem>
      </MenuList>,
    );

    fireEvent.keyDown(screen.getByRole("menuitem"), { key: "Escape" });

    expect(handleKeyDown).toHaveBeenCalledOnce();
    expect(handleSelect).not.toHaveBeenCalled();
  });

  it("sets aria-selected only when selected is explicitly passed", () => {
    render(
      <MenuList role="listbox">
        <MenuItem role="option">Sem selected</MenuItem>
        <MenuItem role="option" selected={false}>
          Não selecionado
        </MenuItem>
        <MenuItem role="option" selected={true}>
          Selecionado
        </MenuItem>
      </MenuList>,
    );

    const [plain, unselected, selected] = screen.getAllByRole("option");
    expect(plain).not.toHaveAttribute("aria-selected");
    expect(unselected).toHaveAttribute("aria-selected", "false");
    expect(selected).toHaveAttribute("aria-selected", "true");
  });
});
