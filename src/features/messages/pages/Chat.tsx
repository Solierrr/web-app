import OperationalPage from "@@/layout/operational-page/OperationalPage";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";
import { getAuthSession } from "@/shared/auth/authToken.utils";
import {
  getConversation,
  getConversationMessages,
  getConversationMessagesSince,
  getUserSummary,
  markConversationRead,
  sendConversationMessage,
  type ConversationDto,
  type MessageDto,
} from "@/features/messages/messenger.api";
import { subscribeToConversation } from "@/features/messages/messenger.socket";

function mergeMessages(current: MessageDto[], incoming: MessageDto[]): MessageDto[] {
  return [...new Map([...current, ...incoming].map((message) => [message.id, message])).values()].sort(
    (left, right) => left.sequence - right.sequence,
  );
}

export default function Chat() {
  const { conversationId = "", lang: langParam } = useParams<{ conversationId: string; lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const { t } = useTranslation("chat");
  const location = useLocation();
  const product = (location.state as { product?: string | null } | null)?.product;
  const userId = getAuthSession()?.userId;
  const [conversation, setConversation] = useState<ConversationDto | null>(null);
  const [participantName, setParticipantName] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [draft, setDraft] = useState(product ? t("contactAbout", { title: product }) : "");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    setLoading(true);
    setConversation(null);
    setParticipantName(null);
    setMessages([]);
    setHasOlder(false);
    setDraft(product ? t("contactAbout", { title: product }) : "");
    setError(null);

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
          if (activeConversationId.current === conversationId) lastMarkedRead.current = Math.max(lastMarkedRead.current, sequence);
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

  async function handleSend(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = draft.trim();
    if (!content || sending) return;
    setSending(true);
    setError(null);
    try {
      const sent = await sendConversationMessage(conversationId, content);
      if (activeConversationId.current !== conversationId) return;
      lastSequence.current = Math.max(lastSequence.current, sent.sequence);
      followLatest.current = true;
      setMessages((current) => mergeMessages(current, [sent]));
      setDraft("");
    } catch {
      setError(t("sendError"));
    } finally {
      setSending(false);
    }
  }

  return (
    <OperationalPage
      chat
      title={conversation?.title || participantName || t("conversation")}
      actions={
        <Link to={routePaths.inbox(lang)} className="text-orange">
          {t("inbox")}
        </Link>
      }>
      {product ? <p className="rounded-small bg-orange/10 p-3 text-sm">{t("productContext", { title: product })}</p> : null}
      {loading ? <p>{t("loading")}</p> : null}
      {error ? (
        <p role="alert" className="text-red-700">
          {error}
        </p>
      ) : null}
      {realtimeConnected === false ? (
        <p role="status" className="text-sm text-amber-700">
          {t("realtimeUnavailable")}
        </p>
      ) : null}
      <div
        ref={viewport}
        onScroll={(event) => {
          const node = event.currentTarget;
          followLatest.current = node.scrollHeight - node.scrollTop - node.clientHeight < 80;
        }}
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto"
        aria-live="polite">
        {hasOlder ? (
          <button type="button" disabled={loadingOlder} onClick={() => void loadOlder()} className="self-center text-orange disabled:opacity-50">
            {t("loadOlder")}
          </button>
        ) : null}
        {!loading && messages.length === 0 ? <p className="text-gray-600">{t("emptyConversation")}</p> : null}
        {messages.map((message) => {
          const own = message.senderId === userId;
          return (
            <article
              key={message.id}
              className={`max-w-[80%] rounded-small px-4 py-3 ${own ? "self-end bg-orange text-white" : "self-start bg-gray-100"}`}>
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
              <time className="mt-1 block text-xs opacity-70" dateTime={message.timestamp}>
                {new Date(message.timestamp).toLocaleString(lang)}
              </time>
            </article>
          );
        })}
      </div>
      <form onSubmit={handleSend} className="flex gap-2 border-t pt-4">
        <textarea
          aria-label={t("draftPlaceholder")}
          placeholder={t("draftPlaceholder")}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          maxLength={8000}
          className="min-h-12 flex-1 rounded-small border border-operational-border p-3"
        />
        <button
          type="submit"
          disabled={!draft.trim() || sending || loading || !conversation}
          className="rounded-small bg-orange px-5 text-white disabled:opacity-50">
          {t("send")}
        </button>
      </form>
    </OperationalPage>
  );
}
