import { useTranslation } from "react-i18next";

import MessageBubble from "@@/layout/chat/message/MessageBubble";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import type { PendingMessage } from "@/features/messages/messages.hooks";

export function PendingBubble({
  item,
  author,
  locale,
  conversationKind,
  onRetry,
  onDiscard,
}: {
  item: PendingMessage;
  author: string;
  locale: string;
  conversationKind: "direct" | "group" | "assistant";
  onRetry: (clientMessageId: string) => void;
  onDiscard: (clientMessageId: string) => void;
}) {
  const { t } = useTranslation("chat");
  const failed = item.status === "failed";
  return (
    <MessageBubble
      conversationKind={conversationKind}
      content={item.content}
      timestamp={item.createdAt}
      locale={locale}
      author={author}
      own
      endOfGroup={false}>
      <div className="flex flex-wrap items-center gap-2" aria-live="polite">
        <span role={failed ? "alert" : "status"} className="text-sidebar-group text-(--message-muted)">
          {failed ? (item.reason ?? t("outbox.failed")) : t(conversationKind === "assistant" ? "outbox.waitingAssistant" : "outbox.sending")}
        </span>
        {failed && (
          <>
            <ToolbarAction
              icon="refresh"
              label={t("outbox.retry")}
              content={t("outbox.retry")}
              color="var(--color-white)"
              hoverColor="var(--color-white)"
              onClick={() => onRetry(item.clientMessageId)}
              className="h-7!"
            />
            <ToolbarAction
              label={t("outbox.discard")}
              content={t("outbox.discard")}
              color="var(--color-white)"
              hoverColor="var(--color-white)"
              onClick={() => onDiscard(item.clientMessageId)}
              className="h-7!"
            />
          </>
        )}
      </div>
    </MessageBubble>
  );
}

export function AssistantNotice({ status, onRetry }: { status: "thinking" | "timeout"; onRetry: () => void }) {
  const { t } = useTranslation("chat", { keyPrefix: "chatbot" });
  if (status === "thinking") {
    return (
      <p role="status" className="mx-auto w-full max-w-3xl animate-pulse px-1 pt-4 text-body text-operational-muted motion-reduce:animate-none">
        {t("thinking")}
      </p>
    );
  }
  return (
    <div role="alert" className="mx-auto flex w-full max-w-3xl flex-wrap items-center gap-2 px-1 pt-4 text-body text-operational-ink">
      <span>{t("timeout")}</span>
      <ToolbarAction label={t("retry")} content={t("retry")} onClick={onRetry} />
    </div>
  );
}

/** Rodapé da bolha própria: marca "editada" e oferece editar ou excluir enquanto a mensagem está na janela. */
export function MessageMeta({ edited, onEdit, onDelete }: { edited: boolean; onEdit?: () => void; onDelete?: () => void }) {
  const { t } = useTranslation("chat");
  if (!edited && !onEdit) return null;
  return (
    <div className="flex flex-wrap items-center gap-1">
      {edited && <span className="text-sidebar-group text-(--message-muted)">{t("edited")}</span>}
      {onEdit && (
        <ToolbarAction
          icon="edit"
          label={t("editMessage")}
          color="var(--color-white)"
          hoverColor="var(--color-white)"
          onClick={onEdit}
          className="size-7!"
        />
      )}
      {onDelete && (
        <ToolbarAction
          icon="trash"
          label={t("deleteMessage")}
          color="var(--color-white)"
          hoverColor="var(--color-white)"
          onClick={onDelete}
          className="size-7!"
        />
      )}
    </div>
  );
}

export function EditBanner({ onCancel }: { onCancel: () => void }) {
  const { t } = useTranslation("chat");
  return (
    <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-2 px-2 text-body text-operational-muted">
      <span role="status">{t("editing")}</span>
      <ToolbarAction label={t("cancelEdit")} content={t("cancelEdit")} onClick={onCancel} />
    </div>
  );
}
