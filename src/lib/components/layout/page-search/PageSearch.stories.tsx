import type { Meta, StoryObj } from "@storybook/react-vite";
import PageSearch from "./PageSearch";
import { groups, language } from "../../../../../.storybook/fixtures";
import { fn, expect, userEvent, within } from "storybook/test";
const meta = {
  title: "Layout/PageSearch",
  component: PageSearch,
  args: { groups, lang: language, context: "storybook-company", collapsed: false, onNavigate: fn() },
  decorators: [
    (Story) => (
      <div className="w-72 p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PageSearch>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Search: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Buscar uma tela" }));
    const page = within(document.body);
    await userEvent.type(page.getByRole("combobox"), "projeto");
    await expect(page.getByRole("option", { name: /Projetos/ })).toBeVisible();
    await userEvent.keyboard("{Escape}");
  },
};
export const Collapsed: Story = { args: { collapsed: true } };
export const NoRecent: Story = { args: { context: "storybook-empty" } };

export const KeyboardOnly: Story = {
  args: { showTrigger: false },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole("button", { name: "Buscar uma tela" })).not.toBeInTheDocument();
    await userEvent.keyboard("{Control>}k{/Control}");
    const page = within(document.body);
    await expect(page.getByRole("combobox")).toBeVisible();
    await userEvent.type(page.getByRole("combobox"), "projeto");
    await expect(page.getByRole("option", { name: /Projetos/ })).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await expect(page.queryByRole("combobox")).not.toBeInTheDocument();
  },
};
