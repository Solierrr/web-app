import type { Meta, StoryObj } from "@storybook/react-vite";
import Dialog from "./Dialog";
import { PrimaryButton, WhiteSolidButton } from "@@/ui/button/Button.presets";
import { useState, type ComponentProps } from "react";
import Input from "@@/ui/input/Input";
import { fn, expect, userEvent, within, waitFor } from "storybook/test";
function Interactive(args: ComponentProps<typeof Dialog>) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <PrimaryButton content="Abrir popup" description="Abrir popup" onClick={() => setOpen(true)} />
      {open && (
        <Dialog
          {...args}
          onClose={() => {
            setOpen(false);
            args.onClose();
          }}>
          {(dismiss) => (
            <div className="flex flex-col gap-4">
              <Input name="name" placeholder="Nome da marca" />
              <WhiteSolidButton content="Cancelar" description="Cancelar" className="w-full" onClick={dismiss} />
            </div>
          )}
        </Dialog>
      )}
    </>
  );
}
const meta = {
  title: "Overlay/Dialog",
  component: Dialog,
  render: (args) => <Interactive {...args} />,
  args: { title: "Cadastrar marca", message: "Preencha as informações para continuar.", children: null, onClose: fn() },
} satisfies Meta<typeof Dialog>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Abrir popup" }));
    await waitFor(() => expect(within(document.body).getByRole("dialog")).toBeVisible());
    await userEvent.keyboard("{Escape}");
  },
};
export const Compact: Story = { args: { compact: true } };
export const Busy: Story = { args: { busy: true, message: "Aguarde enquanto as informações são salvas." } };
