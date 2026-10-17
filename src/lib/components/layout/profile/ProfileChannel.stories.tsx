import type { Meta, StoryObj } from "@storybook/react-vite";
import ProfileChannel from "./ProfileChannel";
import { company } from "../../../../../.storybook/fixtures";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import ValueField from "@@/ui/value-field/ValueField";
const meta = {
  title: "Layout/Profile/Channel",
  component: ProfileChannel,
  args: {
    name: company.tradeName,
    bannerUrl: company.bannerUrl,
    avatarUrl: company.logoUrl,
    subtitle: "São Paulo / SP",
    metadata: <ValueField>Placas solares</ValueField>,
    children: <p>Informações e conteúdo da empresa.</p>,
  },
} satisfies Meta<typeof ProfileChannel>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Marketplace: Story = {};
export const Operational: Story = {
  args: { operational: true, actions: <ToolbarAction icon="edit" label="Editar perfil" content="Editar perfil" /> },
};
export const WithoutImages: Story = { args: { operational: true, bannerUrl: undefined, avatarUrl: undefined } };
