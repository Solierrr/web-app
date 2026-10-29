import { useTranslation } from "react-i18next";

import MessageBubble from "@@/layout/chat/message/MessageBubble";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import type { PendingMessage } from "@/features/messages/messages.hooks";
import type { ConnectionState } from "@/features/messages/messages.messenger.realtime";

export function ConnectionNotice({ connection }: { connection: ConnectionState }) {
  const { t } = useTranslation("chat");
  if (connection.status === "unavailable") {
    return (
      <p role="status" className="text-body text-operational-muted">
        {t("realtimeUnavailable")}
      </p>
    );
  }
  if (connection.status !== "connecting" && connection.status !== "reconnecting") return null;
  return (
    <p role="status" className="text-body text-operational-muted">
      {connection.attempts >= 2 ? t("realtimeWaking") : t("realtimeReconnecting")}
    </p>
  );
}

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
          {failed ? t("outbox.failed") : t("outbox.sending")}
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
