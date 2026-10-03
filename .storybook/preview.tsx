import type { Preview } from "@storybook/react-vite";
import { MemoryRouter } from "react-router-dom";
import "../src/index.css";
import "../src/config/i18n/internationalization";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      test: "todo",
    },
  },

  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={["/pt-BR"]}>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export default preview;
