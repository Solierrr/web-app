import { useRef } from "react";
import { useTranslation } from "react-i18next";
import Icon from "@@/ui/icon/Icon";
import { SearchBarAction } from "@@/ui/search-bar/SearchBar";
import { ContextMenu, type ContextMenuHandle } from "@@/overlay/contextMenu/ContextMenu";
import type { ConversationDto } from "@/features/messages/messages.messenger.api";

export type ConversationFilterValue = "ALL" | ConversationDto["conversationType"];

const TYPES: ConversationFilterValue[] = ["ALL", "DIRECT", "GROUP", "CHAT_BOT"];

/** Filtro por tipo de conversa: um ícone na busca que abre um menu; com filtro ativo o ícone fica laranja. */
export default function ConversationFilter({
  value,
  onChange,
}: {
  value: ConversationFilterValue;
  onChange: (value: ConversationFilterValue) => void;
}) {
  const { t } = useTranslation("chat");
  const menu = useRef<ContextMenuHandle>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const active = value !== "ALL";

  return (
    <>
      <SearchBarAction
        ref={trigger}
        glyph={<Icon name="filter" size={20} gradient={active ? "orange" : undefined} className="shrink-0" />}
        label={active ? `${t("filterConversations")}: ${t(`filters.${value}`)}` : t("filterConversations")}
        aria-haspopup="menu"
        active={active}
        onClick={() => {
          const bounds = trigger.current?.getBoundingClientRect();
          if (!bounds) return;
          menu.current?.open(
            TYPES.map((type) => ({ label: t(`filters.${type}`), icon: value === type ? "check" : undefined, onClick: () => onChange(type) })),
            bounds.right,
            bounds.bottom + 4,
          );
        }}
      />
      <ContextMenu ref={menu} label={t("filterConversations")} autoFocus triggerRef={trigger} align="end" />
    </>
  );
}
