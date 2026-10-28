import { useState } from "react";
import { useTranslation } from "react-i18next";
import Dialog from "@@/overlay/dialog/Dialog";
import GroupAction from "@@/ui/button/GroupAction";
import SearchBar from "@@/ui/search-bar/SearchBar";
import Surface from "@@/ui/surface/Surface";
import type { MessengerContact } from "@/features/messages/messages.messenger.api";

/** Janela para iniciar uma conversa: o assistente em primeiro lugar e, abaixo, as conexões da pessoa, com busca. */
export default function NewConversationDialog({
  contacts,
  loading,
  error,
  creating,
  onPerson,
  onAssistant,
  onClose,
}: {
  contacts: MessengerContact[];
  loading: boolean;
  error: boolean;
  creating: boolean;
  onPerson: (contact: MessengerContact) => void;
  onAssistant: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation("chat");
  const [query, setQuery] = useState("");
  const visible = contacts.filter((item) => item.username.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));

  return (
    <Dialog title={t("newConversation")} onClose={onClose} busy={creating} compact quiet>
      <div className="flex flex-col gap-4 text-left">
        <SearchBar name={t("searchContacts")} placeholder={t("searchContacts")} value={query} onChange={(event) => setQuery(event.target.value)} />
        <Surface contentClassName="flex flex-col overflow-hidden!">
          <ul className="scrollbar-none flex max-h-80 flex-col divide-y divide-operational-border/60 overflow-y-auto">
            <li>
              <GroupAction
                icon="sparkles"
                label={t("newAssistant")}
                content={t("newAssistant")}
                onClick={onAssistant}
                disabled={creating}
                className="min-h-14 w-full px-5 py-2"
              />
            </li>
            {visible.map((contact) => (
              <li key={contact.authId}>
                <GroupAction
                  icon="user"
                  label={contact.username}
                  content={contact.username}
                  onClick={() => onPerson(contact)}
                  disabled={creating}
                  className="min-h-14 w-full px-5 py-2"
                />
              </li>
            ))}
          </ul>
          {loading && (
            <p role="status" className="px-5 py-3 text-body text-operational-muted">
              {t("loading")}
            </p>
          )}
          {error && (
            <p role="alert" className="px-5 py-3 text-body">
              {t("contactsError")}
            </p>
          )}
          {!loading && !error && contacts.length === 0 && <p className="px-5 py-3 text-body text-operational-muted">{t("noContacts")}</p>}
        </Surface>
      </div>
    </Dialog>
  );
}
