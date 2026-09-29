import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";
import { getConversations, getUserSummary, type ConversationDto } from "@/features/messages/messenger.api";
import { getAuthSession } from "@/shared/auth/authToken.utils";
import { subscribeToConversations } from "@/features/messages/messenger.socket";

export default function Inbox() {
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const { t } = useTranslation("chat");
  const [conversations, setConversations] = useState<ConversationDto[]>([]);
  const [participantNames, setParticipantNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    let unsubscribe: () => void = () => undefined;
    let subscriptionKey = "";
    let refreshing = false;
    const knownNames: Record<string, string> = {};
    const currentUserId = getAuthSession()?.userId;
    async function reload() {
      if (refreshing || !active) return;
      refreshing = true;
      try {
        const result = await getConversations();
        const direct = result.filter((conversation) => conversation.conversationType === "DIRECT");
        if (active) {
          setConversations(direct);
          setError(false);
          const ids = direct.map((conversation) => conversation.id).sort();
          const nextKey = ids.join(",");
          if (nextKey !== subscriptionKey) {
            subscriptionKey = nextKey;
            unsubscribe();
            unsubscribe = ids.length ? subscribeToConversations(ids, () => { void reload(); }) : () => undefined;
          }
        }
        const otherIds = [...new Set(direct.flatMap((conversation) => conversation.participantIds.filter((id) => id !== currentUserId && !knownNames[id])))];
        const names = await Promise.allSettled(otherIds.map((id) => getUserSummary(id)));
        names.forEach((result, index) => { if (result.status === "fulfilled") knownNames[otherIds[index]] = result.value.username; });
        if (active) setParticipantNames({ ...knownNames });
      } catch {
        if (active) setError(true);
      } finally {
        refreshing = false;
        if (active) setLoading(false);
      }
    }
    void reload();
    const onVisible = () => { if (!document.hidden) void reload(); };
    const interval = setInterval(onVisible, 20_000);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      active = false;
      unsubscribe();
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">{t("inbox")}</h1>
      {loading ? <p>{t("loading")}</p> : null}
      {error ? <p role="alert">{t("loadError")}</p> : null}
      {!loading && !error && conversations.length === 0 ? <p>{t("emptyInbox")}</p> : null}
      <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200">
        {conversations.map((conversation) => (
          <li key={conversation.id}>
            <Link to={routePaths.chat(lang, conversation.id)} className="block p-4 hover:bg-gray-50">
              <span className="font-medium">{conversation.title || conversation.participantIds.map((id) => participantNames[id]).find(Boolean) || t("conversation")}</span>
              {conversation.unreadCount > 0 ? (
                <span className="ml-2 rounded-full bg-orange px-2 py-1 text-xs text-white" aria-label={t("unreadCount", { count: conversation.unreadCount })}>
                  {conversation.unreadCount}
                </span>
              ) : null}
              {conversation.lastInteractionAt ? (
                <time className="ml-3 text-sm text-gray-500" dateTime={conversation.lastInteractionAt}>
                  {new Date(conversation.lastInteractionAt).toLocaleString(lang)}
                </time>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
