import type { Meta, StoryObj } from "@storybook/react-vite";
import SaaSLayout from "./SaaSLayout";
import { SidebarOption } from "@@/layout/sidebar/Sidebar.reusable";
import { routePaths } from "@/config/inter/paths";
import SupportedLanguages from "@/config/inter/supported.enum";

const LANG = SupportedLanguages.PTBR;

const meta = {
  title: "Layout/Wrappers/SaaSLayout",
  component: SaaSLayout,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="flex h-screen">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SaaSLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

const sidebar = (
  <>
    <SidebarOption to={routePaths.home(LANG)} icon="home" content="Início" />
    <SidebarOption to={routePaths.designSystem(LANG)} icon="settings" content="Configurações" />
  </>
);

export const Default: Story = {
  args: {
    sidebar,
    children: <div className="bg-input-bg p-6">Conteúdo da página</div>,
  },
};

export const WithAdapterSidebar: Story = {
  args: {
    sidebar,
    children: <div className="bg-input-bg p-6">Conteúdo da página</div>,
    adapterSidebar: <div className="p-6">Painel lateral (ex.: chat)</div>,
  },
};
