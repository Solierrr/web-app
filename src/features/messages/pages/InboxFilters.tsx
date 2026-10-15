import { useCallback, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Input from "@@/ui/input/Input";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import { ContextMenu, type ContextMenuHandle } from "@@/overlay/contextMenu/ContextMenu";
import type { ConversationDto } from "@/features/messages/messages.messenger.api";

export type ConversationFilter = "ALL" | ConversationDto["conversationType"];

interface InboxFiltersProps {
  query: string;
  onQueryChange: (query: string) => void;
  filter: ConversationFilter;
  onFilterChange: (filter: ConversationFilter) => void;
}

export default function InboxFilters({ query, onQueryChange, filter, onFilterChange }: InboxFiltersProps) {
  const { t } = useTranslation("chat");
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<ContextMenuHandle>(null);
  const [open, setOpen] = useState(false);
  const close = useCallback(() => {
    setOpen(false);
    trigger.current?.focus();
  }, []);

  return (
    <div className="flex min-w-0 items-center rounded-medium bg-input-bg pr-1">
      <Input
        name={t("searchConversations")}
        placeholder={t("searchConversations")}
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        icon={{ name: "search", inverse: true }}
        className="min-w-0 flex-1 bg-transparent! [&_input]:min-w-0 [&_input]:text-body"
      />
      <ToolbarAction
        ref={trigger}
        icon="filter"
        label={t("filterConversations")}
        color={filter === "ALL" ? "var(--color-input-icon)" : "var(--color-operational-ink)"}
        backgroundColor="transparent"
        hoverBackgroundColor="transparent"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => {
          if (open) {
            menu.current?.close();
            return;
          }
          const bounds = trigger.current?.getBoundingClientRect();
          if (!bounds) return;
          setOpen(true);
          menu.current?.open(
            (["ALL", "DIRECT", "GROUP", "CHAT_BOT"] as const).map((type) => ({
              label: t(`filters.${type}`),
              icon: filter === type ? "check" : undefined,
              onClick: () => onFilterChange(type),
            })),
            bounds.right,
            bounds.bottom + 4,
          );
        }}
      />
      <ContextMenu ref={menu} id={id} label={t("filterConversations")} autoFocus triggerRef={trigger} align="end" onClose={close} />
    </div>
  );
}
