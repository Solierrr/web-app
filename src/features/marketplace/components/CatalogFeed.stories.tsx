import type { Meta, StoryObj } from "@storybook/react-vite";
import CatalogFeed from "./CatalogFeed";
import { panelOffer, infrastructureOffer } from "./CatalogFeed.stories.fixtures";
import { DEFAULT } from "@/config/i18n/browser/languages";
import { expect } from "storybook/test";
const meta = {
  title: "Marketplace/CatalogFeed",
  component: CatalogFeed,
  args: { kind: "PANEL", lang: DEFAULT, load: async () => [panelOffer, infrastructureOffer] },
} satisfies Meta<typeof CatalogFeed>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Panels: Story = {};
export const Infrastructure: Story = {
  args: {
    kind: "INFRASTRUCTURE",
    load: async () => [panelOffer, ...Array.from({ length: 3 }, (_, i) => ({ ...infrastructureOffer, id: `${infrastructureOffer.id}-${i}` }))],
  },
  play: async ({ canvas }) => {
    await expect((await canvas.findAllByText("Trilho de alumínio"))[0]).toBeVisible();
    await expect(canvas.queryByRole("textbox")).not.toBeInTheDocument();
    await expect(canvas.queryByText("Painel solar 450 W")).not.toBeInTheDocument();
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
