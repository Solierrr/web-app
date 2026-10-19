import type { Meta, StoryObj } from "@storybook/react-vite";
import LogoLoader from "./LogoLoader";
const meta = { title: "Feedback/LogoLoader", component: LogoLoader, args: { label: "Carregando informações", size: 8 } } satisfies Meta<
  typeof LogoLoader
>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Small: Story = { args: { size: 2 } };
