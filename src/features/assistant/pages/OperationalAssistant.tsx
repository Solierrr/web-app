import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ChatHeader from "@@/layout/chat/chat-header/ChatHeader";
import ConversationIntro from "@@/layout/chat/conversation-intro/ConversationIntro";
import MessageBubble from "@@/layout/chat/message/MessageBubble";
import MessageComposer from "@@/ui/message-composer/MessageComposer";
import Surface from "@@/ui/surface/Surface";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import { DEFAULT, isSupportedLanguage } from "@/config/i18n/browser/languages";
import {
  answerOperationalProposal,
  discardOperationalMessage,
  resetOperationalConversation,
  retryOperationalMessage,
  sendOperationalMessage,
  useOperationalConversation,
} from "../assistant.operational.store";
import { extractScreenLinks } from "../assistant.utils";
import { FailedMessageActions, ReplyActions } from "./OperationalAssistant.reusable";

export default function OperationalAssistant({ embedded = false, active = true }: { embedded?: boolean; active?: boolean }) {
  const { t } = useTranslation("chat", { keyPrefix: "operational" });
  const { t: tChat } = useTranslation("chat");
  const { lang: parameter } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(parameter) ? parameter : DEFAULT;
  const location = useLocation();
  const navigate = useNavigate();
  const { messages } = useOperationalConversation();
  const [draft, setDraft] = useState("");
  const viewport = useRef<HTMLDivElement>(null);
  const startedFromInbox = useRef(false);
  const waiting = messages.some((message) => message.status === "queued" || message.status === "sending");
  const lastIndex = messages.length - 1;

  useEffect(() => {
    const initialMessage = (location.state as { initialMessage?: unknown } | null)?.initialMessage;
    if (typeof initialMessage !== "string" || startedFromInbox.current) return;
    startedFromInbox.current = true;
    sendOperationalMessage(initialMessage);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  useLayoutEffect(() => {
    const node = viewport.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages]);

  function handleSend() {
    if (!draft.trim()) return;
    sendOperationalMessage(draft);
    setDraft("");
  }

  const newConversation = (
    <ToolbarAction
      icon="newConversation"
      label={t("newConversation")}
      content={t("newConversation")}
      hideContentOnMobile
      disabled={messages.length === 0}
      className="text-operational-muted"
      onClick={resetOperationalConversation}
    />
  );

  const content = (
    <section aria-label={t("title")} className="flex h-full min-h-0 min-w-0 flex-col gap-2">
      {embedded ? (
        <div className="flex shrink-0 justify-end">{newConversation}</div>
      ) : (
        <ChatHeader title={t("title")} assistant column>
          {newConversation}
        </ChatHeader>
      )}
      <div ref={viewport} className="scrollbar-none flex min-h-0 flex-1 flex-col overflow-y-auto px-1 py-2" aria-live="polite">
        {messages.length === 0 && (
          <div className="m-auto px-5">
            <ConversationIntro title={t("welcomeTitle")} subtitle={t("welcomeSubtitle")} />
          </div>
        )}
        {messages.map((message, index) => {
          const own = message.role === "user";
          const text = message.decision ? t(message.decision === "confirm" ? "confirmed" : "declined") : message.content;
          return (
            <div key={message.id} className={`mx-auto flex w-full max-w-3xl flex-col ${index > 0 ? "mt-4" : ""}`}>
              <MessageBubble
                conversationKind="assistant"
                content={text}
                timestamp={message.createdAt}
                locale={lang}
                author={own ? tChat("you") : t("title")}
                own={own}
                assistant={!own}
                endOfGroup={false}>
                {message.status === "failed" && (
                  <FailedMessageActions
                    reason={message.reason}
                    onRetry={() => retryOperationalMessage(message.id)}
                    onDiscard={() => discardOperationalMessage(message.id)}
                  />
                )}
                {!own && (
                  <ReplyActions
                    links={extractScreenLinks(message.content, lang)}
                    proposal={!!message.proposal && index === lastIndex && !waiting}
                    onConfirm={() => answerOperationalProposal(true)}
                    onDecline={() => answerOperationalProposal(false)}
                  />
                )}
              </MessageBubble>
            </div>
          );
        })}
        {waiting && (
          <p role="status" className="mx-auto w-full max-w-3xl animate-pulse px-1 pt-4 text-body text-operational-muted motion-reduce:animate-none">
            {t("thinking")}
          </p>
        )}
      </div>
      <Surface field className="mx-auto w-full max-w-3xl shrink-0" contentClassName="overflow-visible! px-2 py-1">
        <MessageComposer
          assistant
          value={draft}
          onChange={setDraft}
          onSend={handleSend}
          placeholder={t("placeholder")}
          label={t("placeholder")}
          sendLabel={tChat("chatbot.sendDescription")}
          hint={tChat("chatbot.composerHint")}
          maxLength={8000}
          compact={embedded}
          active={active}
        />
      </Surface>
    </section>
  );

  return embedded ? content : <main className="mx-auto flex h-full min-h-0 w-full max-w-operational-page flex-col p-4 sm:px-8">{content}</main>;
}
