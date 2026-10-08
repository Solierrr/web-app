import type { Meta, StoryObj } from "@storybook/react-vite";
import Surface from "./Surface";

const meta = { title: "UI/Surface", component: Surface } satisfies Meta<typeof Surface>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: { children: <div className="p-8 text-center text-body">Conteúdo com moldura branca e sombra suave</div> },
};
