import type { Meta, StoryObj } from "@storybook/react-vite";
import Sidebar from "./Sidebar";
import { SidebarOption } from "./Sidebar.reusable";
import { routePaths } from "@/config/inter/paths";

const LANG = "pt-BR";

const meta = {
  title: "Layout/Sidebar",
  component: Sidebar,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

function Options() {
  return (
    <>
      <SidebarOption to={routePaths.home(LANG)} icon="home" content="Início" />
      <SidebarOption to={routePaths.solarPanelsFeed(LANG)} icon="search" content="Painéis solares" />
      <SidebarOption to={routePaths.ownCompanyProfile(LANG)} icon="user" content="Perfil" />
      <SidebarOption to={routePaths.designSystem(LANG)} icon="settings" content="Configurações" />
    </>
  );
}

export const Default: Story = {
  render: () => (
    <div className="flex h-screen">
      <Sidebar>
        <Options />
      </Sidebar>
    </div>
  ),
};

export const Collapsed: Story = {
  render: () => (
    <div className="flex h-screen">
      <Sidebar defaultCollapsed>
        <Options />
      </Sidebar>
    </div>
  ),
};
