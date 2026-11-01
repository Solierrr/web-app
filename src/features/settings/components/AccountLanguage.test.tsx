import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AccountLanguage from "./AccountLanguage";
import { updateAccountLocale } from "@/features/access/access.service";

const navigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigate,
}));
vi.mock("@/features/access/access.service", () => ({ updateAccountLocale: vi.fn() }));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: "pt-BR" } }),
}));

function renderIt() {
  return render(
    <MemoryRouter initialEntries={["/pt-BR/configuracoes"]}>
      <AccountLanguage />
    </MemoryRouter>,
  );
}

describe("AccountLanguage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(updateAccountLocale).mockResolvedValue(undefined);
  });

  it("saves the language on the account and moves the site to it", async () => {
    renderIt();
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "es-ES" } });
    await waitFor(() => expect(updateAccountLocale).toHaveBeenCalledWith("es-ES"));
    await waitFor(() => expect(navigate).toHaveBeenCalledTimes(1));
    expect(String(navigate.mock.calls[0]![0])).toContain("/es-ES/");
  });

  it("keeps the page and shows an error when the account cannot be updated", async () => {
    vi.mocked(updateAccountLocale).mockRejectedValue(new Error("offline"));
    renderIt();
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "en-US" } });
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(navigate).not.toHaveBeenCalled();
  });

  it("does nothing when the same language is chosen", () => {
    renderIt();
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "pt-BR" } });
    expect(updateAccountLocale).not.toHaveBeenCalled();
  });
});
