import type { Meta, StoryObj } from "@storybook/react-vite";
import InputGroup from "./InputGroup";
import Input from "../input/Input";
const meta = {
  title: "UI/InputGroup",
  component: InputGroup,
  args: {
    label: "Dimensões",
    children: (
      <>
        <label>
          Largura
          <Input name="width" type="number" suffix="m" />
        </label>
        <label>
          Comprimento
          <Input name="length" type="number" suffix="m" />
        </label>
      </>
    ),
  },
} satisfies Meta<typeof InputGroup>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
