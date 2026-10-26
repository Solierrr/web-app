import type { Preview } from "@storybook/react-vite";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "../src/index.css";
import "../src/config/i18n/internationalization";
import { solariaTheme } from "./theme.ts";
import "./docs.css";

const preview: Preview = {
  tags: ["autodocs"],
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
      <MemoryRouter key={context.id} initialEntries={[context.parameters.router?.path ?? "/pt-BR"]}>
        <Routes>
          <Route path="/:lang/*" element={<Story />} />
        </Routes>
      </MemoryRouter>
    ),
  ],
};

export default preview;
