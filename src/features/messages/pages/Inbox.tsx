import SideCanvas from "@@/layout/access/canvas/SideCanvas";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DEFAULT, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";
import {
  getConversations,
  getUserSummary,
  createDirectConversation,
  getMessengerContacts,
  type ConversationDto,
  type MessengerContact,
} from "@/features/messages/messages.messenger.api";
import { getAuthSession } from "@/lib/shared/auth/authToken.utils";
import { subscribeToConversation } from "@/features/messages/messages.messenger.socket";
import { useActiveContext } from "@/lib/shared/context/ActiveContext";
import { Conversation } from "./Chat";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import ConversationList from "./ConversationList";
import ConversationActions from "./ConversationActions";
import NewConversationDialog from "./NewConversationDialog";
import SearchBar, { SearchBarAction } from "@@/ui/search-bar/SearchBar";
import ConversationFilter from "./ConversationFilter";
import GroupAction from "@@/ui/button/GroupAction";
import SurfaceGroup from "@@/ui/surface/SurfaceGroup";
import Confirmation from "@@/overlay/confirmation/Confirmation";
import { getHiddenConversations, hideConversation } from "@/features/messages/conversations.utils";
import { startAssistantConversation } from "@/features/messages/messages.assistant.service";
import MessageComposer from "@@/ui/message-composer/MessageComposer";
import Surface from "@@/ui/surface/Surface";
import ConversationIntro from "@@/layout/chat/conversation-intro/ConversationIntro";
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
  const [hidden, setHidden] = useState(getHiddenConversations);
  const [listCollapsed, setListCollapsed] = useState(false);
  const [toDelete, setToDelete] = useState<ConversationDto | null>(null);
  const [contactsOpen, setContactsOpen] = useState(false);
  const [contacts, setContacts] = useState<MessengerContact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactsError, setContactsError] = useState(false);
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
          const stops = ids.map((id) =>
            subscribeToConversation(id, (event) => {
              if (event.kind === "message") void reload();
            }),
          );
          unsubscribe = () => stops.forEach((stop) => stop());
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
      const { conversation, sendFailed } = await startAssistantConversation(
        context.kind === "company" ? (context.company?.type ?? "COMPANY") : "PERSONAL",
        text,
      );
      if (!mounted.current) return;
      if (sendFailed) {
        setContactsOpen(false);
        navigate(routePaths.chat(lang, conversation.id), { state: { initialDraft: text, initialSendError: true } });
        return;
      }
      if (text) setDraft("");
      selectConversation(conversation);
    } catch {
      if (mounted.current) setCreateError(true);
    } finally {
      if (mounted.current) setCreating(false);
    }
  }
  function deleteConversation(item: ConversationDto) {
    hideConversation(item.id);
    setHidden(getHiddenConversations());
    setToDelete(null);
    if (conversationId === item.id) navigate(routePaths.inbox(lang));
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
  const available = conversations.filter((item) => !hidden.includes(item.id));
  const visible = available
    .filter((item) => (filter === "ALL" || item.conversationType === filter) && title(item).toLocaleLowerCase().includes(query.toLocaleLowerCase()))
    .sort((a, b) => (b.lastInteractionAt ?? "").localeCompare(a.lastInteractionAt ?? ""));
  const hasList = available.length > 0;
  const collapsed = listCollapsed && !!conversationId;
  const current = conversationId ? conversations.find((item) => item.id === conversationId) : undefined;

  return (
    <main className="relative isolate @container/messages flex h-full min-h-0 min-w-0 flex-col p-4 sm:p-6" aria-label={t("inbox")}>
      {!loading && !conversationId && <SideCanvas centerWidth="var(--spacing-operational-copy)" />}
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
      {hasList && !conversationId && (
        <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
          <ConversationActions onNew={openContacts} />
        </div>
      )}
      {loading && !hasList && !conversationId && <LogoLoader label={t("loading")} />}
      {(!loading || hasList || conversationId) && (
        <div className="flex min-h-0 min-w-0 flex-1 gap-4">
          {hasList && collapsed && (
            <SurfaceGroup direction="horizontal" divided={false} className="animate-fade-in shrink-0 self-start motion-reduce:animate-none">
              <GroupAction layout="icon" icon="panelLeftOpen" label={t("expandConversations")} onClick={() => setListCollapsed(false)} />
            </SurfaceGroup>
          )}
          {hasList && !collapsed && (
            <aside
              className={`min-h-0 w-full shrink-0 flex-col gap-3 transition-[width,margin] duration-350 ease-in-out motion-reduce:transition-none @xl/messages:flex ${conversationId ? "hidden @xl/messages:ml-0 @xl/messages:w-96" : "flex @xl/messages:ml-[calc(50%-18rem)] @xl/messages:w-144"}`}
              aria-label={t("conversations")}>
              <SearchBar
                name={t("searchConversations")}
                placeholder={t("searchConversations")}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                leading={
                  conversationId && (
                    <SearchBarAction icon="panelLeftClose" label={t("collapseConversations")} onClick={() => setListCollapsed(true)} />
                  )
                }
                actions={<ConversationFilter value={filter} onChange={setFilter} />}
              />
              <Surface className="flex min-h-0 flex-col" contentClassName="flex min-h-0 flex-col overflow-hidden!">
                {visible.length === 0 ? (
                  <p className="p-4 text-center text-body text-operational-muted">{t("noMatches")}</p>
                ) : (
                  <ConversationList
                    conversations={visible}
                    title={title}
                    lang={lang}
                    activeId={conversationId}
                    onOpen={(item) => {
                      setContactsOpen(false);
                      navigate(routePaths.chat(lang, item.id));
                    }}
                    onDelete={setToDelete}
                  />
                )}
              </Surface>
            </aside>
          )}
          <div
            className={`min-h-0 min-w-0 flex-1 ${hasList && !conversationId ? "hidden" : "flex flex-col"} ${conversationId ? "animate-panel-in motion-reduce:animate-none" : ""}`}>
            {conversationId ? (
              <Conversation
                key={conversationId}
                conversationId={conversationId}
                embedded
                actions={<ConversationActions onNew={openContacts} onDelete={() => current && setToDelete(current)} />}
              />
            ) : (
              <div className="relative flex min-h-0 flex-1 flex-col">
                <div className="m-auto flex w-full max-w-operational-form flex-col items-center gap-4 p-4 text-center">
                  <ConversationIntro title={t("startConversation")} subtitle={t("startConversationDescription")} />
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
                      <Surface field className="mt-2 w-full max-w-operational-copy text-left" contentClassName="overflow-visible! px-2 py-1">
                        <MessageComposer
                          assistant
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
                      </Surface>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {contactsOpen && (
        <NewConversationDialog
          contacts={contacts}
          loading={contactsLoading}
          error={contactsError}
          creating={creating}
          onPerson={(contact) => void startPerson(contact)}
          onAssistant={() => void startAssistant()}
          onClose={() => setContactsOpen(false)}
        />
      )}
      {toDelete && (
        <Confirmation
          title={t("deleteConversationTitle")}
          message={t("deleteConversationMessage")}
          busy={false}
          onConfirm={() => deleteConversation(toDelete)}
          onCancel={() => setToDelete(null)}
        />
      )}
    </main>
  );
}
