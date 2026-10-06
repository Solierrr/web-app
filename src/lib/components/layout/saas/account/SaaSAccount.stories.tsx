import type { Meta, StoryObj } from "@storybook/react-vite";
import SaaSAccount from "./SaaSAccount";
const meta = { title: "Layout/SaaS/Account", component: SaaSAccount, args: { email: "ana@solaria.test" } } satisfies Meta<typeof SaaSAccount>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Personal: Story = {};
export const Managed: Story = { args: { managedCompanyName: "Aurora Solar" } };
