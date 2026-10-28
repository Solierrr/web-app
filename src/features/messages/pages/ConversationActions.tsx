import { useRef } from "react";
import { useTranslation } from "react-i18next";
import GroupAction from "@@/ui/button/GroupAction";
import SurfaceGroup from "@@/ui/surface/SurfaceGroup";
import { ContextMenu, type ContextMenuHandle } from "@@/overlay/contextMenu/ContextMenu";

/** Grupo de ícones do topo da conversa (mesmo formato da tela do assistente): nova conversa e, quando há uma conversa aberta, suas opções. */
export default function ConversationActions({ onNew, onDelete }: { onNew: () => void; onDelete?: () => void }) {
  const { t } = useTranslation("chat");
  const menu = useRef<ContextMenuHandle>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  return (
    <SurfaceGroup direction="horizontal" divided={false} role="group" aria-label={t("conversationOptions")} className="shrink-0">
      <GroupAction layout="icon" icon="newConversation" label={t("newConversation")} onClick={onNew} />
      {onDelete && (
        <GroupAction
          ref={trigger}
          layout="icon"
          icon="more"
          label={t("conversationOptions")}
          aria-haspopup="menu"
          onClick={() => {
            const bounds = trigger.current?.getBoundingClientRect();
            if (bounds) menu.current?.open([{ label: t("deleteConversation"), icon: "trash", onClick: onDelete }], bounds.right, bounds.bottom + 4);
          }}
        />
      )}
      <ContextMenu ref={menu} label={t("conversationOptions")} autoFocus triggerRef={trigger} align="end" />
    </SurfaceGroup>
  );
}
