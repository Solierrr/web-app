import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Select from "./Select";

describe("Select", () => {
  it("shows the placeholder when nothing is selected", () => {
    render(<Select name="select-basico" options={["A", "B"]} />);

    expect(screen.getByRole("button", { name: "select-basico" })).toHaveTextContent("Selecione...");
  });

  it("shows a custom placeholder", () => {
    render(<Select name="select-basico" options={["A", "B"]} placeholder="Escolha..." />);

    expect(screen.getByRole("button", { name: "select-basico" })).toHaveTextContent("Escolha...");
  });

  it("keeps the dropdown closed until the trigger is clicked", () => {
    render(<Select name="select-basico" options={["A", "B"]} />);

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "select-basico" }));

    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(2);
  });

  it("selects a plain string option: label and value are the same", () => {
    const handleChange = vi.fn();
    render(<Select name="select-basico" options={["A", "B"]} onChange={handleChange} />);

    fireEvent.click(screen.getByRole("button", { name: "select-basico" }));
    fireEvent.click(screen.getByRole("option", { name: "B" }));

    expect(handleChange).toHaveBeenCalledWith("B");
    expect(screen.getByRole("button", { name: "select-basico" })).toHaveTextContent("B");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("selects a tuple option: label is displayed, value is returned", () => {
    const handleChange = vi.fn();
    render(
      <Select
        name="select-tupla"
        options={[
          ["São Paulo", "SP"],
          ["Rio de Janeiro", "RJ"],
        ]}
        onChange={handleChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "select-tupla" }));
    fireEvent.click(screen.getByRole("option", { name: "Rio de Janeiro" }));

    expect(handleChange).toHaveBeenCalledWith("RJ");
    expect(screen.getByRole("button", { name: "select-tupla" })).toHaveTextContent("Rio de Janeiro");
  });

  it("pre-selects the option matching defaultValue", () => {
    render(
      <Select
        name="select-basico"
        options={[
          ["São Paulo", "SP"],
          ["Rio de Janeiro", "RJ"],
        ]}
        defaultValue="RJ"
      />,
    );

    expect(screen.getByRole("button", { name: "select-basico" })).toHaveTextContent("Rio de Janeiro");
  });

  it("stays controlled by the value prop, ignoring its own selection state", () => {
    const handleChange = vi.fn();
    render(
      <Select
        name="select-basico"
        options={[
          ["São Paulo", "SP"],
          ["Rio de Janeiro", "RJ"],
        ]}
        value="SP"
        onChange={handleChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "select-basico" }));
    fireEvent.click(screen.getByRole("option", { name: "Rio de Janeiro" }));

    expect(handleChange).toHaveBeenCalledWith("RJ");
    // value prop didn't change, so the displayed label doesn't either
    expect(screen.getByRole("button", { name: "select-basico" })).toHaveTextContent("São Paulo");
  });

  it("shows a clear (x) button only when something is selected, and clears on click", () => {
    const handleChange = vi.fn();
    render(<Select name="select-basico" options={["A", "B"]} defaultValue="A" onChange={handleChange} />);

    const clearButton = screen.getByRole("button", { name: "Limpar seleção" });
    expect(clearButton).toBeInTheDocument();

    fireEvent.click(clearButton);

    expect(handleChange).toHaveBeenCalledWith(undefined);
    expect(screen.queryByRole("button", { name: "Limpar seleção" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "select-basico" })).toHaveTextContent("Selecione...");
  });

  it("does not open when disabled", () => {
    render(<Select name="select-basico" options={["A", "B"]} disabled />);

    fireEvent.click(screen.getByRole("button", { name: "select-basico" }));

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("closes when Escape is pressed", () => {
    render(<Select name="select-basico" options={["A", "B"]} />);

    fireEvent.click(screen.getByRole("button", { name: "select-basico" }));
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("closes when clicking outside", () => {
    render(<Select name="select-basico" options={["A", "B"]} />);

    fireEvent.click(screen.getByRole("button", { name: "select-basico" }));
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    fireEvent.mouseDown(document.body);

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
