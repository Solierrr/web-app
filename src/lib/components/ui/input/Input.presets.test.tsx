import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CepInput, CnpjInput } from "./Input.presets";

describe("document input presets", () => {
  it("masks postal codes, removes letters and limits the raw value to eight digits", () => {
    const onValueChange = vi.fn();
    render(<CepInput name="CEP" onValueChange={onValueChange} />);
    const input = screen.getByRole("textbox", { name: "CEP" });
    fireEvent.change(input, { target: { value: "ab01001000999" } });
    expect(input).toHaveValue("01001-000");
    expect(onValueChange).toHaveBeenLastCalledWith("01001000");
    expect((input as HTMLInputElement).checkValidity()).toBe(true);
  });

  it("masks pasted CNPJ and allows letters only in the first twelve positions", () => {
    render(<CnpjInput name="CNPJ" />);
    const input = screen.getByRole("textbox", { name: "CNPJ" });
    fireEvent.change(input, { target: { value: "12.abc.345/01de-A35Z999" } });
    expect(input).toHaveValue("12.ABC.345/01DE-35");
    expect((input as HTMLInputElement).checkValidity()).toBe(true);
  });

  it("lets backspace remove a character across an automatic separator", () => {
    render(<CepInput name="CEP" defaultValue="01001000" />);
    const input = screen.getByRole("textbox", { name: "CEP" }) as HTMLInputElement;
    input.setSelectionRange(6, 6);
    fireEvent.keyDown(input, { key: "Backspace" });
    expect(input.selectionStart).toBe(4);
    expect(input.selectionEnd).toBe(6);
    fireEvent.change(input, { target: { value: "0100000", selectionStart: 4 } });
    expect(input).toHaveValue("01000-00");
  });
});
