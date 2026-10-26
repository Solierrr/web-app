import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { httpJson } from "@/lib/shared/http/http.service";
import ProfilePhotoEditor from "./ProfilePhotoEditor";
vi.mock("@/lib/shared/http/http.service", () => ({ httpJson: vi.fn() }));
beforeEach(() => {
  vi.stubEnv("VITE_MOCKS", "DEACTIVATED");
  vi.mocked(httpJson).mockReset().mockResolvedValue([]);
});
afterEach(() => vi.unstubAllEnvs());
describe("profile image flow", () => {
  it("uploads the selected file to the existing multipart endpoint", async () => {
    const onChange = vi.fn();
    render(<ProfilePhotoEditor id="user-id" entity="user" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Imagens do perfil" }));
    const file = new File(["image"], "avatar.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText("Foto de perfil", { selector: "input" }), { target: { files: [file] } });
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
    vi.mocked(httpJson).mockResolvedValueOnce({ url: "new-image" });
    fireEvent.click(screen.getAllByRole("button", { name: "Salvar imagem" })[0]);
    await waitFor(() => expect(onChange).toHaveBeenCalledWith("PROFILE", "new-image"));
    resolvePhotos([{ type: "PROFILE", url: "old-image" }]);
    await waitFor(() => expect(screen.getAllByRole("button", { name: "Salvar imagem" })[0]).toBeDisabled());
    expect(onChange).not.toHaveBeenCalledWith("PROFILE", "old-image");
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
