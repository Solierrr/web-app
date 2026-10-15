import type { Meta, StoryObj } from "@storybook/react-vite";
import Tooltip from "./Tooltip";
const meta = {
  title: "Feedback/Tooltip",
  component: Tooltip,
  parameters: { layout: "centered" },
  args: { label: "Formato e limites", content: "JPEG, PNG ou WebP, até 8 MB por imagem." },
} satisfies Meta<typeof Tooltip>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
