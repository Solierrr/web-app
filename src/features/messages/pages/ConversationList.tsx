import { useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Icon from "@@/ui/icon/Icon";
import { ContextMenu, type ContextMenuHandle } from "@@/overlay/contextMenu/ContextMenu";
import { routePaths } from "@/config/i18n/paths";
import type { SupportedLanguage } from "@/config/i18n/browser/languages";
import type { ConversationDto } from "@/features/messages/messages.messenger.api";

function formatInteraction(iso: string, lang: string) {
  const date = new Date(iso);
  const sameDay = date.toDateString() === new Date().toDateString();
  return new Intl.DateTimeFormat(
    lang,
    sameDay ? { hour: "2-digit", minute: "2-digit" } : { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" },
  ).format(date);
}

/** Lista de conversas separadas por divisórias finas, como as listas do gallery. Cada item tem um menu de opções (abrir, excluir). */
export default function ConversationList({
  conversations,
  title,
  lang,
  activeId,
  onOpen,
  onDelete,
}: {
  conversations: ConversationDto[];
  title: (item: ConversationDto) => string;
  lang: SupportedLanguage;
  activeId?: string;
  onOpen: (item: ConversationDto) => void;
  onDelete: (item: ConversationDto) => void;
}) {
  const { t } = useTranslation("chat");
  const menu = useRef<ContextMenuHandle>(null);
  const trigger = useRef<HTMLElement | null>(null);

  function openMenu(item: ConversationDto, button: HTMLElement) {
    trigger.current = button;
    const bounds = button.getBoundingClientRect();
    menu.current?.open(
      [
        { label: t("openConversation"), icon: "messages", onClick: () => onOpen(item) },
        { label: t("deleteConversation"), icon: "trash", onClick: () => onDelete(item) },
      ],
      bounds.right,
      bounds.bottom + 4,
    );
  }

  return (
    <div className="scrollbar-none min-h-0 overflow-y-auto">
      <ul className="flex flex-col divide-y divide-operational-border/60">
        {conversations.map((item) => (
          <li key={item.id} className="group relative">
            <Link
              to={routePaths.chat(lang, item.id)}
              onClick={() => onOpen(item)}
              aria-current={activeId === item.id ? "page" : undefined}
              className={`flex min-h-14 items-center gap-3 py-2 pl-5 pr-14 transition-colors duration-250 hover:bg-operational-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-operational-ink motion-reduce:transition-none ${activeId === item.id ? "bg-operational-hover" : ""}`}>
              <Icon
                name={item.conversationType === "CHAT_BOT" ? "sparkles" : item.conversationType === "GROUP" ? "users" : "user"}
                size={18}
                gradient={item.conversationType === "CHAT_BOT" ? "orange" : undefined}
                className="shrink-0"
              />
              <span className="min-w-0 flex-1">
                <span className={`block truncate text-body ${(item.unreadCount ?? 0) > 0 ? "font-semi-bold" : "font-medium"}`}>{title(item)}</span>
                {item.lastInteractionAt && (
                  <time dateTime={item.lastInteractionAt} className="block truncate text-sidebar text-operational-muted">
                    {formatInteraction(item.lastInteractionAt, lang)}
                  </time>
                )}
              </span>
              {(item.unreadCount ?? 0) > 0 && (
                <span
                  className="min-w-5 shrink-0 rounded-full bg-orange px-1.5 text-center text-sidebar-group font-medium text-white"
                  aria-label={t("unreadCount", { count: item.unreadCount })}>
                  {item.unreadCount}
                </span>
              )}
            </Link>
            <button
              type="button"
              aria-label={`${t("conversationOptions")}: ${title(item)}`}
              aria-haspopup="menu"
              onClick={(event) => openMenu(item, event.currentTarget)}
              className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-operational-muted transition-colors duration-250 hover:bg-operational-hover hover:text-operational-ink focus-visible:outline-2 focus-visible:outline-operational-ink motion-reduce:transition-none">
              <Icon name="more" size={18} color="currentColor" />
            </button>
          </li>
        ))}
      </ul>
      <ContextMenu ref={menu} label={t("conversationOptions")} autoFocus triggerRef={trigger} align="end" />
    </div>
  );
}
