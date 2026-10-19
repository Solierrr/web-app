import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import LanguageLayout, { RootRedirect } from "./LanguageLayout";
import LanguageSwitcher from "@@/layout/navbar/LanguageSwitcher";
import i18n from "@/config/i18n/internationalization";

const originalLanguage = document.documentElement.lang;

beforeEach(() => {
  document.cookie = "solaria_language=; Path=/; Max-Age=0";
});
afterEach(() => {
  document.documentElement.lang = originalLanguage;
  document.cookie = "solaria_language=; Path=/; Max-Age=0";
  vi.restoreAllMocks();
});

function CurrentLocation() {
  const location = useLocation();
  return <p>{location.pathname + location.search + location.hash + JSON.stringify(location.state)}</p>;
}

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

  it("uses the last choice before the browser while preserving unprefixed paths and router state", async () => {
    document.cookie = "solaria_language=es-ES; Path=/";
    vi.spyOn(navigator, "languages", "get").mockReturnValue(["en-US"]);
    render(
      <MemoryRouter initialEntries={[{ pathname: "/login", search: "?next=%2Fpainel", hash: "#form", state: { returnTo: "/secret" } }]}>
        <Routes>
          <Route path="/:lang" element={<LanguageLayout />}>
            <Route path="*" element={<CurrentLocation />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
    expect(await screen.findByText('/es-ES/iniciar-sesion?next=%2Fpainel#form{"returnTo":"/secret"}')).toBeInTheDocument();
  });

  it("keeps query and fragment on root detection", async () => {
    vi.spyOn(navigator, "languages", "get").mockReturnValue(["en-GB"]);
    render(
      <MemoryRouter initialEntries={["/?x=1#details"]}>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/:lang" element={<CurrentLocation />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(await screen.findByText("/en-US?x=1#detailsnull")).toBeInTheDocument();
  });

  it("keeps opaque IDs, query, hash and state when switching", async () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: "/pt-BR/projetos/mensagens/editar", search: "?mode=1", hash: "#edit", state: { keep: true } }]}>
        <Routes>
          <Route path="/:lang" element={<LanguageLayout />}>
            <Route
              path="*"
              element={
                <>
                  <LanguageSwitcher />
                  <CurrentLocation />
                </>
              }
            />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByRole("option", { name: "English" }));
    expect(await screen.findByText('/en-US/projects/mensagens/edit?mode=1#edit{"keep":true}')).toBeInTheDocument();
    expect(document.cookie).toContain("solaria_language=en-US");
  });
});
