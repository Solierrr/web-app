import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import Confirmation from "./Confirmation";
import { PrimaryButton } from "@@/ui/button/Button.presets";

const meta = {
  title: "Overlay/Confirmation",
  component: Confirmation,
  args: { title: "Confirmar a\u00e7\u00e3o", message: "Deseja continuar?", busy: false, onConfirm: () => {}, onCancel: () => {} },
} satisfies Meta<typeof Confirmation>;
export default meta;
type Story = StoryObj<typeof meta>;

function Preview(args: Parameters<typeof Confirmation>[0]) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <PrimaryButton content="Abrir confirma\u00e7\u00e3o" description="Abrir confirma\u00e7\u00e3o" onClick={() => setOpen(true)} />
      {open && <Confirmation {...args} onConfirm={() => setOpen(false)} onCancel={() => setOpen(false)} />}
    </>
  );
}
export const Default: Story = { render: (args) => <Preview {...args} /> };
export const Processing: Story = { args: { busy: true }, render: (args) => <Preview {...args} /> };
