import type { Message } from "@/features/messages/messages";
import type { User } from "@/features/users/user/user";
import { useTranslation } from "react-i18next";

interface MessageProps {
  message: Message;
  owner: User;
  placeholderAvatar?: boolean;
}

export default function Message({ message, owner, placeholderAvatar = false }: MessageProps) {
  const { i18n, t } = useTranslation("chat");
  const own = message.user.id === owner.id;
  const hour = new Intl.DateTimeFormat(i18n.resolvedLanguage ?? i18n.language, { hour: "2-digit", minute: "2-digit" }).format(message.time);

  return (
    <article className={`flex min-w-0 gap-3 ${own ? "justify-end" : "justify-start"}`}>
      {!own && (
        <div aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-medium bg-input-bg text-lower">
          {!placeholderAvatar && message.user.name.slice(0, 1).toLocaleUpperCase()}
        </div>
      )}
      <div className={`flex min-w-0 max-w-full flex-col gap-1 ${own ? "items-end" : "items-start"}`}>
        <span className="text-lower font-medium text-operational-muted">{own ? t("you") : message.user.name}</span>
        <div className={`min-w-0 max-w-full rounded-hard px-4 py-3 ${own ? "bg-input-bg" : "bg-white"}`}>
          {message.message && <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-body leading-relaxed">{message.message}</p>}
          {message.attachments?.map((attachment) => (
            <a
              key={attachment.id}
              href={attachment.url}
              download={attachment.name}
              className="mt-2 flex min-w-0 flex-col gap-2 rounded-medium bg-white p-2 text-lower">
              {attachment.type.startsWith("image/") && (
                <img src={attachment.url} alt={attachment.name} className="max-h-40 max-w-full rounded-medium object-contain" />
              )}
              <span className="break-all text-lower">{attachment.name}</span>
            </a>
          ))}
        </div>
        <time dateTime={message.time.toISOString()} className="px-1 text-lower text-operational-muted">
          {hour}
        </time>
      </div>
    </article>
  );
}
