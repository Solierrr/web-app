import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import Popover from "./Popover";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import Input from "@@/ui/input/Input";

function Preview() {
  const anchor = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  return (
    <div className="p-6">
      <ToolbarAction ref={anchor} icon="filter" label="Filtros" content="Filtros" onClick={() => setOpen(!open)} />
      {open && (
        <Popover label="Filtros" anchorRef={anchor} onClose={() => setOpen(false)}>
          <Input name="Marca" placeholder="Buscar marca" />
          <ToolbarAction icon="x" label="Fechar" onClick={() => setOpen(false)} />
        </Popover>
      )}
    </div>
  );
}
const meta = { title: "Overlay/Popover", component: Preview } satisfies Meta<typeof Preview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
