import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import MessageBubble from "@@/layout/chat/message/MessageBubble";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import type { PendingMessage } from "@/features/messages/messages.hooks";
import { downloadAttachment, isExpired, type AttachmentDto } from "@/features/messages/messages.messenger.media";

/**
 * Anexo dentro da bolha. Foto baixa sozinha ao aparecer; áudio, vídeo e arquivo esperam o toque. O arquivo baixado vira um
 * endereço local do navegador, liberado quando a bolha sai da tela.
 */
export function AttachmentView({ attachment }: { attachment: AttachmentDto }) {
  const { t } = useTranslation("chat", { keyPrefix: "media" });
  const automatic = attachment.type === "IMAGE" && !isExpired(attachment);
  const [url, setUrl] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "unavailable">(isExpired(attachment) ? "unavailable" : automatic ? "loading" : "idle");
  const name = attachment.name || t("file");

  function fetchFile() {
    downloadAttachment(attachment).then(
      (blob) => {
        setUrl(URL.createObjectURL(blob));
        setState("idle");
      },
      () => setState("unavailable"),
    );
  }
  function load() {
    setState("loading");
    fetchFile();
  }

  useEffect(() => {
    if (automatic) fetchFile();
    // Só a primeira montagem dispara o download automático da foto.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );

  if (attachment.type === "LOCATION") {
    const href = `https://www.openstreetmap.org/?mlat=${attachment.latitude}&mlon=${attachment.longitude}#map=17/${attachment.latitude}/${attachment.longitude}`;
    return (
      <a href={href} target="_blank" rel="noreferrer" className="text-body underline">
        {attachment.label || t("locationLink")}
      </a>
    );
  }
  if (state === "unavailable") return <span className="text-sidebar-group text-(--message-muted)">{t("unavailable")}</span>;
  if (state === "loading")
    return (
      <span role="status" className="text-sidebar-group text-(--message-muted)">
        {t("loading")}
      </span>
    );
  if (url && attachment.type === "IMAGE")
    return <img src={url} alt={name} width={attachment.width} height={attachment.height} className="max-h-80 max-w-full rounded-medium" />;
  // Áudio e vídeo são enviados por pessoas e não vêm com legenda; não há o que apontar em <track>.
  /* eslint-disable jsx-a11y/media-has-caption */
  if (url && attachment.type === "AUDIO") return <audio controls src={url} aria-label={name} />;
  if (url && attachment.type === "VIDEO") return <video controls src={url} aria-label={name} className="max-h-80 max-w-full rounded-medium" />;
  /* eslint-enable jsx-a11y/media-has-caption */
  if (url) {
    return (
      <a href={url} download={name} className="text-body underline">
        {name}
      </a>
    );
  }
  return (
    <ToolbarAction
      icon="download"
      label={t("download", { name })}
      content={name}
      color="var(--color-white)"
      hoverColor="var(--color-white)"
      onClick={() => void load()}
      className="h-7!"
    />
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
