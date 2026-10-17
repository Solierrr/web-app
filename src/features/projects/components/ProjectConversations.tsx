import { useCallback, useState, type FormEvent } from "react";
import { getAuthSession } from "@/lib/shared/auth/authToken.utils";
import { Conversation } from "@/features/messages/pages/Chat";
import Surface from "@@/ui/surface/Surface";
import { PrimaryButton, WhiteSolidButton } from "@@/ui/button/Button.presets";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import Dialog from "@@/overlay/dialog/Dialog";
import OperationalForm from "@@/layout/operational-page/OperationalForm";
import Input from "@@/ui/input/Input";
import Checkbox from "@@/ui/checkbox/Checkbox";
import Alert from "@@/feedback/alert/Alert";
import LogoLoader from "@@/feedback/logo-loader/LogoLoader";
import type { Project } from "../projects.d";
import { projectApi } from "../projects.service";
import { projectConversations, createProjectConversation } from "../projects.messenger.service";
import { useProjects, useProjectResource, useProjectActions } from "../projects.hooks";
export default function ProjectConversations({ project: p }: { project: Project }) {
  const { t } = useProjects();
  const r = useProjectResource(
    useCallback(async () => {
      const members = await projectApi.members(p.id);
      const groups = await projectConversations(p, members);
      return { ...groups, members };
    }, [p]),
  );
  const a = useProjectActions();
  const [selected, setSelected] = useState<string | null>(null),
    [creating, setCreating] = useState(false),
    [participants, setParticipants] = useState<string[]>([getAuthSession()?.userId ?? ""]);
  const current =
    r.data?.conversations.find((c) => c.id === selected) ?? r.data?.conversations.find((c) => c.projectGeneral) ?? r.data?.conversations[0];
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (!r.data) return;
    const ok = await a.execute(async () => {
      const group = await createProjectConversation(p, r.data!.communityId, String(form.get("title")).trim(), participants);
      await r.reload();
      setSelected(group.id);
    }, t("feedback.conversation"));
    if (ok) setCreating(false);
  }
  return (
    <div className="flex w-full flex-col gap-5">
      <header className=" flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semi-bold">{t("conversations")}</h2>
          <p className="mt-2 max-w-operational-copy text-operational-muted">{t("chatHint")}</p>
        </div>
        <div className="flex items-center gap-2">
          <ToolbarAction icon="refresh" label={t("refresh")} disabled={a.busy} onClick={() => void a.execute(r.reload, t("feedback.refreshed"))} />
          {p.canContribute && r.data && (
            <PrimaryButton variant="soft" content={t("newConversation")} description={t("newConversation")} onClick={() => setCreating(true)} />
          )}
        </div>
      </header>
      {r.error && <Alert>{t("chatUnavailable")}</Alert>}
      {!r.data && !r.error && <LogoLoader label={t("conversations")} />}
      {r.data && (
        <Surface>
          <div className="grid min-w-0 lg:grid-cols-[minmax(12rem,1fr)_minmax(0,3fr)]">
            <nav aria-label={t("chatSelection")} className="flex flex-col items-stretch gap-2 p-4 lg:border-r lg:border-operational-border">
              {r.data.conversations.map((c) => (
                <ToolbarAction
                  key={c.id}
                  content={c.projectGeneral ? t("general") : (c.title ?? "")}
                  aria-pressed={c.id === current?.id}
                  label={c.projectGeneral ? t("general") : (c.title ?? "")}
                  icon="messages"
                  className={`w-full! justify-start! rounded-medium! px-3! py-3! text-operational-ink! ${c.id === current?.id ? "bg-white!" : "bg-transparent!"}`}
                  onClick={() => setSelected(c.id)}
                />
              ))}
            </nav>
            <div className="min-w-0 h-[clamp(25rem,50dvh,38rem)] p-5">
              {current && (
                <Conversation
                  key={current.id}
                  conversationId={current.id}
                  displayTitle={current.projectGeneral ? t("general") : (current.title ?? undefined)}
                  embedded
                  readOnly={!p.canContribute}
                />
              )}
            </div>
          </div>
        </Surface>
      )}
      {creating && r.data && (
        <Dialog title={t("newConversation")} busy={a.busy} onClose={() => setCreating(false)}>
          <OperationalForm plain onSubmit={submit}>
            <label className="flex flex-col gap-2">
              {t("conversationTitle")}
              <Input
                name="title"
                aria-label={t("conversationTitle")}
                required
                maxLength={120}
                placeholder={t("conversationPlaceholder")}
                disabled={a.busy}
              />
            </label>
            <fieldset className="flex flex-col gap-3">
              <legend className="mb-3">{t("members")}</legend>
              <p className="text-operational-muted">{t("chatMembers")}</p>
              {r.data.members.map((m) => (
                <Checkbox
                  key={m.id}
                  label={m.name}
                  checked={participants.includes(m.authId)}
                  disabled={a.busy || m.authId === getAuthSession()?.userId}
                  onChange={(e) => setParticipants((prev) => (e.target.checked ? [...prev, m.authId] : prev.filter((id) => id !== m.authId)))}
                />
              ))}
            </fieldset>
            <PrimaryButton
              variant="soft"
              type="submit"
              content={t("newConversation")}
              description={t("newConversation")}
              disabled={a.busy || participants.length < 2}
            />
            <WhiteSolidButton type="button" content={t("cancel")} description={t("cancel")} disabled={a.busy} onClick={() => setCreating(false)} />
          </OperationalForm>
        </Dialog>
      )}
    </div>
  );
}
