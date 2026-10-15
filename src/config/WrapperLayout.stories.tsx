import type { Meta, StoryObj } from "@storybook/react-vite";
import WrapperLayout from "./WrapperLayout";
import Surface from "@@/ui/surface/Surface";
const meta = {
  title: "Layout/Wrapper",
  component: WrapperLayout,
  parameters: { layout: "fullscreen" },
  args: {
    children: (
      <Surface>
        <div className="p-6">Área de conteúdo com o espaçamento do layout público.</div>
      </Surface>
    ),
  },
} satisfies Meta<typeof WrapperLayout>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const TopSpacing: Story = { args: { ptop: true } };
