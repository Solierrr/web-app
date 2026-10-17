import MarkdownMessage from "./MarkdownMessage";
import type { ReactNode } from "react";
import Icon from "@@/ui/icon/Icon";
export interface MessageBubbleProps {
  content?: string;
  author: string;
  timestamp: string;
  locale: string;
  own?: boolean;
  assistant?: boolean;
  showAuthor?: boolean;
  placeholderAvatar?: boolean;
  children?: ReactNode;
}
export default function MessageBubble({
  content,
  author,
  timestamp,
  locale,
  own = false,
  assistant = false,
  showAuthor = true,
  placeholderAvatar = false,
  children,
}: MessageBubbleProps) {
  const hour = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(new Date(timestamp));
  return (
    <article className={`flex min-w-0 max-w-full gap-3 ${own ? "justify-end" : "justify-start"}`}>
      {!own && (
        <span
          aria-hidden="true"
          className={`flex size-9 shrink-0 items-center justify-center self-end rounded-medium text-body font-semi-bold text-operational-muted ${showAuthor ? "bg-white" : "bg-transparent"}`}>
          {showAuthor &&
            (assistant ? <Icon name="sparkles" size={20} /> : !placeholderAvatar ? author.trim().slice(0, 1).toLocaleUpperCase(locale) : null)}
        </span>
      )}
      <div className={`flex min-w-0 max-w-[85%] flex-col gap-2 rounded-medium px-4 py-3 sm:max-w-[75%] ${own ? "bg-white" : "bg-input-bg"}`}>
        {showAuthor && <p className={`break-words text-body font-semi-bold ${own ? "text-orange" : "text-operational-ink"}`}>{author}</p>}
        {content && <MarkdownMessage content={content} />}
        {children}
        <time
          dateTime={timestamp}
          className="self-end text-body text-operational-muted"
          title={new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(timestamp))}>
          {hour}
        </time>
      </div>
    </article>
  );
}
