import { useCallback, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import OperationalTable from "@@/layout/operational-page/OperationalTable";
import ProjectMembersView from "./ProjectMembersView";
import TableRowOptions from "@@/layout/operational-page/OperationalTable.actions";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import { PrimaryButton, WhiteSolidButton } from "@@/ui/button/Button.presets";
import Dialog from "@@/overlay/dialog/Dialog";
import OperationalForm from "@@/layout/operational-page/OperationalForm";
import Input from "@@/ui/input/Input";
import Combobox from "@@/ui/combobox/Combobox";
import Select from "@@/ui/select/Select";
import Alert from "@@/feedback/alert/Alert";
import StatusField from "@@/ui/status-field/StatusField";
import { useActiveContext } from "@/lib/shared/context/ActiveContext";
import { getAuthSession } from "@/lib/shared/auth/authToken.utils";
import { routePaths } from "@/config/i18n/paths";
import { projectApi } from "../projects.service";
import { useProjects, useProjectResource, useProjectActions } from "../projects.hooks";
import { isProjectReadOnly } from "../projects.utils";
import type { Project, ProjectMember, ProjectInvitation, ProjectRole } from "../projects.d";
export default function ProjectMembers({ project: p }: { project: Project }) {
  const { lang, t, date } = useProjects(),
    context = useActiveContext(),
    navigate = useNavigate();
  const members = useProjectResource(useCallback(() => projectApi.members(p.id), [p.id]));
  const invitations = useProjectResource(useCallback(() => (p.canManage ? projectApi.invitations(p.id) : Promise.resolve([])), [p.id, p.canManage]));
  const companyId = context.kind === "company" ? context.company?.id : undefined;
  const options = useProjectResource(useCallback(() => projectApi.options(companyId), [companyId]));
  const a = useProjectActions();
  const writable = p.canManage && !isProjectReadOnly(p);
  const [editor, setEditor] = useState<ProjectMember | "invite" | null>(null),
    [mode, setMode] = useState("email"),
    [team, setTeam] = useState("");
  const [selectedRole, setSelectedRole] = useState<ProjectRole>("MEMBER");
  function openEditor(member: ProjectMember | "invite") {
    setSelectedRole(member === "invite" ? "MEMBER" : member.role);
    setMode("email");
    setTeam("");
    setEditor(member);
  }
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const role = selectedRole;
    const functionName = String(data.get("functionName") ?? "");
    const ok = await a.execute(
      async () => {
        if (editor === "invite")
          await projectApi.invite(p.id, {
            ...(mode === "team" ? { teamId: team } : { email: String(data.get("email")) }),
            role,
            functionName,
            locale: lang,
          });
        else if (editor) await projectApi.member(p.id, editor.userId, role, functionName);
        await members.reload();
        await invitations.reload();
      },
      t(editor === "invite" ? "feedback.invited" : "feedback.updated"),
    );
    if (ok) setEditor(null);
  }
  return (
    <div className="flex flex-col gap-6">
      <div className="mx-auto flex w-full items-center justify-between max-w-operational-page">
        <h2 className="font-semi-bold">{t("members")}</h2>
        {writable && (
          <PrimaryButton
            variant="soft"
            content={t("invite")}
            description={t("invite")}
            icon={{ name: "plus", inverse: true }}
            onClick={() => openEditor("invite")}
          />
        )}
      </div>
      {members.error && <Alert>{members.error}</Alert>}
      <ProjectMembersView
        items={members.data}
        failed={Boolean(members.error)}
        busy={a.busy}
        onRefresh={() => void a.execute(members.reload, t("feedback.refreshed"))}
        rowAction={
          writable
            ? (m) => (
                <TableRowOptions name={m.name} disabled={a.busy || m.role === "OWNER"}>
                  <ToolbarAction icon="edit" label={t("editMember")} onClick={() => openEditor(m)} />
                  <ToolbarAction
                    icon="trash"
                    label={t("removeMember")}
                    onClick={() =>
                      a.ask({
                        title: t("removeMember"),
                        message: t("removeMemberMessage"),
                        success: t("feedback.removed"),
                        action: async () => {
                          await projectApi.removeMember(p.id, m.userId);
                          if (m.authId === getAuthSession()?.userId) navigate(routePaths.projects(lang));
                          else await members.reload();
                        },
                      })
                    }
                  />
                </TableRowOptions>
              )
            : undefined
        }
      />
      {p.canManage && (
        <>
          <h2 className="mx-auto w-full font-semi-bold max-w-operational-page">{t("sentInvites")}</h2>
          {invitations.error && <Alert>{invitations.error}</Alert>}
          <OperationalTable<ProjectInvitation>
            label={t("sentInvites")}
            items={invitations.data}
            getKey={(i) => i.id}
            empty={t("sentInvitesEmpty")}
            onRefresh={async () => {
              await invitations.reload();
            }}
            columns={[
              { key: "email", label: t("email"), render: (i) => i.email, value: (i) => i.email },
              { key: "role", label: t("role"), render: (i) => t(`roles.${i.role}`), value: (i) => i.role },
              {
                key: "status",
                label: t("statusLabel"),
                render: (i) => (
                  <StatusField
                    state={i.status === "ACCEPTED" ? "approved" : i.status === "PENDING" ? "pending" : "cancelled"}
                    label={t(`invitationStatus.${i.status}`)}
                  />
                ),
                value: (i) => i.status,
                filterable: true,
              },
              { key: "expires", label: t("expires"), render: (i) => date(i.expiresAt), value: (i) => new Date(i.expiresAt).getTime() },
              { key: "delivery", label: t("delivery"), render: (i) => t(`emailState.${i.emailState}`), value: (i) => i.emailState },
            ]}
            rowAction={
              writable
                ? (i) => (
                    <TableRowOptions name={i.email} disabled={a.busy || i.status !== "PENDING"}>
                      <ToolbarAction
                        icon="refresh"
                        label={t("resend")}
                        onClick={() =>
                          a.ask({
                            title: t("resend"),
                            message: t("inviteHint"),
                            action: async () => {
                              await projectApi.resend(i.id);
                              await invitations.reload();
                            },
                          })
                        }
                      />
                      <ToolbarAction
                        icon="x"
                        label={t("revoke")}
                        onClick={() =>
                          a.ask({
                            title: t("revoke"),
                            message: t("revokeMessage"),
                            action: async () => {
                              await projectApi.revoke(i.id);
                              await invitations.reload();
                            },
                          })
                        }
                      />
                    </TableRowOptions>
                  )
                : undefined
            }
          />
        </>
      )}
      {editor && (
        <Dialog
          title={t(editor === "invite" ? "inviteTitle" : "editMember")}
          message={editor === "invite" ? t("inviteHint") : undefined}
          busy={a.busy}
          onClose={() => setEditor(null)}>
          <OperationalForm plain onSubmit={submit}>
            {editor === "invite" && (
              <>
                {options.data?.teams.length ? (
                  <label className="flex flex-col gap-2">
                    {t("inviteMode")}
                    <Select
                      name={t("inviteMode")}
                      value={mode}
                      onChange={(v) => setMode(v ?? "email")}
                      clearable={false}
                      disabled={a.busy}
                      options={[
                        [t("byEmail"), "email"],
                        [t("byTeam"), "team"],
                      ]}
                      className="[&>[role=button]]:min-h-12"
                    />
                  </label>
                ) : null}
                {mode === "team" ? (
                  <>
                    <Combobox
                      name="teamId"
                      label={t("team")}
                      value={team}
                      onChange={setTeam}
                      options={options.data?.teams.map((o) => [o.name, o.id]) ?? []}
                      emptyLabel={t("emptyOptions")}
                      selectionLabel
                      required
                      disabled={a.busy}
                      placeholder={t("team")}
                    />
                    <p className="text-operational-muted">{t("teamHint")}</p>
                  </>
                ) : (
                  <label className="flex flex-col gap-2">
                    {t("email")}
                    <Input
                      name="email"
                      aria-label={t("email")}
                      type="email"
                      maxLength={254}
                      required
                      disabled={a.busy}
                      placeholder={t("emailPlaceholder")}
                    />
                  </label>
                )}
              </>
            )}
            <label className="flex flex-col gap-2">
              {t("role")}
              <Select<ProjectRole>
                name={t("role")}
                value={selectedRole}
                onChange={(v) => setSelectedRole(v ?? "MEMBER")}
                clearable={false}
                disabled={a.busy}
                options={(["MANAGER", "MEMBER", "VIEWER"] as const).map((role) => [t(`roles.${role}`), role])}
                className="[&>[role=button]]:min-h-12"
              />
            </label>
            <label className="flex flex-col gap-2">
              {t("function")}
              <Input
                name="functionName"
                aria-label={t("function")}
                defaultValue={editor === "invite" ? "" : (editor.functionName ?? "")}
                placeholder={t("functionPlaceholder")}
                maxLength={120}
                disabled={a.busy}
              />
            </label>
            <PrimaryButton
              variant="soft"
              type="submit"
              disabled={a.busy || (editor === "invite" && mode === "team" && !team)}
              content={t(editor === "invite" ? "send" : "saveChanges")}
              description={t(editor === "invite" ? "send" : "saveChanges")}
              className="w-full"
            />
            <WhiteSolidButton type="button" disabled={a.busy} content={t("cancel")} description={t("cancel")} onClick={() => setEditor(null)} />
          </OperationalForm>
        </Dialog>
      )}
      {a.confirmation}
    </div>
  );
}
