import type { Preview } from "@storybook/react-vite";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "../src/index.css";
import "../src/config/i18n/internationalization";
import { solariaTheme } from "./theme.ts";
import "./docs.css";
import StorybookLocale from "./StorybookLocale";

const preview: Preview = {
  tags: ["autodocs"],
  initialGlobals: { locale: "pt-BR" },
  globalTypes: {
    locale: {
      description: "Idioma da prévia",
      toolbar: {
        title: "Idioma",
        icon: "globe",
        items: [
          { value: "pt-BR", title: "Português" },
          { value: "en-US", title: "English" },
          { value: "es-ES", title: "Español" },
        ],
      },
    },
  },
  parameters: {
    docs: { theme: solariaTheme, story: { inline: false, height: "480px" } },
    controls: {
      matchers: {
        color: /(backgroundColor|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      test: "todo",
    },
  },

  decorators: [
    (Story, context) => (
      <StorybookLocale locale={String(context.globals.locale ?? "pt-BR")}>
        <MemoryRouter key={context.id} initialEntries={[context.parameters.router?.path ?? "/pt-BR"]}>
          <Routes>
            <Route path="/:lang/*" element={<Story />} />
          </Routes>
        </MemoryRouter>
      </StorybookLocale>
    ),
  ],
};

export default preview;
