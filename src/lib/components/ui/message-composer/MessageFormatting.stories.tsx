import { useRef } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import MessageFormatting from "./MessageFormatting";
function Example() {
  const anchor = useRef<HTMLDivElement>(null);
  return (
    <div className="p-12 pt-32">
      <div ref={anchor} className="rounded-medium bg-input-bg p-3">
        Texto selecionado
      </div>
      <MessageFormatting anchorRef={anchor} onClose={() => undefined} onFormat={() => undefined} />
    </div>
  );
}
const meta = {
  title: "UI/MessageFormatting",
  component: MessageFormatting,
  args: { anchorRef: { current: null }, onClose: () => undefined, onFormat: () => undefined },
  render: () => <Example />,
} satisfies Meta<typeof MessageFormatting>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Toolbar: Story = {};
