import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
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
    expect(screen.getByRole("status")).toHaveTextContent("Preferências salvas.");
  });
});
