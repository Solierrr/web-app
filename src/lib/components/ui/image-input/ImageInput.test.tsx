import Toast from "@@/feedback/toast/Toast";
import { beforeEach as beforeToastTest } from "vitest";
beforeToastTest(() => {
  render(<Toast />);
});
import { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ImageInput from "./ImageInput";
import { analyzeImage } from "@/lib/shared/accessibility/aiAccessibility.service";

vi.mock("@/lib/shared/accessibility/aiAccessibility.service", () => ({ analyzeImage: vi.fn() }));

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

function AnalyzedFixture({ onAltTextChange }: { onAltTextChange?: (file: File, text: string) => void }) {
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
      analysis={{ purpose: "product", contextTitle: "SolTech ST-450" }}
      onAltTextChange={onAltTextChange}
    />
  );
}

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

  it("suggests an editable alternative text for an approved image", async () => {
    vi.mocked(analyzeImage).mockResolvedValue({ status: "suggested", altText: "Painel solar sobre telhado" });
    const onAltTextChange = vi.fn();
    const { container } = render(<AnalyzedFixture onAltTextChange={onAltTextChange} />);
    const image = new File(["image"], "panel.png", { type: "image/png" });
    fireEvent.change(container.querySelector("input")!, { target: { files: [image] } });

    expect(screen.getByText("Analisando a imagem…")).toBeInTheDocument();
    const field = await screen.findByLabelText("Texto alternativo: panel.png");
    expect(field).toHaveValue("Painel solar sobre telhado");
    expect(screen.getByAltText("Painel solar sobre telhado")).toBeVisible();
    expect(analyzeImage).toHaveBeenCalledWith(image, { purpose: "product", contextTitle: "SolTech ST-450" });

    fireEvent.change(field, { target: { value: "Painel de 450 W" } });
    expect(field).toHaveValue("Painel de 450 W");
    expect(onAltTextChange).toHaveBeenCalledWith(image, "Painel de 450 W");
  });

  it("never lets a flagged image reach the upload list", async () => {
    vi.mocked(analyzeImage).mockResolvedValue({ status: "blocked", reason: "inappropriate" });
    const { container } = render(<AnalyzedFixture />);
    fireEvent.change(container.querySelector("input")!, { target: { files: [new File(["image"], "bad.png", { type: "image/png" })] } });

    expect(await screen.findByText(/A imagem bad.png foi recusada/)).toBeInTheDocument();
    expect(screen.queryByAltText("bad.png")).not.toBeInTheDocument();
    expect(screen.getByText("0 selecionadas")).toBeInTheDocument();
  });

  it("keeps the upload available with a manual text when the service is unavailable", async () => {
    vi.mocked(analyzeImage).mockResolvedValue({ status: "unavailable", failure: "O serviço de IA está indisponível." });
    const { container } = render(<AnalyzedFixture />);
    fireEvent.change(container.querySelector("input")!, { target: { files: [new File(["image"], "panel.png", { type: "image/png" })] } });

    const field = await screen.findByLabelText("Texto alternativo: panel.png");
    expect(field).toHaveValue("");
    expect(screen.getByText(/Descreva a imagem para quem usa leitor de tela. O serviço de IA está indisponível./)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("1 selecionadas")).toBeInTheDocument());
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
