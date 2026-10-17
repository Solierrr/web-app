import { useState, type ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import ImageInput from "./ImageInput";
function Interactive(args: ComponentProps<typeof ImageInput>) {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  return (
    <ImageInput
      {...args}
      files={files}
      error={error}
      onChange={setFiles}
      onError={setError}
      summary={files.length ? `${files.length} fotos selecionadas` : "Nenhuma foto selecionada ainda"}
    />
  );
}
const meta = {
  title: "UI/ImageInput",
  component: ImageInput,
  render: (args) => <Interactive {...args} />,
  args: {
    name: "photos",
    files: [],
    onChange: () => undefined,
    onError: () => undefined,
    label: "Selecionar fotos",
    removeLabel: "Remover imagem",
    invalidMessage: "Selecione uma imagem JPEG, PNG ou WebP até 8 MB.",
    summary: "",
  },
} satisfies Meta<typeof ImageInput>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
