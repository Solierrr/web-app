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
  updateConversationState,
  type ConversationDto,
  type MessengerContact,
} from "@/features/messages/messages.messenger.api";
import { getAuthSession } from "@/lib/shared/auth/authToken.utils";
import { getConnectionState, subscribeToUserEvents } from "@/features/messages/messages.messenger.socket";
import { mergeConversation, removeConversation } from "@/features/messages/messages.messenger.realtime.utils";
import { useMessengerConnection } from "@/features/messages/messages.hooks";
import ConnectionNotice from "./ConnectionNotice";
import { Conversation } from "./Chat";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import ConversationList from "./ConversationList";
import ConversationActions from "./ConversationActions";
import NewConversationDialog from "./NewConversationDialog";
import NewGroupDialog from "./NewGroupDialog";
import { createGroupConversation } from "@/features/messages/messages.messenger.groups";
import { notify } from "@@/feedback/toast/Toast.utils";
import SearchBar, { SearchBarAction } from "@@/ui/search-bar/SearchBar";
import ConversationFilter from "./ConversationFilter";
import GroupAction from "@@/ui/button/GroupAction";
import SurfaceGroup from "@@/ui/surface/SurfaceGroup";
import Confirmation from "@@/overlay/confirmation/Confirmation";
import type { ContextMenuItem } from "@@/overlay/contextMenu/ContextMenu";
import { getHiddenConversations, hideConversation } from "@/features/messages/conversations.utils";
import { startAssistantConversation } from "@/features/messages/messages.assistant.service";
import { AgentChatError } from "@/features/error/agent-chat/AgentChat.error";
import { useActiveContext } from "@/lib/shared/context/ActiveContext";
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
  const [archivedView, setArchivedView] = useState(false);
  const [stateError, setStateError] = useState(false);
  const archivedViewRef = useRef(false);
  const [listCollapsed, setListCollapsed] = useState(false);
  const [toDelete, setToDelete] = useState<ConversationDto | null>(null);
  const [contactsOpen, setContactsOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const [contacts, setContacts] = useState<MessengerContact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactsError, setContactsError] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const mounted = useRef(false);
  const reloadRef = useRef<() => Promise<void>>(() => Promise.resolve());
  const connection = useMessengerConnection();

  useEffect(() => {
    mounted.current = true;
    let active = true;
    const knownIds = new Set<string>();
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
        const result = await getConversations(archivedViewRef.current);
        if (!active) return;
        setConversations(result);
        setError(false);
        knownIds.clear();
        result.forEach((item) => knownIds.add(item.id));
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
    reloadRef.current = reload;
    const unsubscribe = subscribeToUserEvents((event) => {
      if (!active) return;
      if (event.kind === "conversationRemoved") {
        setConversations((current) => removeConversation(current, event.id));
        return;
      }
      if (!knownIds.has(event.conversation.id)) {
        if (!!event.conversation.archived === archivedViewRef.current) void reload();
        return;
      }
      setConversations((current) => mergeConversation(current, event.conversation));
    });
    const onVisible = () => {
      if (!document.hidden) void reload();
    };
    const onPoll = () => {
      if (getConnectionState().status !== "connected") onVisible();
    };
    void reload();
    const interval = window.setInterval(onPoll, 20000);
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

  const connectionStatus = connection.status;
  const previousStatus = useRef(connectionStatus);
  useEffect(() => {
    if (previousStatus.current !== "connected" && connectionStatus === "connected") void reloadRef.current();
    previousStatus.current = connectionStatus;
  }, [connectionStatus]);

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
    setCreateError(null);
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
    setCreateError(null);
    try {
      const item = await createDirectConversation(contact.authId);
      if (mounted.current) {
        setNames((current) => ({ ...current, [contact.authId]: contact.username }));
        selectConversation(item);
      }
    } catch {
      if (mounted.current) setCreateError(t("createError"));
    } finally {
      if (mounted.current) setCreating(false);
    }
  }
  async function createGroup(title: string, participantIds: string[]) {
    if (creating) return;
    setCreating(true);
    setCreateError(null);
    try {
      const { conversation, rejectedParticipants } = await createGroupConversation(title, participantIds);
      if (!mounted.current) return;
      setGroupOpen(false);
      if (rejectedParticipants.length > 0) notify(t("groupCreatedRejected", { count: rejectedParticipants.length }));
      selectConversation(conversation);
    } catch (failure) {
      if (mounted.current) setCreateError(failure instanceof Error ? failure.message : t("groupError"));
    } finally {
      if (mounted.current) setCreating(false);
    }
  }
  async function startAssistant(withMessage = false) {
    if (creating) return;
    const text = withMessage ? draft.trim() : "";
    if (withMessage && !text) return;
    if (!text || (context.kind === "company" && context.company !== null)) {
      setContactsOpen(false);
      navigate(routePaths.operationalChatbot(lang), text ? { state: { initialMessage: text } } : undefined);
      return;
    }
    setCreating(true);
    setCreateError(null);
    try {
      const conversation = await startAssistantConversation(text);
      if (!mounted.current) return;
      setDraft("");
      selectConversation(conversation);
    } catch (error) {
      if (mounted.current) setCreateError(error instanceof AgentChatError ? error.message : t("createError"));
    } finally {
      if (mounted.current) setCreating(false);
    }
  }
  function showArchived(value: boolean) {
    archivedViewRef.current = value;
    setArchivedView(value);
    setQuery("");
    void reloadRef.current();
  }
  async function changeState(item: ConversationDto, patch: { muted?: boolean; archived?: boolean }) {
    setStateError(false);
    try {
      const state = await updateConversationState(item.id, patch);
      if (!mounted.current) return;
      setConversations((current) =>
        current.map((entry) =>
          entry.id === item.id ? { ...entry, muted: state.muted, archived: state.archived, effectiveMuted: state.effectiveMuted } : entry,
        ),
      );
      if (patch.archived !== undefined && conversationId === item.id) navigate(routePaths.inbox(lang));
    } catch {
      if (mounted.current) setStateError(true);
    }
  }
  /** O assistente não tem silêncio nem arquivo no servidor: "excluir" só o esconde neste navegador. */
  function menuItems(item: ConversationDto): ContextMenuItem[] {
    if (item.conversationType === "CHAT_BOT") return [{ label: t("deleteConversation"), icon: "trash", onClick: () => setToDelete(item) }];
    return [
      {
        label: t(item.muted ? "unmuteConversation" : "muteConversation"),
        icon: "bell",
        onClick: () => void changeState(item, { muted: !item.muted }),
      },
      {
        label: t(item.archived ? "unarchiveConversation" : "archiveConversation"),
        icon: "archive",
        onClick: () => void changeState(item, { archived: !item.archived }),
      },
    ];
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
  const available = conversations.filter((item) => !hidden.includes(item.id) && !!item.archived === archivedView);
  const visible = available
    .filter((item) => (filter === "ALL" || item.conversationType === filter) && title(item).toLocaleLowerCase().includes(query.toLocaleLowerCase()))
    .sort((a, b) => (b.lastInteractionAt ?? "").localeCompare(a.lastInteractionAt ?? ""));
  const hasList = available.length > 0 || archivedView;
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
      <ConnectionNotice connection={connection} />
      {createError && (
        <p role="alert" className="mb-3 text-body">
          {createError}
        </p>
      )}
      {stateError && (
        <p role="alert" className="mb-3 text-body">
          {t("stateError")}
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
              <ToolbarAction
                icon={archivedView ? "chevronLeft" : "archive"}
                content={t(archivedView ? "backToConversations" : "archivedConversations")}
                label={t(archivedView ? "backToConversations" : "archivedConversations")}
                onClick={() => showArchived(!archivedView)}
                className="self-start"
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
                    menuItems={menuItems}
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
                // Subgrupo de comunidade arquivada: o servidor recusa escrita, então o chat abre só para leitura.
                readOnly={current?.communityStatus === "ARCHIVED"}
                actions={<ConversationActions onNew={openContacts} getItems={current ? () => menuItems(current) : undefined} />}
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
                          icon="archive"
                          content={t("archivedConversations")}
                          label={t("archivedConversations")}
                          onClick={() => showArchived(true)}
                          disabled={creating}
                        />
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
      {contactsOpen && groupOpen && (
        <NewGroupDialog
          contacts={contacts}
          loading={contactsLoading}
          error={contactsError}
          creating={creating}
          onCreate={(title, ids) => void createGroup(title, ids)}
          onClose={() => {
            setGroupOpen(false);
            setContactsOpen(false);
          }}
        />
      )}
      {contactsOpen && !groupOpen && (
        <NewConversationDialog
          contacts={contacts}
          loading={contactsLoading}
          error={contactsError}
          creating={creating}
          onPerson={(contact) => void startPerson(contact)}
          onAssistant={() => void startAssistant()}
          onGroup={() => setGroupOpen(true)}
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
