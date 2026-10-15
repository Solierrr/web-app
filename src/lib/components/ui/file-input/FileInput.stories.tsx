import type { Meta, StoryObj } from "@storybook/react-vite";
import FileInput from "./FileInput";
import { useState, type ComponentProps } from "react";
import { fn } from "storybook/test";
function Interactive(args: ComponentProps<typeof FileInput>) {
  const [result, setResult] = useState("Nenhum documento selecionado");
  return (
    <div className="flex flex-col gap-3">
      <FileInput
        {...args}
        onChange={(file) => {
          setResult(file.name);
          args.onChange(file);
        }}
        onError={(message) => {
          setResult(message);
          args.onError(message);
        }}
      />
      <p role="status">{result}</p>
    </div>
  );
}
const meta = {
  title: "UI/FileInput",
  component: FileInput,
  render: (args) => <Interactive {...args} />,
  args: {
    name: "document",
    label: "Selecionar documento",
    allowedTypes: ["application/pdf"],
    maxBytes: 1024 * 1024,
    invalidMessage: "Selecione um PDF de até 1 MB.",
    onChange: fn(),
    onError: fn(),
  },
} satisfies Meta<typeof FileInput>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
