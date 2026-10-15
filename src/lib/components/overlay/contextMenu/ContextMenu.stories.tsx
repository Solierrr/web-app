import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContextMenu, type ContextMenuHandle } from "./ContextMenu";
import { ContextMenuProvider } from "./provider/ContextMenuProvider";
import { useContextMenu } from "./useContextMenu";
import { useRef } from "react";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import { fn } from "storybook/test";
const select = fn();
function Direct() {
  const menu = useRef<ContextMenuHandle>(null);
  return (
    <>
      <ToolbarAction
        icon="more"
        label="Opções"
        content="Opções"
        onClick={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          menu.current?.open(
            [
              { label: "Visualizar", icon: "eye", onClick: select },
              { label: "Editar", icon: "edit", onClick: select },
              { label: "Remover", icon: "trash", onClick: select },
              { label: "Indisponível", disabled: true, onClick: select },
            ],
            rect.left,
            rect.bottom,
          );
        }}
      />
      <ContextMenu ref={menu} label="Opções do registro" autoFocus />
    </>
  );
}
function Shared() {
  const menu = useContextMenu();
  return (
    <ToolbarAction
      icon="more"
      label="Menu compartilhado"
      content="Menu compartilhado"
      onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        menu.open([{ label: "Editar", icon: "edit", onClick: select }], rect.left, rect.bottom);
      }}
    />
  );
}
const meta = { title: "Overlay/ContextMenu", component: ContextMenu, subcomponents: { ContextMenuProvider } } satisfies Meta<typeof ContextMenu>;
export default meta;
type Story = StoryObj<typeof meta>;
export const DirectMenu: Story = { render: () => <Direct /> };
export const SharedProvider: Story = {
  render: () => (
    <ContextMenuProvider>
      <Shared />
    </ContextMenuProvider>
  ),
};
