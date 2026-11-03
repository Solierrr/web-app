import { useState } from "react";
import { useTranslation } from "react-i18next";
import Dialog from "@@/overlay/dialog/Dialog";
import Confirmation from "@@/overlay/confirmation/Confirmation";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import { PrimaryButton } from "@@/ui/button/Button.presets";
import { getAuthSession } from "@/lib/shared/auth/authToken.utils";
import PersonChecklist from "@/features/messages/pages/PersonChecklist";
import type { ConversationDto } from "@/features/messages/messages.messenger.api";
import { addCommunityMembers, listCommunitySubgroups, removeCommunityMember, setCommunityStatus } from "../projects.community.service";
import type { Community, CommunityMember, Successor } from "../projects.community.service";
import type { ProjectMember } from "../projects.d";

type Pending = { kind: "remove"; member: CommunityMember; groups: ConversationDto[] } | { kind: "status" };

/** Subgrupos que ficariam sem gestor: os que o alvo gere e onde sobra mais alguém. */
function needingSuccessor(groups: ConversationDto[], userId: string) {
  return groups.filter((group) => group.managerUserId === userId && group.participantIds.some((id) => id !== userId));
}

/** Gestão da comunidade do projeto: membros com papel, entrada de pessoas do projeto, remoção com sucessor e arquivamento. */
export default function ProjectCommunity({
  community,
  people,
  onChanged,
  onClose,
}: {
  community: Community;
  people: ProjectMember[];
  onChanged: () => Promise<unknown>;
  onClose: () => void;
}) {
  const { t } = useTranslation("saas", { keyPrefix: "projects.community" });
  const userId = getAuthSession()?.userId ?? "";
  const myRole = community.members.find((member) => member.userId === userId)?.role;
  const isOwner = myRole === "OWNER";
  const canAdmin = isOwner || myRole === "ADMIN";
  const archived = community.status === "ARCHIVED";
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refused, setRefused] = useState(0);
  const [pending, setPending] = useState<Pending | null>(null);
  const [successors, setSuccessors] = useState<Record<string, string>>({});
  const [adding, setAdding] = useState(false);
  const [invited, setInvited] = useState<string[]>([]);
  const nameOf = (id: string) => (id === userId ? t("you") : (people.find((person) => person.authId === id)?.name ?? t("unknown")));
  const candidates = people.filter((person) => !community.members.some((member) => member.userId === person.authId));

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action();
      await onChanged();
      return true;
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : t("title"));
      return false;
    } finally {
      setBusy(false);
    }
  }
  const changeRole = (member: CommunityMember, role: "ADMIN" | "MEMBER") =>
    void run(async () => void (await addCommunityMembers(community.id, [member.userId], role)));
  async function askRemoval(member: CommunityMember) {
    setError(null);
    setSuccessors({});
    try {
      setPending({ kind: "remove", member, groups: needingSuccessor(await listCommunitySubgroups(community), member.userId) });
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : t("title"));
    }
  }
  async function confirm(target: Pending) {
    const done = await run(async () => {
      if (target.kind === "status") await setCommunityStatus(community.id, archived ? "ACTIVE" : "ARCHIVED");
      else {
        const chosen: Successor[] = target.groups.map((group) => ({ conversationId: group.id, successorUserId: successors[group.id] }));
        await removeCommunityMember(community.id, target.member.userId, chosen);
      }
    });
    // Se falhar (ex.: remoção incompleta), a confirmação continua aberta para repetir o mesmo pedido.
    if (!done) return;
    setPending(null);
    if (target.kind === "remove" && target.member.userId === userId) onClose();
  }
  function canRemove(member: CommunityMember) {
    if (member.role === "OWNER") return false;
    return member.userId === userId || isOwner || (myRole === "ADMIN" && member.role === "MEMBER");
  }
  const removing = pending?.kind === "remove" ? pending : null;
  const incomplete = !!removing && removing.groups.some((group) => !successors[group.id]);

  return (
    <Dialog title={t("title")} onClose={onClose} busy={busy} compact>
      <div className="flex flex-col gap-4 text-left">
        <p className="text-body text-operational-muted">{t(`status.${community.status}`)}</p>
        {archived && <p className="text-body text-operational-muted">{t("archivedHint")}</p>}
        <ul aria-label={t("members")} className="flex flex-col divide-y divide-operational-border/60">
          {community.members.map((member) => (
            <li key={member.userId} className="flex items-center justify-between gap-2 py-2">
              <span className="flex min-w-0 items-center gap-2">
                <span className="truncate text-body">{nameOf(member.userId)}</span>
                <span className="rounded-full bg-input-bg px-2 text-sidebar-group">{t(`roles.${member.role}`)}</span>
              </span>
              <span className="flex shrink-0 items-center">
                {isOwner && !archived && member.role === "MEMBER" && (
                  <ToolbarAction
                    icon="userRoundCheck"
                    label={t("makeAdmin", { name: nameOf(member.userId) })}
                    disabled={busy}
                    onClick={() => changeRole(member, "ADMIN")}
                  />
                )}
                {isOwner && !archived && member.role === "ADMIN" && (
                  <ToolbarAction
                    icon="userMinus"
                    label={t("removeAdmin", { name: nameOf(member.userId) })}
                    disabled={busy}
                    onClick={() => changeRole(member, "MEMBER")}
                  />
                )}
                {canRemove(member) && member.userId !== userId && (
                  <ToolbarAction
                    icon="trash"
                    label={t("remove", { name: nameOf(member.userId) })}
                    disabled={busy}
                    onClick={() => void askRemoval(member)}
                  />
                )}
              </span>
            </li>
          ))}
        </ul>
        {error && !pending && (
          <p role="alert" className="text-body">
            {error}
          </p>
        )}
        {refused > 0 && (
          <p role="status" className="text-body text-operational-muted">
            {t("rejected", { count: refused })}
          </p>
        )}
        {canAdmin && !archived && !adding && (
          <ToolbarAction icon="userPlus" content={t("add")} label={t("add")} disabled={busy} onClick={() => (setInvited([]), setAdding(true))} className="self-start" />
        )}
        {canAdmin && !archived && adding && (
          <div className="flex flex-col gap-3">
            <PersonChecklist
              people={candidates.map((person) => ({ id: person.authId, name: person.name }))}
              selected={invited}
              onChange={setInvited}
              disabled={busy}
              empty={t("nobodyToAdd")}
            />
            <PrimaryButton
              variant="soft"
              content={t("addConfirm")}
              description={t("addConfirm")}
              disabled={busy || invited.length === 0}
              onClick={() =>
                void run(async () => {
                  const result = await addCommunityMembers(community.id, invited, "MEMBER");
                  setRefused(result.rejectedParticipants?.length ?? 0);
                  setAdding(false);
                })
              }
            />
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {canAdmin && (
            <ToolbarAction
              icon="archive"
              content={t(archived ? "reactivate" : "archive")}
              label={t(archived ? "reactivate" : "archive")}
              disabled={busy}
              onClick={() => setPending({ kind: "status" })}
            />
          )}
          {myRole && myRole !== "OWNER" && (
            <ToolbarAction
              icon="logout"
              content={t("leave")}
              label={t("leave")}
              disabled={busy}
              onClick={() => void askRemoval(community.members.find((member) => member.userId === userId)!)}
            />
          )}
        </div>
      </div>
      {pending && (
        <Confirmation
          title={pending.kind === "status" ? t(archived ? "reactivate" : "archive") : t(pending.member.userId === userId ? "leave" : "removeTitle")}
          message={
            pending.kind === "status"
              ? t(archived ? "reactivateMessage" : "archiveMessage")
              : pending.member.userId === userId
                ? t("leaveMessage")
                : t("removeMessage", { name: nameOf(pending.member.userId) })
          }
          busy={busy}
          confirmDisabled={incomplete}
          onCancel={() => setPending(null)}
          onConfirm={() => void confirm(pending)}>
          {removing?.groups.map((group) => (
            <fieldset key={group.id} className="mb-3 flex flex-col gap-2">
              <legend className="mb-2 text-body">{t("chooseSuccessor", { group: group.title ?? "" })}</legend>
              {group.participantIds
                .filter((id) => id !== removing.member.userId)
                .map((id) => (
                  <label key={id} className="flex cursor-pointer items-center gap-2 text-body">
                    <input
                      type="radio"
                      name={`successor-${group.id}`}
                      value={id}
                      checked={successors[group.id] === id}
                      onChange={() => setSuccessors((current) => ({ ...current, [group.id]: id }))}
                    />
                    {nameOf(id)}
                  </label>
                ))}
            </fieldset>
          ))}
          {error && (
            <p role="alert" className="text-body">
              {error}
            </p>
          )}
        </Confirmation>
      )}
    </Dialog>
  );
}
