import type { Meta, StoryObj } from "@storybook/react-vite";
import SearchBar from "./SearchBar";
import ToolbarAction from "@@/ui/button/ToolbarAction";
const meta = {
  title: "UI/SearchBar",
  component: SearchBar,
  args: { name: "search", placeholder: "Buscar placas solares", "aria-label": "Buscar placas solares" },
  decorators: [
    (Story) => (
      <div className="w-full max-w-160">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SearchBar>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const WithActions: Story = { args: { actions: <ToolbarAction icon="filter" label="Filtros" content="Filtros" /> } };
export const Disabled: Story = { args: { disabled: true } };
