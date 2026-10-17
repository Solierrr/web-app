import type { Meta, StoryObj } from "@storybook/react-vite";
import Access from "./Access";
import { fn } from "storybook/test";
const meta = {
  title: "Layout/Access",
  component: Access,
  parameters: { layout: "fullscreen" },
  args: {
    heading: "Bem-vindo de volta",
    fields: [
      { name: "email", label: "E-mail", placeholder: "seuemail@empresa.com", type: "email" },
      { name: "password", label: "Senha", placeholder: "Sua senha", password: true },
    ],
    submitLabel: "Entrar",
    onSubmit: fn(),
  },
} satisfies Meta<typeof Access>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Login: Story = {};
export const Compact: Story = { args: { compact: true } };
export const Busy: Story = { args: { busy: true } };
export const Error: Story = { args: { error: "Não foi possível entrar. Confira suas informações." } };
export const WithoutCanvas: Story = { args: { animatedBackground: false } };
