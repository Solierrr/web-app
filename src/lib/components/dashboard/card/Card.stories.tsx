import type { Meta, StoryObj } from "@storybook/react-vite";
import DashboardCard from "./Card";
const meta = {
  title: "Dashboard/Card",
  component: DashboardCard,
  args: { title: "Geração de energia", description: "Últimos 30 dias", children: <p className="text-operational-title font-semi-bold">1.240 kWh</p> },
  decorators: [
    (Story) => (
      <div className="w-full max-w-120">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DashboardCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Compact: Story = { args: { compact: true } };
export const Loading: Story = { args: { loading: true } };
export const Empty: Story = { args: { empty: true } };
export const Error: Story = { args: { error: "Não foi possível carregar as medições." } };
