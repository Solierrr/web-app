import SideCanvas from "@@/layout/access/canvas/SideCanvas";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DEFAULT, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";
import {
  getConversations,
  getUserSummary,
  createDirectConversation,
  createChatbotConversation,
  getMessengerContacts,
  sendConversationMessage,
  type ConversationDto,
  type MessengerContact,
} from "@/features/messages/messages.messenger.api";
import { getAuthSession } from "@/lib/shared/auth/authToken.utils";
import { subscribeToConversations } from "@/features/messages/messages.messenger.socket";
import { useActiveContext } from "@/lib/shared/context/ActiveContext";
import { Conversation } from "./Chat";
import Input from "@@/ui/input/Input";
import Icon from "@@/ui/icon/Icon";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import InboxFilters from "./InboxFilters";
import MessageComposer from "@@/ui/message-composer/MessageComposer";
import LogoLoader from "@@/feedback/logo-loader/LogoLoader";

export default function Inbox() {
  const { lang: langParam, conversationId } = useParams<{ lang: string; conversationId: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT;
  const { t } = useTranslation("chat");
  const navigate = useNavigate();
  const context = useActiveContext();
  const [conversations, setConversations] = useState<ConversationDto[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"ALL" | ConversationDto["conversationType"]>("ALL");
  const [contactsOpen, setContactsOpen] = useState(false);
  const [contacts, setContacts] = useState<MessengerContact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactsError, setContactsError] = useState(false);
  const [contactQuery, setContactQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(false);
  const [draft, setDraft] = useState("");
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    let active = true;
    let unsubscribe = () => {};
    let subscriptionKey = "";
    let refreshing = false;
    let refreshAgain = false;
    const knownNames: Record<string, string> = {};
    const currentUserId = getAuthSession()?.userId;
    async function reload() {
      if (!active) return;
      if (refreshing) {
        refreshAgain = true;
        return;
      }
      refreshing = true;
      try {
        const result = await getConversations();
        if (!active) return;
        setConversations(result);
        setError(false);
        const ids = result.map((item) => item.id).sort();
        const nextKey = ids.join(",");
        if (nextKey !== subscriptionKey) {
          subscriptionKey = nextKey;
          unsubscribe();
          unsubscribe = ids.length ? subscribeToConversations(ids, () => void reload()) : () => {};
        }
        const others = [
          ...new Set(
            result
              .filter((item) => item.conversationType !== "CHAT_BOT")
              .flatMap((item) => item.participantIds.filter((id) => id !== currentUserId && !knownNames[id])),
          ),
        ];
        const summaries = await Promise.allSettled(others.map(getUserSummary));
        summaries.forEach((result, index) => {
          if (result.status === "fulfilled") knownNames[others[index]] = result.value.username;
        });
        if (active) setNames({ ...knownNames });
      } catch {
        if (active) setError(true);
      } finally {
        refreshing = false;
        if (active) setLoading(false);
        if (refreshAgain && active) {
          refreshAgain = false;
          void reload();
        }
      }
    }
    const onVisible = () => {
      if (!document.hidden) void reload();
    };
    void reload();
    const interval = window.setInterval(onVisible, 20000);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("solaria:messenger", onVisible);
    return () => {
      active = false;
      mounted.current = false;
      unsubscribe();
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("solaria:messenger", onVisible);
    };
  }, []);

  useEffect(() => {
    if (!contactsOpen) return;
    let active = true;
    getMessengerContacts()
      .then((items) => {
        if (active) {
          setContacts(items.filter((item) => item.authId !== getAuthSession()?.userId));
          setContactsError(false);
        }
      })
      .catch(() => {
        if (active) setContactsError(true);
      })
      .finally(() => {
        if (active) setContactsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [contactsOpen]);

  function openContacts() {
    if (contactsOpen) return;
    setContactQuery("");
    setContactsLoading(true);
    setContactsError(false);
    setCreateError(false);
    setContactsOpen(true);
  }
  function selectConversation(item: ConversationDto) {
    setConversations((current) => [...current.filter((entry) => entry.id !== item.id), item]);
    setContactsOpen(false);
    navigate(routePaths.chat(lang, item.id));
  }
  async function startPerson(contact: MessengerContact) {
    if (creating) return;
    setCreating(true);
    setCreateError(false);
    try {
      const item = await createDirectConversation(contact.authId);
      if (mounted.current) {
        setNames((current) => ({ ...current, [contact.authId]: contact.username }));
        selectConversation(item);
      }
    } catch {
      if (mounted.current) setCreateError(true);
    } finally {
      if (mounted.current) setCreating(false);
    }
  }
  async function startAssistant(withMessage = false) {
    if (creating) return;
    const text = withMessage ? draft.trim() : "";
    if (withMessage && !text) return;
    setCreating(true);
    setCreateError(false);
    try {
      const item = await createChatbotConversation(context.kind === "company" ? (context.company?.type ?? "COMPANY") : "PERSONAL");
      if (!mounted.current) return;
      if (text) {
        try {
          await sendConversationMessage(item.id, text, "CHAT_BOT");
          if (mounted.current) setDraft("");
        } catch {
          if (mounted.current) {
            setContactsOpen(false);
            navigate(routePaths.chat(lang, item.id), { state: { initialDraft: text, initialSendError: true } });
          }
          return;
        }
        window.dispatchEvent(new Event("solaria:messenger"));
      }
      if (mounted.current) selectConversation(item);
    } catch {
      if (mounted.current) setCreateError(true);
    } finally {
      if (mounted.current) setCreating(false);
    }
  }
  const title = (item: ConversationDto) =>
    item.title ||
    (item.conversationType === "CHAT_BOT"
      ? t("chatbot.assistantName")
      : item.conversationType === "GROUP"
        ? t("group")
        : item.participantIds
            .filter((id) => id !== getAuthSession()?.userId)
            .map((id) => names[id])
            .find(Boolean)) ||
    t("conversation");
  const visible = conversations
    .filter((item) => (filter === "ALL" || item.conversationType === filter) && title(item).toLocaleLowerCase().includes(query.toLocaleLowerCase()))
    .sort((a, b) => (b.lastInteractionAt ?? "").localeCompare(a.lastInteractionAt ?? ""));
  const hasList = conversations.length > 0;

  return (
    <main className="relative isolate @container/messages flex h-full min-h-0 min-w-0 flex-col p-4 sm:p-6" aria-label={t("inbox")}>
      {!loading && !conversationId && !contactsOpen && <SideCanvas centerWidth="var(--spacing-operational-copy)" />}
      {error && (
        <p role="alert" className="mb-3 text-body">
          {t("loadError")}
        </p>
      )}
      {createError && (
        <p role="alert" className="mb-3 text-body">
          {t("createError")}
        </p>
      )}
      {loading && !hasList && !conversationId && <LogoLoader label={t("loading")} />}
      {(!loading || hasList || conversationId) && (
        <div className="flex min-h-0 min-w-0 flex-1 gap-4">
          {hasList && (
            <aside
              className={`min-h-0 w-full shrink-0 flex-col gap-3 rounded-hard bg-white p-3 @xl/messages:flex @xl/messages:w-72 ${conversationId || contactsOpen ? "hidden" : "flex"}`}
              aria-label={t("conversations")}>
              <InboxFilters query={query} onQueryChange={setQuery} filter={filter} onFilterChange={setFilter} />
              <ul className="scrollbar-none min-h-0 flex-1 overflow-y-auto">
                {visible.map((item) => (
                  <li key={item.id}>
                    <Link
                      to={routePaths.chat(lang, item.id)}
                      onClick={() => setContactsOpen(false)}
                      aria-current={conversationId === item.id ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-medium p-3 transition-colors hover:bg-operational-hover ${conversationId === item.id ? "bg-input-bg" : ""}`}>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-hard bg-input-bg" aria-hidden="true">
                        <Icon
                          name={item.conversationType === "CHAT_BOT" ? "sparkles" : item.conversationType === "GROUP" ? "users" : "user"}
                          size={20}
                          gradient={item.conversationType === "CHAT_BOT" ? "orange" : undefined}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-body font-medium">{title(item)}</p>
                        <span className="text-body text-operational-muted">{t(`filters.${item.conversationType}`)}</span>
                      </div>
                      {(item.unreadCount ?? 0) > 0 && (
                        <span
                          className="rounded-full bg-orange px-2 text-body text-white"
                          aria-label={t("unreadCount", { count: item.unreadCount })}>
                          {item.unreadCount}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
                {visible.length === 0 && <p className="p-4 text-center text-body text-operational-muted">{t("noMatches")}</p>}
              </ul>
            </aside>
          )}
          <div
            className={`min-h-0 min-w-0 flex-1 ${hasList && !conversationId && !contactsOpen ? "hidden @xl/messages:flex @xl/messages:flex-col" : "flex flex-col"}`}>
            {contactsOpen ? (
              <section className="scrollbar-none flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto rounded-hard bg-white p-4">
                <header className="flex items-center justify-between">
                  <h2 className="text-label font-medium">{t("newConversation")}</h2>
                  <ToolbarAction icon="x" label={t("actionsClose")} onClick={() => setContactsOpen(false)} />
                </header>
                <Input
                  name={t("searchContacts")}
                  placeholder={t("searchContacts")}
                  value={contactQuery}
                  onChange={(event) => setContactQuery(event.target.value)}
                  className="w-full!"
                />
                {contactsLoading && (
                  <p role="status" className="text-body">
                    {t("loading")}
                  </p>
                )}
                {contactsError && (
                  <p role="alert" className="text-body">
                    {t("contactsError")}
                  </p>
                )}
                {!contactsLoading && !contactsError && (
                  <ul className="flex flex-col gap-2">
                    {contacts
                      .filter((item) => item.username.toLocaleLowerCase().includes(contactQuery.toLocaleLowerCase()))
                      .map((contact) => (
                        <li key={contact.authId}>
                          <ToolbarAction
                            icon="user"
                            label={contact.username}
                            content={contact.username}
                            onClick={() => void startPerson(contact)}
                            disabled={creating}
                            className="w-full! justify-start!"
                          />
                        </li>
                      ))}
                  </ul>
                )}
                {!contactsLoading && !contactsError && contacts.length === 0 && (
                  <p className="text-body text-operational-muted">{t("noContacts")}</p>
                )}
                <Link to={routePaths.professionalsFeed(lang)} className="text-body text-orange">
                  {t("findPeople")}
                </Link>
              </section>
            ) : conversationId ? (
              <Conversation key={conversationId} conversationId={conversationId} embedded />
            ) : (
              <div className="m-auto flex w-full max-w-operational-form flex-col items-center gap-4 p-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-hard bg-input-bg" aria-hidden="true">
                  <Icon name="messagesSquare" size={24} />
                </div>
                <h2 className="text-label font-medium">{t(hasList ? "selectConversation" : "startConversation")}</h2>
                <p className="max-w-operational-copy text-body text-operational-muted">
                  {t(hasList ? "selectConversationDescription" : "startConversationDescription")}
                </p>
                {!hasList && (
                  <>
                    <div className="flex flex-wrap justify-center gap-2">
                      <ToolbarAction icon="user" content={t("addPerson")} label={t("addPerson")} onClick={openContacts} disabled={creating} />
                      <ToolbarAction
                        icon="sparkles"
                        iconGradient="orange"
                        content={t("newAssistant")}
                        label={t("newAssistant")}
                        onClick={() => void startAssistant()}
                        disabled={creating}
                      />
                    </div>
                    <div className="mt-4 w-full max-w-operational-copy text-left">
                      <MessageComposer
                        value={draft}
                        onChange={setDraft}
                        onSend={() => void startAssistant(true)}
                        placeholder={t("chatbot.draftPlaceholder")}
                        label={t("draftPlaceholder")}
                        sendLabel={t("chatbot.sendDescription")}
                        hint={t("chatbot.composerHint")}
                        maxLength={8000}
                        disabled={creating || error}
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
