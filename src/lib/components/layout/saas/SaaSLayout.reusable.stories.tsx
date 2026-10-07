import type { Meta, StoryObj } from "@storybook/react-vite";
import { SaaSNavigation, SaaSAccountNavigation } from "./SaaSLayout.reusable";
import { groups, language } from "../../../../../.storybook/fixtures";
import { fn } from "storybook/test";
const meta = {
  title: "Layout/SaaS/Navigation",
  component: SaaSNavigation,
  subcomponents: { SaaSAccountNavigation },
  args: { groups, lang: language, collapsed: false, context: "storybook-company", onNavigate: fn() },
  decorators: [
    (Story, { args }) => (
      <div className={`flex h-120 flex-col ${args.collapsed ? "w-16" : "w-64"}`}>
        <Story />
      </div>
    ),
  ],
  parameters: { router: { path: "/pt-BR/projetos" } },
} satisfies Meta<typeof SaaSNavigation>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Collapsed: Story = { args: { collapsed: true } };
export const Account: Story = { render: () => <SaaSAccountNavigation collapsed={false} signingOut={false} onLogout={fn(async () => undefined)} /> };
export const SigningOut: Story = { render: () => <SaaSAccountNavigation collapsed={false} signingOut onLogout={fn(async () => undefined)} /> };
