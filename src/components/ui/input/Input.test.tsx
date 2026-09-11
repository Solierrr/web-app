import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Input from "./Input";

describe("Input", () => {
  it("renders the native input with name and placeholder", () => {
    render(<Input name="email" placeholder="Digite seu email" />);

    const input = screen.getByRole("textbox", { name: "email" });
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("placeholder", "Digite seu email");
    expect(input).toHaveAttribute("name", "email");
  });

  it("defaults to rounded-medium and flex-row (no icon)", () => {
    render(<Input name="email" />);

    const wrapper = screen.getByRole("textbox").parentElement;
    expect(wrapper).toHaveClass("rounded-medium", "flex-row");
    expect(wrapper?.querySelector("svg")).not.toBeInTheDocument();
  });

  it("applies rounded-full when rounded is true", () => {
    render(<Input name="email" rounded />);

    const wrapper = screen.getByRole("textbox").parentElement;
    expect(wrapper).toHaveClass("rounded-full");
    expect(wrapper).not.toHaveClass("rounded-medium");
  });

  it("renders the icon when icon prop is provided", () => {
    render(<Input name="search" icon={{ name: "search" }} />);

    const wrapper = screen.getByRole("textbox").parentElement;
    expect(wrapper?.querySelector("svg")).toBeInTheDocument();
  });

  it("keeps default order (icon after input, mr-4) when icon.inverse is not set", () => {
    render(<Input name="search" icon={{ name: "search" }} />);

    const wrapper = screen.getByRole("textbox").parentElement;
    expect(wrapper).toHaveClass("flex-row");
    expect(wrapper?.querySelector("svg")).toHaveClass("mr-4");
  });

  it("inverts order (icon before input, ml-2) when icon.inverse is true", () => {
    render(<Input name="search" icon={{ name: "search", inverse: true }} />);

    const wrapper = screen.getByRole("textbox").parentElement;
    expect(wrapper).toHaveClass("flex-row");
    expect(wrapper?.querySelector("svg")).toHaveClass("ml-2");
  });

  it("passes through native input attributes via ...props", () => {
    render(<Input name="password" type="password" placeholder="Senha" disabled required />);

    const input = screen.getByPlaceholderText("Senha");
    expect(input).toHaveAttribute("type", "password");
    expect(input).toBeDisabled();
    expect(input).toBeRequired();
  });

  it("fires onChange with the typed value", () => {
    const handleChange = vi.fn();
    render(<Input name="email" onChange={handleChange} />);

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "a@b.com" } });

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe("a@b.com");
  });
});
