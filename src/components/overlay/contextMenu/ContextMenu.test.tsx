import { act, createRef } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ContextMenu, type ContextMenuHandle, type ContextMenuItem } from "./ContextMenu";

const ITEMS: ContextMenuItem[] = [
  { label: "Editar", onClick: vi.fn() },
  { label: "Excluir", onClick: vi.fn() },
];

describe("ContextMenu", () => {
  it("renders nothing until open() is called", () => {
    render(<ContextMenu />);

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("opens at the given position with the given items when open() is called", () => {
    const ref = createRef<ContextMenuHandle>();
    render(<ContextMenu ref={ref} />);

    act(() => ref.current!.open(ITEMS, 120, 80));

    const menu = screen.getByRole("menu");
    expect(menu).toBeInTheDocument();
    expect(menu.style.left).toBe("120px");
    expect(menu.style.top).toBe("80px");
    expect(screen.getAllByRole("menuitem")).toHaveLength(2);
  });

  it("calls onClick and closes when an item is clicked", () => {
    const handleClick = vi.fn();
    const items: ContextMenuItem[] = [{ label: "Editar", onClick: handleClick }];
    const ref = createRef<ContextMenuHandle>();
    render(<ContextMenu ref={ref} />);

    act(() => ref.current!.open(items, 10, 10));
    fireEvent.click(screen.getByRole("menuitem", { name: "Editar" }));

    expect(handleClick).toHaveBeenCalledOnce();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("does not call onClick and stays open when a disabled item is clicked", () => {
    const handleClick = vi.fn();
    const items: ContextMenuItem[] = [{ label: "Editar", onClick: handleClick, disabled: true }];
    const ref = createRef<ContextMenuHandle>();
    render(<ContextMenu ref={ref} />);

    act(() => ref.current!.open(items, 10, 10));
    fireEvent.click(screen.getByRole("menuitem", { name: "Editar" }));

    expect(handleClick).not.toHaveBeenCalled();
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("replaces the items on a second open() call", () => {
    const ref = createRef<ContextMenuHandle>();
    render(<ContextMenu ref={ref} />);

    act(() => ref.current!.open(ITEMS, 10, 10));
    expect(screen.getAllByRole("menuitem")).toHaveLength(2);

    act(() => ref.current!.open([{ label: "Único", onClick: vi.fn() }], 20, 20));
    expect(screen.getAllByRole("menuitem")).toHaveLength(1);
  });

  it("closes when clicking outside", () => {
    const ref = createRef<ContextMenuHandle>();
    render(<ContextMenu ref={ref} />);

    act(() => ref.current!.open(ITEMS, 10, 10));
    expect(screen.getByRole("menu")).toBeInTheDocument();

    fireEvent.mouseDown(document.body);

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("closes when Escape is pressed", () => {
    const ref = createRef<ContextMenuHandle>();
    render(<ContextMenu ref={ref} />);

    act(() => ref.current!.open(ITEMS, 10, 10));
    expect(screen.getByRole("menu")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("closes via close()", () => {
    const ref = createRef<ContextMenuHandle>();
    render(<ContextMenu ref={ref} />);

    act(() => ref.current!.open(ITEMS, 10, 10));
    expect(screen.getByRole("menu")).toBeInTheDocument();

    act(() => ref.current!.close());

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
