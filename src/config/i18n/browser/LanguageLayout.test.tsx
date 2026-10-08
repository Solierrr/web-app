import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import LanguageLayout from "./LanguageLayout";
import LanguageSwitcher from "@@/layout/navbar/LanguageSwitcher";
import i18n from "@/config/i18n/internationalization";

const originalLanguage = document.documentElement.lang;
afterEach(() => {
  document.documentElement.lang = originalLanguage;
});

describe("LanguageLayout", () => {
  it("syncs HTML even when i18n already matches the route", async () => {
    await i18n.changeLanguage("pt-BR");
    document.documentElement.lang = "en";
    render(
      <MemoryRouter initialEntries={["/pt-BR"]}>
        <Routes>
          <Route path="/:lang" element={<LanguageLayout />}>
            <Route index element={<p>Home</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
    expect(document.documentElement.lang).toBe("pt-BR");
  });

  it("updates HTML and translations when the language icon changes the path", async () => {
    render(
      <MemoryRouter initialEntries={["/pt-BR"]}>
        <Routes>
          <Route path="/:lang" element={<LanguageLayout />}>
            <Route index element={<LanguageSwitcher />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByRole("option", { name: "English" }));
    await waitFor(() => {
      expect(document.documentElement.lang).toBe("en-US");
      expect(i18n.language).toBe("en-US");
    });
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByRole("option", { name: "Espa\u00f1ol" }));
    await waitFor(() => expect(document.documentElement.lang).toBe("es-ES"));
  });
});
