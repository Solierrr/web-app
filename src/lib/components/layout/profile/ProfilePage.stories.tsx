import type { Meta, StoryObj } from "@storybook/react-vite";
import ProfilePage from "./ProfilePage";
import { ProfileInfoSection, ProfileInfoRow } from "./ProfilePage.reusable";
import { PrimaryButton } from "@@/ui/button/Button.presets";
import { avatar, banner } from "../../../../../.storybook/fixtures";
const meta = {
  title: "Layout/Profile/Page",
  component: ProfilePage,
  parameters: { layout: "fullscreen" },
  args: {
    name: "Aurora Solar",
    subtitle: "Instalação e manutenção de sistemas fotovoltaicos",
    bannerUrl: banner,
    avatarUrl: avatar,
    actions: <PrimaryButton content="Editar perfil" description="Editar perfil" />,
    children: (
      <ProfileInfoSection title="Informações gerais">
        <dl>
          <ProfileInfoRow label="Especialidade" value="Energia solar" />
          <ProfileInfoRow label="Cidade" value="São Paulo / SP" />
        </dl>
      </ProfileInfoSection>
    ),
  },
} satisfies Meta<typeof ProfilePage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Public: Story = {};
export const Operational: Story = { args: { operational: true, operationalTitle: "Perfil da empresa" } };
