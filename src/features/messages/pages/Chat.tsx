import ChatHeader from "@@/layout/chat/chat-header/ChatHeader";
import MessageBubble from "@@/layout/chat/message/MessageBubble";
import Skeleton from "@@/feedback/skeleton/Skeleton";
import ConversationIntro from "@@/layout/chat/conversation-intro/ConversationIntro";
import MessageComposer from "@@/ui/message-composer/MessageComposer";
import Surface from "@@/ui/surface/Surface";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useLocation, useParams } from "react-router-dom";
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
  type ConversationDto,
  type MessageDto,
} from "@/features/messages/messages.messenger.api";
import { getConnectionState, subscribeToConversation } from "@/features/messages/messages.messenger.socket";
import { highestSequence, mergeMessages } from "@/features/messages/messages.messenger.realtime.utils";
import {
  useAssistantStatus,
  useConversationPresence,
  useMessengerConnection,
  useOutbox,
  useTypingPublisher,
} from "@/features/messages/messages.hooks";
import ConnectionNotice from "./ConnectionNotice";
import { AssistantNotice, PendingBubble } from "./Chat.reusable";

export default function Chat() {
  const { conversationId = "" } = useParams<{ conversationId: string }>();
  return <Conversation key={conversationId} conversationId={conversationId} />;
}

