import MarkdownMessage from "./MarkdownMessage";
import type { CSSProperties, ReactNode } from "react";
export type ConversationKind = "direct" | "group" | "assistant";

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
  presentation?: "bubbles" | "timeline";
  grouped?: boolean;
  conversationKind?: ConversationKind;
}
export default function MessageBubble({
  content,
  author,
  timestamp,
  locale,
  own = false,
  assistant = false,
  showAuthor = false,
  children,
  presentation = "bubbles",
  grouped = false,
  conversationKind = "direct",
}: MessageBubbleProps) {
  const messageStyle = {
    "--message-ink": own ? "var(--color-chat-on-sent)" : "var(--color-chat-on-received)",
    "--message-muted": own ? "var(--color-chat-sent-muted)" : "var(--color-operational-muted)",
    "--message-link": own ? "var(--color-chat-sent-link)" : "var(--color-chat-received-link)",
  } as CSSProperties;
  const hour = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(new Date(timestamp));
  if (presentation === "timeline") {
    return (
      <article aria-label={author} className={`min-w-0 px-1 ${grouped ? "py-1" : "pb-2 pt-5 first:pt-1"}`}>
        {conversationKind === "group" && (
          <div className={`mb-1 flex flex-wrap items-baseline gap-x-3 gap-y-1 ${grouped ? "sr-only" : ""}`}>
            <h3 className="text-sidebar font-semi-bold text-operational-ink">{author}</h3>
            <time dateTime={timestamp} className="text-sidebar-group text-operational-muted">
              {hour}
            </time>
          </div>
        )}
        {content && <MarkdownMessage content={content} />}
        {children}
        {conversationKind === "direct" && (
          <time dateTime={timestamp} className="mt-1 block text-right text-sidebar-group text-operational-muted">
            {hour}
          </time>
        )}
      </article>
    );
  }
  return (
    <article aria-label={author} className={`flex min-w-0 max-w-full gap-3 ${own ? "justify-end" : "justify-start"}`}>
      <div
        style={messageStyle}
        className={`flex min-w-0 flex-col gap-2 rounded-medium px-4 py-3 ${own ? "max-w-[85%] bg-chat-sent sm:max-w-[75%]" : assistant ? "w-full bg-chat-received" : "max-w-[85%] bg-chat-received sm:max-w-[75%]"}`}>
        {conversationKind === "group" && showAuthor && !own && (
          <p className="break-words text-sidebar font-semi-bold text-operational-ink">{author}</p>
        )}
        {content && <MarkdownMessage content={content} />}
        {children}
        {conversationKind !== "assistant" && (
          <time
            dateTime={timestamp}
            className="self-end text-sidebar-group text-[color:var(--message-muted)]"
            title={new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(timestamp))}>
            {hour}
          </time>
        )}
      </div>
    </article>
  );
}
