import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { httpJson } from "@/lib/shared/http/http.service";
import { analyzeImage } from "@/lib/shared/accessibility/aiAccessibility.service";
import ProfilePhotoEditor from "./ProfilePhotoEditor";
vi.mock("@/lib/shared/http/http.service", () => ({ httpJson: vi.fn() }));
vi.mock("@/lib/shared/accessibility/aiAccessibility.service", () => ({ analyzeImage: vi.fn() }));
beforeEach(() => {
  vi.stubEnv("VITE_MOCKS", "DEACTIVATED");
  vi.mocked(httpJson).mockReset().mockResolvedValue([]);
  vi.mocked(analyzeImage).mockReset().mockResolvedValue({ status: "suggested", altText: "Retrato de uma pessoa sorrindo" });
});
afterEach(() => vi.unstubAllEnvs());
describe("profile image flow", () => {
  it("uploads the selected file to the existing multipart endpoint", async () => {
    const onChange = vi.fn();
    render(<ProfilePhotoEditor id="user-id" entity="user" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Imagens do perfil" }));
    const file = new File(["image"], "avatar.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText("Foto de perfil", { selector: "input" }), { target: { files: [file] } });
    await screen.findByLabelText("Texto alternativo: avatar.png");
    vi.mocked(httpJson).mockResolvedValueOnce({ url: "https://images.example.test/avatar.png" });
    fireEvent.click(screen.getAllByRole("button", { name: "Salvar imagem" })[0]);
    await waitFor(() => expect(onChange).toHaveBeenCalledWith("PROFILE", "https://images.example.test/avatar.png"));
    const call = vi.mocked(httpJson).mock.calls.find(([, options]) => options.method === "PUT");
    expect(call?.[0]).toContain("/user-photos/user/user-id/type/PROFILE");
    expect((call?.[1].body as FormData).get("file")).toBe(file);
  });
  it("ignores a stale photo list after a completed upload", async () => {
    let resolvePhotos!: (photos: { type: string; url: string }[]) => void;
    vi.mocked(httpJson).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolvePhotos = resolve;
        }),
    );
    const onChange = vi.fn();
    render(<ProfilePhotoEditor id="user-id" entity="user" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Imagens do perfil" }));
    fireEvent.change(screen.getByLabelText("Foto de perfil", { selector: "input" }), {
      target: { files: [new File(["image"], "avatar.png", { type: "image/png" })] },
    });
    await screen.findByLabelText("Texto alternativo: avatar.png");
    vi.mocked(httpJson).mockResolvedValueOnce({ url: "new-image" });
    fireEvent.click(screen.getAllByRole("button", { name: "Salvar imagem" })[0]);
    await waitFor(() => expect(onChange).toHaveBeenCalledWith("PROFILE", "new-image"));
    resolvePhotos([{ type: "PROFILE", url: "old-image" }]);
    await waitFor(() => expect(screen.getAllByRole("button", { name: "Salvar imagem" })[0]).toBeDisabled());
    expect(onChange).not.toHaveBeenCalledWith("PROFILE", "old-image");
  });
  it("analyzes the image for the entity and keeps a rejected image out of the upload", async () => {
    vi.mocked(analyzeImage).mockResolvedValueOnce({ status: "blocked", reason: "inappropriate" });
    render(<ProfilePhotoEditor id="company-id" entity="company" onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Imagens do perfil" }));
    fireEvent.change(screen.getAllByLabelText("Foto de perfil", { selector: "input" })[0], {
      target: { files: [new File(["image"], "banner.png", { type: "image/png" })] },
    });
    expect(await screen.findByText(/foi recusada por conter conteúdo inadequado/)).toBeInTheDocument();
    expect(vi.mocked(analyzeImage).mock.calls[0][1]).toMatchObject({ purpose: "company_profile" });
    expect(screen.getAllByRole("button", { name: "Salvar imagem" })[0]).toBeDisabled();
    expect(screen.queryByLabelText("Texto alternativo: banner.png")).not.toBeInTheDocument();
  });
  it("keeps the current photo when confirmed removal fails", async () => {
    const onChange = vi.fn();
    render(<ProfilePhotoEditor id="company-id" entity="company" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Imagens do perfil" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Remover imagem" })[0]);
    expect(vi.mocked(httpJson).mock.calls.some(([, options]) => options.method === "DELETE")).toBe(false);
    vi.mocked(httpJson).mockRejectedValueOnce(new Error("offline"));
    fireEvent.click(await screen.findByRole("button", { name: "confirmar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível atualizar a imagem.");
    expect(onChange).not.toHaveBeenCalled();
  });
});