export function Conversation({
  conversationId,
  embedded = false,
  readOnly = false,
  displayTitle,
  actions,
}: {
  conversationId: string;
  embedded?: boolean;
  readOnly?: boolean;
  displayTitle?: string;
  actions?: ReactNode;
}) {
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const { t } = useTranslation("chat");
  const location = useLocation();
  const navigationState = location.state as { product?: string | null; initialDraft?: string; initialSendError?: boolean } | null;
  const product = navigationState?.product;
  const userId = getAuthSession()?.userId;
  const [conversation, setConversation] = useState<ConversationDto | null>(null);
  const [participantAvatar, setParticipantAvatar] = useState<string | null>(null);
  const [participantName, setParticipantName] = useState<string | null>(null);
  const [participantNames, setParticipantNames] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [draft, setDraft] = useState(navigationState?.initialDraft ?? (product ? t("contactAbout", { title: product }) : ""));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(navigationState?.initialSendError ? t("sendError") : null);
  const [hasOlder, setHasOlder] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const lastSequence = useRef(0);
  const lastMarkedRead = useRef(0);
  const activeConversationId = useRef(conversationId);
  const viewport = useRef<HTMLDivElement>(null);
  const followLatest = useRef(true);
  const olderScrollHeight = useRef<number | null>(null);
  const synchronizeRef = useRef<() => Promise<void>>(() => Promise.resolve());
  const connection = useMessengerConnection();
  const { typing, presence } = useConversationPresence(conversationId);
  const conversable = !readOnly && (conversation?.conversationType === "DIRECT" || conversation?.conversationType === "GROUP");
  const typingPublisher = useTypingPublisher(conversationId, conversable);

  function deliver(sent: MessageDto) {
    if (activeConversationId.current !== conversationId) return;
    lastSequence.current = Math.max(lastSequence.current, sent.sequence);
    followLatest.current = true;
    setMessages((current) => mergeMessages(current, [sent]));
    if (getConnectionState().status !== "connected") window.dispatchEvent(new Event("solaria:messenger"));
  }
  const outbox = useOutbox(conversationId, conversation?.conversationType, deliver);
  const { acknowledge } = outbox;
  const assistantStatus = useAssistantStatus(conversation?.conversationType === "CHAT_BOT", messages, userId, () => synchronizeRef.current());

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
      lastSequence.current = highestSequence(incoming, lastSequence.current);
      setMessages((current) => mergeMessages(current, incoming));
      incoming.forEach((message) => {
        if (message.clientMessageId) acknowledge(message.clientMessageId);
      });
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
        return;
      } finally {
        synchronizing = false;
      }
    }
    synchronizeRef.current = synchronize;

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
              if (active) {
                setParticipantName(user.username);
                setParticipantAvatar(user.avatar);
              }
            })
            .catch(() => undefined);
      })
      .catch(() => {
        if (active) setError(t("loadError"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    const unsubscribe = subscribeToConversation(conversationId, (event) => {
      if (event.kind !== "message") return;
      if (initialized && lastSequence.current > 0 && event.message.sequence > lastSequence.current + 1) void synchronize();
      receive([event.message]);
    });
    const onVisible = () => {
      if (!document.hidden && getConnectionState().status !== "connected") void synchronize();
    };
    const onForeground = () => {
      if (!document.hidden) void synchronize();
    };
    const interval = setInterval(onVisible, 20_000);
    document.addEventListener("visibilitychange", onForeground);
    return () => {
      active = false;
      synchronizeRef.current = () => Promise.resolve();
      unsubscribe();
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onForeground);
    };
  }, [acknowledge, conversationId, product, t, userId]);

  const connectionStatus = connection.status;
  useEffect(() => {
    if (connectionStatus === "connected") void synchronizeRef.current();
  }, [connectionStatus]);

  useEffect(() => {
    const markVisibleRead = () => {
      if (document.hidden || !conversation) return;
      const sequence = messages.reduce((highest, message) => Math.max(highest, message.sequence), 0);
      if (sequence <= lastMarkedRead.current) return;
      void markConversationRead(conversationId, sequence, conversation.conversationType)
        .then(() => {
          if (activeConversationId.current === conversationId) {
            lastMarkedRead.current = Math.max(lastMarkedRead.current, sequence);
            if (getConnectionState().status !== "connected") window.dispatchEvent(new Event("solaria:messenger"));
          }
        })
        .catch(() => undefined);
    };
    markVisibleRead();
    document.addEventListener("visibilitychange", markVisibleRead);
    return () => document.removeEventListener("visibilitychange", markVisibleRead);
  }, [conversationId, conversation, messages]);

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

  function handleSend() {
    const content = draft.trim();
    if (!content || readOnly || !conversation) return;
    typingPublisher.stop();
    setError(null);
    followLatest.current = true;
    setDraft("");
    outbox.send(content);
  }

  function handleDraft(value: string) {
    setDraft(value);
    typingPublisher.notify(value);
  }

  function discardPending(clientMessageId: string) {
    const content = outbox.discard(clientMessageId);
    if (content) setDraft((current) => current || content);
  }

  function retryAssistant() {
    const own = [...messages].reverse().find((message) => message.senderId === userId);
    if (own) outbox.send(own.content);
  }

  const kind = conversation?.conversationType === "GROUP" ? "group" : conversation?.conversationType === "CHAT_BOT" ? "assistant" : "direct";
  const others = typing.filter((id) => id !== userId?.toLowerCase());
  const peerId = conversation?.conversationType === "DIRECT" ? conversation.participantIds.find((id) => id !== userId) : undefined;
  const peerPresence = peerId ? presence.users[peerId.toLowerCase()] : undefined;
  const status =
    others.length > 0
      ? kind === "group"
        ? t("typingNamed", {
            count: others.length,
            names: others.map((id) => participantNames[id] ?? t("participant")).join(", "),
          })
        : t("typing")
      : peerPresence === undefined
        ? undefined
        : t(peerPresence ? "online" : "offline");

  const title =
    displayTitle ||
    conversation?.title ||
    (conversation?.conversationType === "CHAT_BOT" ? t("chatbot.assistantName") : participantName) ||
    t("conversation");
  const content = (
    <section className="flex h-full min-h-0 min-w-0 flex-col gap-4">
      <ChatHeader
        title={title}
        avatar={conversation?.conversationType === "GROUP" || conversation?.conversationType === "CHAT_BOT" ? null : participantAvatar}
        assistant={conversation?.conversationType === "CHAT_BOT"}
        group={conversation?.conversationType === "GROUP"}
        status={status}
        column>
        <div className="flex items-center gap-2">
          <ToolbarAction
            to={routePaths.inbox(lang)}
            icon="panelLeftOpen"
            label={t("inbox")}
            className={embedded ? "@xl/messages:hidden" : undefined}
          />
          {actions}
        </div>
      </ChatHeader>
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
      <ConnectionNotice connection={connection} />
      <div
        ref={viewport}
        onScroll={(event) => {
          const node = event.currentTarget;
          followLatest.current = node.scrollHeight - node.scrollTop - node.clientHeight < 80;
        }}
        className="scrollbar-none flex min-h-0 flex-1 flex-col overflow-y-auto px-1 py-2"
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
          <div className="m-auto px-5">
            <ConversationIntro title={t("emptyConversationTitle")} subtitle={t("emptyConversation")} />
          </div>
        )}
        {messages.map((message, index) => {
          const own = message.senderId === userId;
          const assistant = message.role === "assistant" || message.messageType === "CHATBOT_TO_USER";
          const previous = messages[index - 1];
          const day = new Date(message.timestamp).toDateString();
          const newDay = !previous || day !== new Date(previous.timestamp).toDateString();
          const continues = (before: typeof message, after: typeof message) =>
            new Date(before.timestamp).toDateString() === new Date(after.timestamp).toDateString() &&
            before.senderId === after.senderId &&
            before.role === after.role &&
            Date.parse(after.timestamp) - Date.parse(before.timestamp) < 5 * 60 * 1000;
          const grouped = previous && !newDay && continues(previous, message);
          const next = messages[index + 1];
          const endOfGroup = !(next && continues(message, next));
          const author = own
            ? t("you")
            : assistant
              ? t("chatbot.assistantName")
              : (conversation?.conversationType === "GROUP" ? participantNames[message.senderId] : participantName) || t("participant");
          return (
            <div key={message.id} className={`mx-auto flex w-full max-w-3xl flex-col ${grouped ? "mt-0.5" : index > 0 && !newDay ? "mt-4" : ""}`}>
              {newDay && (
                <div className={`flex justify-center ${index > 0 ? "mb-4 mt-6" : "mb-4"}`}>
                  <time
                    dateTime={message.timestamp}
                    className="rounded-full bg-input-bg px-3 py-1 text-sidebar-group font-medium text-operational-muted">
                    {new Intl.DateTimeFormat(lang, { weekday: "long", day: "numeric", month: "long" }).format(new Date(message.timestamp))}
                  </time>
                </div>
              )}
              <MessageBubble
                conversationKind={kind}
                content={message.deleted ? t("messageDeleted") : message.content}
                timestamp={message.timestamp}
                locale={lang}
                author={author}
                own={own}
                assistant={assistant}
                endOfGroup={endOfGroup}
                showAuthor={conversation?.conversationType === "GROUP" && !own && !grouped}
              />
            </div>
          );
        })}
        {outbox.pending.map((item) => (
          <div key={item.clientMessageId} className="mx-auto mt-4 flex w-full max-w-3xl flex-col">
            <PendingBubble item={item} author={t("you")} locale={lang} conversationKind={kind} onRetry={outbox.retry} onDiscard={discardPending} />
          </div>
        ))}
        {assistantStatus !== "idle" && outbox.pending.length === 0 && <AssistantNotice status={assistantStatus} onRetry={retryAssistant} />}
      </div>
      <Surface field className="mx-auto w-full max-w-3xl shrink-0" contentClassName="overflow-visible! px-2 py-1">
        <MessageComposer
          assistant
          value={draft}
          onChange={handleDraft}
          onSend={handleSend}
          placeholder={t("draftPlaceholder")}
          label={t("draftPlaceholder")}
          sendLabel={t("sendDescription")}
          hint={t("chatbot.composerHint")}
          maxLength={8000}
          disabled={readOnly || loading || !conversation}
        />
      </Surface>
    </section>
  );
  return embedded ? content : <main className="mx-auto flex h-full min-h-0 w-full max-w-operational-page flex-col p-4 sm:px-8">{content}</main>;
}
