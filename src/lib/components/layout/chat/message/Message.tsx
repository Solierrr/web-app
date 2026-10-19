import type { Message } from "@/features/messages/messages";
import type { User } from "@/features/users/user/user";
import { useTranslation } from "react-i18next";
import MessageBubble, { type ConversationKind } from "./MessageBubble";

interface MessageProps {
  message: Message;
  owner: User;
  placeholderAvatar?: boolean;
  presentation?: "bubbles" | "timeline";
  grouped?: boolean;
  conversationKind?: ConversationKind;
}

export default function Message({
  message,
  owner,
  placeholderAvatar = false,
  presentation = "bubbles",
  grouped = false,
  conversationKind = "direct",
}: MessageProps) {
  const { i18n, t } = useTranslation("chat");
  const own = message.user.id === owner.id;
  return (
    <MessageBubble
      conversationKind={conversationKind}
      presentation={presentation}
      grouped={grouped}
      own={own}
      author={own && presentation === "bubbles" ? t("you") : message.user.name}
      content={message.message}
      timestamp={message.time.toISOString()}
      locale={i18n.resolvedLanguage ?? i18n.language}
      assistant={placeholderAvatar}
      placeholderAvatar={placeholderAvatar}>
      {message.attachments?.map((attachment) => (
        <a
          key={attachment.id}
          href={attachment.url}
          download={attachment.name}
          className="mt-2 flex min-w-0 flex-col gap-2 rounded-medium bg-white p-2 text-body">
          {attachment.type.startsWith("image/") && (
            <img src={attachment.url} alt={attachment.name} className="max-h-40 max-w-full rounded-medium object-contain" />
          )}
          <span className="break-all text-body">{attachment.name}</span>
        </a>
      ))}
    </MessageBubble>
  );
}
