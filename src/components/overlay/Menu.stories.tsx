import type { Meta, StoryObj } from "@storybook/react-vite";
import { MenuList, MenuItem } from "./Menu";

const meta = {
  title: "Overlay/Menu",
  component: MenuList,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof MenuList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <MenuList aria-label="Opções" className="w-48">
      <MenuItem>Editar</MenuItem>
      <MenuItem>Duplicar</MenuItem>
      <MenuItem disabled>Arquivar</MenuItem>
      <MenuItem>Excluir</MenuItem>
    </MenuList>
  ),
};

export const WithSelection: Story = {
  render: () => (
    <MenuList aria-label="Idioma" className="w-48">
      <MenuItem selected>Português</MenuItem>
      <MenuItem>English</MenuItem>
      <MenuItem>Español</MenuItem>
    </MenuList>
  ),
};
