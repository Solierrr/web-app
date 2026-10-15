import type { Meta, StoryObj } from "@storybook/react-vite";
import CatalogFeed from "./CatalogFeed";
import { panelOffer, infrastructureOffer } from "./CatalogFeed.stories.fixtures";
import { DEFAULT } from "@/config/i18n/browser/languages";
import { expect, userEvent } from "storybook/test";
const meta = {
  title: "Marketplace/CatalogFeed",
  component: CatalogFeed,
  args: { kind: "PANEL", lang: DEFAULT, load: async () => [panelOffer, infrastructureOffer] },
} satisfies Meta<typeof CatalogFeed>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Panels: Story = {};
export const Infrastructure: Story = {
  args: { kind: "INFRASTRUCTURE" },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText("Trilho de alumínio")).toBeVisible();
    await userEvent.type(canvas.getByRole("textbox", { name: "Buscar oferta, marca ou fornecedor" }), "não existe");
    await expect(canvas.getByText("Nenhuma oferta corresponde à sua busca.")).toBeVisible();
  },
};
export const Empty: Story = { args: { load: async () => [] } };
export const Loading: Story = { args: { load: () => new Promise(() => {}) } };
export const Failed: Story = {
  args: {
    load: async () => {
      throw new Error("Unavailable");
    },
  },
};
