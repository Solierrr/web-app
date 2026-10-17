import OperationalPage from "@@/layout/operational-page/OperationalPage";
import MessageBubble from "@@/layout/chat/message/MessageBubble";
import Skeleton from "@@/feedback/skeleton/Skeleton";
import ValueField from "@@/ui/value-field/ValueField";
import Icon from "@@/ui/icon/Icon";
import MessageComposer from "@@/ui/message-composer/MessageComposer";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";
import { getAuthSession } from "@/lib/shared/auth/authToken.utils";
import {
  getConversation,
  getConversationMessages,
  getConversationMessagesSince,
  getUserSummary,
  markConversationRead,
  sendConversationMessage,
  type ConversationDto,
  type MessageDto,
} from "@/features/messages/messages.messenger.api";
import { subscribeToConversation } from "@/features/messages/messages.messenger.socket";

function mergeMessages(current: MessageDto[], incoming: MessageDto[]): MessageDto[] {
  return [...new Map([...current, ...incoming].map((message) => [message.id, message])).values()].sort(
    (left, right) => left.sequence - right.sequence,
  );
}

export default function Chat() {
  const { conversationId = "" } = useParams<{ conversationId: string }>();
  return <Conversation key={conversationId} conversationId={conversationId} />;
}

export function Conversation({
  conversationId,
  embedded = false,
  readOnly = false,
  displayTitle,
}: {
  conversationId: string;
  embedded?: boolean;
  readOnly?: boolean;
  displayTitle?: string;
}) {
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const { t } = useTranslation("chat");
  const location = useLocation();
  const navigationState = location.state as { product?: string | null; initialDraft?: string; initialSendError?: boolean } | null;
  const product = navigationState?.product;
  const userId = getAuthSession()?.userId;
  const [conversation, setConversation] = useState<ConversationDto | null>(null);
  const [participantName, setParticipantName] = useState<string | null>(null);
  const [participantNames, setParticipantNames] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [draft, setDraft] = useState(navigationState?.initialDraft ?? (product ? t("contactAbout", { title: product }) : ""));
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(navigationState?.initialSendError ? t("sendError") : null);
  const [realtimeConnected, setRealtimeConnected] = useState<boolean | null>(null);
  const [hasOlder, setHasOlder] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const lastSequence = useRef(0);
  const lastMarkedRead = useRef(0);
  const activeConversationId = useRef(conversationId);
  const viewport = useRef<HTMLDivElement>(null);
  const followLatest = useRef(true);
  const olderScrollHeight = useRef<number | null>(null);

  useLayoutEffect(() => {
    const node = viewport.current;
    if (!node) return;
    if (olderScrollHeight.current !== null) {
      node.scrollTop += node.scrollHeight - olderScrollHeight.current;
      olderScrollHeight.current = null;
    } else if (followLatest.current) {
      node.scrollTop = node.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    let active = true;
    let initialized = false;
    let synchronizing = false;
    activeConversationId.current = conversationId;
    lastSequence.current = 0;
    lastMarkedRead.current = 0;
    followLatest.current = true;
    olderScrollHeight.current = null;

    function receive(incoming: MessageDto[]) {
      if (!active) return;
      lastSequence.current = incoming.reduce((highest, message) => Math.max(highest, message.sequence), lastSequence.current);
      setMessages((current) => mergeMessages(current, incoming));
    }

    async function synchronize() {
      if (!active || !initialized || synchronizing) return;
      synchronizing = true;
      try {
        let cursor = Math.max(0, lastSequence.current - 100);
        while (active) {
          const page = await getConversationMessagesSince(conversationId, cursor);
          if (!active) return;
          receive(page);
          const nextCursor = page.reduce((highest, message) => Math.max(highest, message.sequence), cursor);
          if (page.length < 100 || nextCursor <= cursor) break;
          cursor = nextCursor;
        }
      } catch {
        if (active) setRealtimeConnected(false);
      } finally {
        synchronizing = false;
      }
    }

    Promise.all([getConversation(conversationId), getConversationMessages(conversationId)])
      .then(([loadedConversation, loadedMessages]) => {
        if (!active) return;
        setConversation(loadedConversation);
        receive(loadedMessages);
        setHasOlder(loadedMessages.length === 100);
        initialized = true;
        void synchronize();
        const otherId = loadedConversation.participantIds.find((id) => id !== userId);
        if (loadedConversation.conversationType === "GROUP") {
          const ids = loadedConversation.participantIds.filter((id) => id !== userId);
          void Promise.allSettled(ids.map(getUserSummary)).then((results) => {
            if (!active) return;
            const names: Record<string, string> = {};
            results.forEach((result, index) => {
              if (result.status === "fulfilled") names[ids[index]] = result.value.username;
            });
            setParticipantNames(names);
          });
        }
        if (otherId)
          void getUserSummary(otherId)
            .then((user) => {
              if (active) setParticipantName(user.username);
            })
            .catch(() => undefined);
      })
      .catch(() => {
        if (active) setError(t("loadError"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    const unsubscribe = subscribeToConversation(
      conversationId,
      (message) => {
        receive([message]);
      },
      (connected) => {
        if (active) {
          setRealtimeConnected(connected);
          if (connected) void synchronize();
        }
      },
    );
    const onVisible = () => {
      if (!document.hidden) void synchronize();
    };
    const interval = setInterval(onVisible, 20_000);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      active = false;
      unsubscribe();
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [conversationId, product, t, userId]);

  useEffect(() => {
    const markVisibleRead = () => {
      if (document.hidden) return;
      const sequence = messages.reduce((highest, message) => Math.max(highest, message.sequence), 0);
      if (sequence <= lastMarkedRead.current) return;
      void markConversationRead(conversationId, sequence)
        .then(() => {
          if (activeConversationId.current === conversationId) {
            lastMarkedRead.current = Math.max(lastMarkedRead.current, sequence);
            window.dispatchEvent(new Event("solaria:messenger"));
          }
        })
        .catch(() => undefined);
    };
    markVisibleRead();
    document.addEventListener("visibilitychange", markVisibleRead);
    return () => document.removeEventListener("visibilitychange", markVisibleRead);
  }, [conversationId, messages]);

  async function loadOlder() {
    if (loadingOlder || messages.length === 0) return;
    setLoadingOlder(true);
    try {
      const page = await getConversationMessages(conversationId, messages[0].sequence);
      if (activeConversationId.current !== conversationId) return;
      olderScrollHeight.current = viewport.current?.scrollHeight ?? null;
      setMessages((current) => mergeMessages(page, current));
      setHasOlder(page.length === 100);
    } catch {
      setError(t("loadError"));
    } finally {
      setLoadingOlder(false);
    }
  }

  async function handleSend() {
    const content = draft.trim();
    if (!content || sending || readOnly) return;
    setSending(true);
    setError(null);
    try {
      const sent = await sendConversationMessage(conversationId, content, conversation?.conversationType);
      if (activeConversationId.current !== conversationId) return;
      lastSequence.current = Math.max(lastSequence.current, sent.sequence);
      followLatest.current = true;
      setMessages((current) => mergeMessages(current, [sent]));
      setDraft("");
      window.dispatchEvent(new Event("solaria:messenger"));
    } catch {
      setError(t("sendError"));
    } finally {
      setSending(false);
    }
  }

  const title =
    displayTitle ||
    conversation?.title ||
    (conversation?.conversationType === "CHAT_BOT" ? t("chatbot.assistantName") : participantName) ||
    t("conversation");
  const content = (
    <section className="flex h-full min-h-0 min-w-0 flex-col gap-4">
      {embedded && (
        <header className="flex shrink-0 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-medium bg-white">
              <Icon
                name={conversation?.conversationType === "GROUP" ? "users" : conversation?.conversationType === "CHAT_BOT" ? "sparkles" : "user"}
                size={20}
              />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-body! font-semi-bold">{title}</h2>
              {conversation && (
                <p className="mt-1 text-body text-operational-muted">{t("participantCount", { count: conversation.participantIds.length })}</p>
              )}
            </div>
          </div>
          <ToolbarAction to={routePaths.inbox(lang)} icon="panelLeftOpen" label={t("inbox")} className="@xl/messages:hidden" />
        </header>
      )}
      {product && <p className="rounded-medium bg-orange/10 p-3 text-body">{t("productContext", { title: product })}</p>}
      {loading && (
        <div role="status" aria-label={t("loading")} className="flex flex-col gap-3">
          <Skeleton height={56} width="65%" className="rounded-medium" />
          <Skeleton height={56} width="45%" className="self-end rounded-medium" />
        </div>
      )}
      {error && (
        <p role="alert" className="text-body text-operational-ink">
          {error}
        </p>
      )}
      {realtimeConnected === false && (
        <p role="status" className="text-body text-operational-muted">
          {t("realtimeUnavailable")}
        </p>
      )}
      <div
        ref={viewport}
        onScroll={(event) => {
          const node = event.currentTarget;
          followLatest.current = node.scrollHeight - node.scrollTop - node.clientHeight < 80;
        }}
        className="scrollbar-none flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-1 py-4"
        aria-live="polite">
        {hasOlder && (
          <ToolbarAction
            label={t("loadOlder")}
            content={t("loadOlder")}
            disabled={loadingOlder}
            onClick={() => void loadOlder()}
            className="self-center"
          />
        )}
        {!loading && !error && messages.length === 0 && (
          <div className="m-auto flex max-w-operational-copy flex-col items-center gap-3 px-5 text-center text-body text-operational-muted">
            <span aria-hidden="true" className="flex size-12 items-center justify-center rounded-medium bg-white">
              <Icon name="messages" />
            </span>
            <p>{t("emptyConversation")}</p>
          </div>
        )}
        {messages.map((message, index) => {
          const own = message.senderId === userId;
          const assistant = message.role === "assistant" || message.messageType === "CHATBOT_TO_USER";
          const previous = messages[index - 1];
          const day = new Date(message.timestamp).toDateString();
          const newDay = !previous || day !== new Date(previous.timestamp).toDateString();
          const grouped =
            previous &&
            !newDay &&
            previous.senderId === message.senderId &&
            previous.role === message.role &&
            Date.parse(message.timestamp) - Date.parse(previous.timestamp) < 5 * 60 * 1000;
          const author = own
            ? t("you")
            : assistant
              ? t("chatbot.assistantName")
              : (conversation?.conversationType === "GROUP" ? participantNames[message.senderId] : participantName) || t("participant");
          return (
            <div key={message.id} className={`flex flex-col gap-3 ${!grouped && !newDay ? "mt-3" : ""}`}>
              {newDay && (
                <div className="my-3 flex justify-center">
                  <ValueField>
                    <time dateTime={message.timestamp}>
                      {new Intl.DateTimeFormat(lang, { day: "numeric", month: "long", year: "numeric" }).format(new Date(message.timestamp))}
                    </time>
                  </ValueField>
                </div>
              )}
              <MessageBubble
                content={message.content}
                timestamp={message.timestamp}
                locale={lang}
                author={author}
                own={own}
                assistant={assistant}
                showAuthor={!grouped}
              />
            </div>
          );
        })}
      </div>
      <MessageComposer
        value={draft}
        onChange={setDraft}
        onSend={() => void handleSend()}
        placeholder={t("draftPlaceholder")}
        label={t("draftPlaceholder")}
        sendLabel={t("sendDescription")}
        hint={t("chatbot.composerHint")}
        maxLength={8000}
        disabled={readOnly || sending || loading || !conversation}
      />
    </section>
  );
  return embedded ? (
    content
  ) : (
    <OperationalPage
      chat
      title={title}
      actions={
        <Link to={routePaths.inbox(lang)} className="text-orange">
          {t("inbox")}
        </Link>
      }>
      {content}
    </OperationalPage>
  );
}
