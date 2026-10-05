import type { Meta, StoryObj } from "@storybook/react-vite";
import MessageComposer from "./MessageComposer";
import { useState, type ComponentProps } from "react";
import { fn, expect, userEvent, within, waitFor } from "storybook/test";
function Interactive(args: ComponentProps<typeof MessageComposer>) {
  const [value, setValue] = useState(args.value);
  return (
    <div className="w-full max-w-160">
      <MessageComposer
        {...args}
        value={value}
        onChange={setValue}
        onSend={() => {
          args.onSend();
          setValue("");
        }}
      />
    </div>
  );
}
const meta = {
  title: "UI/MessageComposer",
  component: MessageComposer,
  render: (args) => <Interactive {...args} />,
  args: {
    value: "",
    onChange: fn(),
    onSend: fn(),
    placeholder: "Escreva uma mensagem...",
    label: "Mensagem",
    sendLabel: "Enviar mensagem",
    hint: "Enter envia; Shift + Enter insere uma nova linha.",
  },
} satisfies Meta<typeof MessageComposer>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvas, args }) => {
    const input = canvas.getByRole("textbox");
    await expect(canvas.getByRole("button", { name: "Enviar mensagem" })).toBeDisabled();
    await userEvent.type(input, "Vamos revisar o projeto.");
    await userEvent.click(canvas.getByRole("button", { name: "Enviar mensagem" }));
    await expect(args.onSend).toHaveBeenCalled();
    await expect(input).toHaveValue("");
  },
};
export const Filled: Story = { args: { value: "A instalação está prevista para amanhã." } };
export const Disabled: Story = { args: { disabled: true, value: "Projeto disponível apenas para consulta." } };
export const Compact: Story = { args: { compact: true, active: false } };

export const Formatting: Story = {
  args: { value: "Planejamento da instalação" },
  play: async ({ canvas, canvasElement }) => {
    const input = canvas.getByRole("textbox");
    await userEvent.click(input);
    await userEvent.keyboard("{Control>}a{/Control}");
    const page = within(canvasElement.ownerDocument.body);
    await waitFor(() => expect(page.getByRole("toolbar", { name: "Formatar texto" })).toBeVisible());
    await userEvent.click(page.getByRole("button", { name: "Negrito" }));
    await expect(input).toHaveValue("**Planejamento da instalação**");
  },
};
