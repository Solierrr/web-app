import { useState } from "react";
import { useTranslation } from "react-i18next";
import Dialog from "@@/overlay/dialog/Dialog";
import Confirmation from "@@/overlay/confirmation/Confirmation";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import { PrimaryButton } from "@@/ui/button/Button.presets";
import { getConversation, getMessengerContacts, type ConversationDto } from "@/features/messages/messages.messenger.api";
import { addGroupParticipants, removeGroupParticipant, transferGroupManager } from "@/features/messages/messages.messenger.groups";
import PersonChecklist from "./PersonChecklist";

type Pending = { kind: "remove"; userId: string } | { kind: "leave" };

/** Detalhes do grupo: participantes com nome e, para o gestor, adicionar, remover e passar a gestão; qualquer um pode sair. */
export default function GroupDetails({
  conversation,
  userId,
  names,
  candidates,
  onChanged,
  onLeft,
  onClose,
}: {
  conversation: ConversationDto;
  userId: string;
  names: Record<string, string>;
  /** Quem pode ser convidado; sem ele valem as conexões. Num subgrupo de comunidade, são os membros dela. */
  candidates?: { id: string; name: string }[];
  onChanged: (conversation: ConversationDto) => void;
  onLeft: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation("chat");
  const [current, setCurrent] = useState(conversation);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refused, setRefused] = useState(0);
  const [pending, setPending] = useState<Pending | null>(null);
  const [successor, setSuccessor] = useState("");
  const [adding, setAdding] = useState(false);
  const [contacts, setContacts] = useState<{ id: string; name: string }[]>([]);
  const [invited, setInvited] = useState<string[]>([]);
  const isManager = current.managerUserId === userId;
  const others = current.participantIds.filter((id) => id !== userId);
  const nameOf = (id: string) => (id === userId ? t("you") : (names[id] ?? t("participant")));

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : t("groupError"));
    } finally {
      setBusy(false);
    }
  }
  async function refresh() {
    const next = await getConversation(current.id);
    setCurrent(next);
    onChanged(next);
  }
  function openAdding() {
    setAdding(true);
    setInvited([]);
    if (candidates) {
      setContacts(candidates.filter((item) => !current.participantIds.includes(item.id)));
      return;
    }
    getMessengerContacts()
      .then((items) =>
        setContacts(items.filter((item) => !current.participantIds.includes(item.authId)).map((item) => ({ id: item.authId, name: item.username }))),
      )
      .catch(() => setError(t("contactsError")));
  }

  return (
    <Dialog title={t("groupDetails")} onClose={onClose} busy={busy} compact>
      <div className="flex flex-col gap-4 text-left">
        <h3 className="text-body font-semi-bold">{current.title}</h3>
        <ul aria-label={t("participants")} className="flex flex-col divide-y divide-operational-border/60">
          {current.participantIds.map((id) => (
            <li key={id} className="flex items-center justify-between gap-2 py-2">
              <span className="flex min-w-0 items-center gap-2">
                <span className="truncate text-body">{nameOf(id)}</span>
                {current.managerUserId === id && <span className="rounded-full bg-input-bg px-2 text-sidebar-group">{t("manager")}</span>}
              </span>
              {isManager && id !== userId && (
                <span className="flex shrink-0 items-center">
                  <ToolbarAction
                    icon="userRoundCheck"
                    label={t("makeManager", { name: nameOf(id) })}
                    disabled={busy}
                    onClick={() =>
                      void run(async () => {
                        await transferGroupManager(current.id, id);
                        await refresh();
                      })
                    }
                  />
                  <ToolbarAction
                    icon="trash"
                    label={t("removeParticipant", { name: nameOf(id) })}
                    disabled={busy}
                    onClick={() => setPending({ kind: "remove", userId: id })}
                  />
                </span>
              )}
            </li>
          ))}
        </ul>
        {error && (
          <p role="alert" className="text-body">
            {error}
          </p>
        )}
        {refused > 0 && (
          <p role="status" className="text-body text-operational-muted">
            {t("rejectedParticipants", { count: refused })}
          </p>
        )}
        {isManager && !adding && (
          <ToolbarAction
            icon="userPlus"
            content={t("addParticipants")}
            label={t("addParticipants")}
            disabled={busy}
            onClick={openAdding}
            className="self-start"
          />
        )}
        {isManager && adding && (
          <div className="flex flex-col gap-3">
            <PersonChecklist people={contacts} selected={invited} onChange={setInvited} disabled={busy} empty={t("noInvitable")} />
            <PrimaryButton
              variant="soft"
              content={t("add")}
              description={t("add")}
              disabled={busy || invited.length === 0}
              onClick={() =>
                void run(async () => {
                  const result = await addGroupParticipants(current.id, invited);
                  setCurrent(result.conversation);
                  onChanged(result.conversation);
                  setRefused(result.rejectedParticipants.length);
                  setAdding(false);
                })
              }
            />
          </div>
        )}
        <ToolbarAction
          icon="logout"
          content={t("leaveGroup")}
          label={t("leaveGroup")}
          disabled={busy}
          onClick={() => {
            setSuccessor("");
            setPending({ kind: "leave" });
          }}
          className="self-start"
        />
      </div>
      {pending && (
        <Confirmation
          title={t(pending.kind === "leave" ? "leaveGroup" : "removeParticipantTitle")}
          message={pending.kind === "leave" ? t("leaveGroupMessage") : t("removeParticipantMessage", { name: nameOf(pending.userId) })}
          busy={busy}
          confirmDisabled={pending.kind === "leave" && isManager && others.length > 0 && !successor}
          onCancel={() => setPending(null)}
          onConfirm={() => {
            const target = pending;
            setPending(null);
            void run(async () => {
              if (target.kind === "remove") {
                await removeGroupParticipant(current.id, target.userId, undefined);
                await refresh();
                return;
              }
              await removeGroupParticipant(current.id, userId, isManager && others.length > 0 ? successor : undefined);
              onLeft();
            });
          }}>
          {pending.kind === "leave" && isManager && others.length > 0 && (
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-body">{t("chooseSuccessor")}</legend>
              {others.map((id) => (
                <label key={id} className="flex cursor-pointer items-center gap-2 text-body">
                  <input type="radio" name="successor" value={id} checked={successor === id} onChange={() => setSuccessor(id)} />
                  {nameOf(id)}
                </label>
              ))}
            </fieldset>
          )}
        </Confirmation>
      )}
    </Dialog>
  );
}
