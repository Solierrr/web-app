import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Combobox from "./Combobox";
function Example({ selectionLabel = false }: { selectionLabel?: boolean }) {
  const [value, setValue] = useState("");
  return (
    <>
      <Combobox
        name="brand"
        label="Marca"
        value={value}
        onChange={setValue}
        selectionLabel={selectionLabel}
        toggleLabel="Abrir marcas"
        options={[
          ["Canadian Solar", "brand-1"],
          ["Trina Solar", "brand-2"],
        ]}
        emptyLabel="Sem resultados"
      />
      <output aria-label="ID">{value}</output>
    </>
  );
}
describe("Combobox", () => {
  it("keeps search text separate from the selected identifier", () => {
    render(<Example selectionLabel />);
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "canadian" } });
    expect(screen.getByLabelText("ID")).toHaveTextContent("");
    fireEvent.click(screen.getByRole("option", { name: "Canadian Solar" }));
    expect(input).toHaveValue("Canadian Solar");
    expect(screen.getByLabelText("ID")).toHaveTextContent("brand-1");
    fireEvent.change(input, { target: { value: "inexistente" } });
    expect(screen.getByLabelText("ID")).not.toHaveTextContent("brand-1");
    expect(screen.getByText("Sem resultados")).toBeVisible();
  });
  it("selects using the keyboard and discards unselected text on blur", () => {
    render(<Example selectionLabel />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(screen.getByLabelText("ID")).toHaveTextContent("brand-2");
    fireEvent.change(input, { target: { value: "anything" } });
    fireEvent.blur(input, { relatedTarget: document.body });
    expect(input).toHaveValue("");
  });
});
