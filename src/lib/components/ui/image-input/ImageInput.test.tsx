import Toast from "@@/feedback/toast/Toast";
import { beforeEach as beforeToastTest } from "vitest";
beforeToastTest(() => {
  render(<Toast />);
});
import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ImageInput from "./ImageInput";

const revoke = vi.fn();
beforeEach(() => {
  vi.stubGlobal(
    "URL",
    class extends URL {
      static createObjectURL = vi.fn(() => "blob:preview");
      static revokeObjectURL = revoke;
    },
  );
});
afterEach(() => {
  vi.unstubAllGlobals();
  revoke.mockClear();
});

function Fixture() {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  return (
    <ImageInput
      name="photos"
      files={files}
      onChange={setFiles}
      onError={setError}
      error={error}
      label="Selecionar fotos"
      removeLabel="Remover"
      invalidMessage="Imagem inválida"
      summary={`${files.length} selecionadas`}
    />
  );
}

describe("image selection", () => {
  it("keeps valid selections after an invalid file and revokes the preview when removed", () => {
    const { container } = render(<Fixture />);
    const input = container.querySelector("input")!;
    const image = new File(["image"], "panel.png", { type: "image/png" });
    fireEvent.change(input, { target: { files: [image] } });
    expect(screen.getByAltText("panel.png")).toBeVisible();
    expect(screen.getByText("1 selecionadas", { exact: false })).toBeInTheDocument();
    fireEvent.change(input, { target: { files: [new File(["text"], "invalid.txt", { type: "text/plain" })] } });
    expect(screen.getByText("Imagem inválida")).toBeInTheDocument();
    expect(screen.getByAltText("panel.png")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Remover: panel.png" }));
    expect(screen.queryByAltText("panel.png")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(revoke).toHaveBeenCalledWith("blob:preview");
  });

  it("rejects empty and oversized images before accepting them", () => {
    const { container } = render(<Fixture />);
    const input = container.querySelector("input")!;
    for (const file of [
      new File([], "empty.png", { type: "image/png" }),
      new File([new Uint8Array(8 * 1024 * 1024 + 1)], "large.png", { type: "image/png" }),
    ]) {
      fireEvent.change(input, { target: { files: [file] } });
      expect(screen.getByText("Imagem inválida")).toBeInTheDocument();
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    }
  });
});
