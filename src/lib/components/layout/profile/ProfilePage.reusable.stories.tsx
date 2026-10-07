import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProfileInfoSection, ProfileInfoRow, ProfileEditForm } from "./ProfilePage.reusable";
import { fn } from "storybook/test";
const meta = {
  title: "Layout/Profile/Information",
  component: ProfileInfoSection,
  subcomponents: { ProfileInfoRow, ProfileEditForm },
  args: {
    title: "Contato",
    description: "Informações do profissional",
    children: (
      <dl>
        <ProfileInfoRow label="Nome" value="Ana Silva" />
        <ProfileInfoRow label="E-mail" value="ana@solaria.test" />
        <ProfileInfoRow label="Não preenchido" value={null} />
      </dl>
    ),
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-operational-form">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProfileInfoSection>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Information: Story = {};
const fields = [
  { name: "name", label: "Nome", value: "Ana Silva", required: true },
  { name: "email", label: "E-mail", value: "ana@solaria.test", type: "email" as const },
];
export const Edit: Story = { render: () => <ProfileEditForm title="Editar contato" fields={fields} onCancel={fn()} onSave={fn()} /> };
export const Saving: Story = { render: () => <ProfileEditForm title="Editar contato" fields={fields} onCancel={fn()} onSave={fn()} saving /> };
export const Error: Story = {
  render: () => (
    <ProfileEditForm title="Editar contato" fields={fields} onCancel={fn()} onSave={fn()} error="Não foi possível salvar. Tente novamente." />
  ),
};
