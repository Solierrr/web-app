import Toast from "@@/feedback/toast/Toast";
import { beforeEach as beforeToastTest } from "vitest";
beforeToastTest(() => {
  render(<Toast />);
});
vi.mock("@@/layout/access/canvas/SideCanvas", () => ({ default: () => null }));
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SettingsPrivacyPage from "./SettingsPrivacyPage";
import { getPrivacyPreferences } from "../../settings.service";

describe("SettingsPrivacyPage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows the saved preferences", () => {
    localStorage.setItem("solaria.privacy.anonymous", JSON.stringify({ showContact: false, showInSearch: true }));

    render(<SettingsPrivacyPage />);

    expect(screen.getByLabelText("Mostrar meus dados de contato no perfil público")).not.toBeChecked();
    expect(screen.getByLabelText("Aparecer nos resultados de busca")).toBeChecked();
  });

  it("saves the changed preferences and confirms", () => {
    render(<SettingsPrivacyPage />);

    fireEvent.click(screen.getByLabelText("Aparecer nos resultados de busca"));
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

    expect(getPrivacyPreferences()).toEqual({ showContact: true, showInSearch: false });
    expect(screen.getByText("Preferências salvas neste dispositivo.", { exact: false })).toBeInTheDocument();
  });

  it("warns when the device blocks saving", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    render(<SettingsPrivacyPage />);

    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

    expect(screen.getByText("Não foi possível salvar as preferências", { exact: false })).toBeInTheDocument();
    vi.restoreAllMocks();
  });
});
