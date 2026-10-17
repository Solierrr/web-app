import type { Meta, StoryObj } from "@storybook/react-vite";
import SidePanel from "./SidePanel";
import { useState, type ComponentProps } from "react";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import { fn, expect, userEvent } from "storybook/test";
function Interactive(args: ComponentProps<typeof SidePanel>) {
  const [open, setOpen] = useState(args.open);
  return (
    <div className="flex h-screen bg-operational-surface">
      <main className="flex-1 p-6">
        <ToolbarAction icon="document" label="Abrir documentos" content="Abrir documentos" onClick={() => setOpen(true)} />
      </main>
      <SidePanel
        {...args}
        open={open}
        onClose={() => {
          setOpen(false);
          args.onClose();
        }}
      />
    </div>
  );
}
const meta = {
  title: "Layout/SidePanel",
  component: SidePanel,
  parameters: { layout: "fullscreen" },
  render: (args) => <Interactive {...args} />,
  args: {
    open: false,
    title: "Documentos do cadastro",
    closeLabel: "Fechar painel",
    onClose: fn(),
    children: (
      <div className="overflow-auto p-6">
        <h3 className="font-semi-bold">Certificado profissional</h3>
        <p className="mt-3 text-operational-muted">Selecione um documento para revisar o cadastro.</p>
      </div>
    ),
  },
} satisfies Meta<typeof SidePanel>;
export default meta;
type Story = StoryObj<typeof meta>;
export const InteractivePanel: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Abrir documentos" }));
    await expect(canvas.getByRole("complementary")).toHaveAttribute("aria-hidden", "false");
    await userEvent.click(canvas.getByRole("button", { name: "Fechar painel" }));
    await expect(canvas.getByRole("complementary", { hidden: true })).toHaveAttribute("aria-hidden", "true");
  },
};
export const Open: Story = { args: { open: true } };
export const DocumentReview: Story = { args: { open: true, wide: true } };
export const Busy: Story = { args: { open: true, wide: true, closeDisabled: true } };
