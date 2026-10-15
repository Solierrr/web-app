import { useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useActiveContext } from "@/lib/shared/context/ActiveContext";
import { routePaths } from "@/config/i18n/paths";
import OperationalPage from "@@/layout/operational-page/OperationalPage";
import OperationalTable from "@@/layout/operational-page/OperationalTable";
import TableRowOptions from "@@/layout/operational-page/OperationalTable.actions";
import { PrimaryButton } from "@@/ui/button/Button.presets";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import Switcher from "@@/ui/switcher/Switcher";
import Alert from "@@/feedback/alert/Alert";
import ProjectGrid from "../components/ProjectGrid";
import { projectApi } from "../projects.service";
import { useProjects, useProjectResource, useProjectActions } from "../projects.hooks";
import { isProjectReadOnly } from "../projects.utils";
import type { Project, ProjectInvitation } from "../projects.d";
export default function ProjectsPage() {
  const c = useActiveContext();
  return (
    <ProjectsContext
      key={c.kind === "company" ? c.company?.id : "personal"}
      companyId={c.kind === "company" ? c.company?.id : undefined}
      canCreate={c.kind === "personal" || Boolean(c.can?.("POST /api/projects"))}
    />
  );
}
function ProjectsContext({ companyId, canCreate }: { companyId?: string; canCreate: boolean }) {
  const { lang, t, date } = useProjects(),
    navigate = useNavigate(),
    [params] = useSearchParams();
  const inbox = params.get("view") === "invitations" || params.has("invitation");
  const base = routePaths.projects(lang);
  const requested = params.get("invitation");
  const projects = useProjectResource(useCallback(() => projectApi.list(companyId), [companyId]));
  const invites = useProjectResource(useCallback(() => projectApi.inbox(), []));
  const actions = useProjectActions();
  const open = (p: Project) => navigate(routePaths.projectDetail(lang, p.id));
  return (
    <OperationalPage
      title={t("title")}
      description={t("description")}
      centered
      sideBackground
      actions={
        !inbox && canCreate ? (
          <PrimaryButton
            variant="soft"
            content={t("new")}
            description={t("new")}
            icon={{ name: "plus", inverse: true }}
            onClick={() => navigate(routePaths.projectCreate(lang))}
          />
        ) : undefined
      }>
      <div className="flex justify-center">
        <Switcher
          label={t("title")}
          activeUrl={inbox ? `${base}?view=invitations` : base}
          options={[
            { content: t("list"), url: base },
            { content: t("inbox"), url: `${base}?view=invitations` },
          ]}
        />
      </div>
      {(inbox ? invites.error : projects.error) && <Alert>{inbox ? invites.error : projects.error}</Alert>}
      {inbox && requested && invites.data && !invites.data.some((i) => i.id === requested) && <Alert>{t("invitationUnavailable")}</Alert>}
      {inbox ? (
        <OperationalTable<ProjectInvitation>
          label={t("inbox")}
          items={invites.data}
          getKey={(i) => i.id}
          empty={t("invitesEmpty")}
          onRefresh={async () => {
            await invites.reload();
          }}
          columns={[
            { key: "projectName", label: t("name"), render: (i) => i.projectName, value: (i) => i.projectName },
            { key: "role", label: t("role"), render: (i) => t(`roles.${i.role}`), value: (i) => t(`roles.${i.role}`) },
            { key: "function", label: t("function"), render: (i) => i.functionName },
            { key: "expires", label: t("expires"), render: (i) => date(i.expiresAt), value: (i) => new Date(i.expiresAt).getTime() },
          ]}
          rowAction={(i) => (
            <TableRowOptions name={i.projectName} disabled={actions.busy}>
              <ToolbarAction
                icon="check"
                label={t("accept")}
                onClick={() =>
                  actions.ask({
                    title: t("accept"),
                    message: t("respondMessage"),
                    success: t("feedback.accepted"),
                    action: async () => {
                      await projectApi.respond(i.id, true);
                      await invites.reload();
                      await projects.reload();
                      navigate(routePaths.projectDetail(lang, i.projectId));
                    },
                  })
                }
              />
              <ToolbarAction
                icon="x"
                label={t("decline")}
                onClick={() =>
                  actions.ask({
                    title: t("decline"),
                    message: t("respondMessage"),
                    success: t("feedback.declined"),
                    action: async () => {
                      await projectApi.respond(i.id, false);
                      await invites.reload();
                    },
                  })
                }
              />
            </TableRowOptions>
          )}
        />
      ) : (
        <ProjectGrid
          projects={projects.data}
          onRefresh={projects.reload}
          rowAction={(p) => (
            <TableRowOptions name={p.name} disabled={actions.busy}>
              <ToolbarAction icon="eye" label={t("view")} onClick={() => open(p)} />
              {p.canManage && !isProjectReadOnly(p) && (
                <ToolbarAction icon="edit" label={t("edit")} onClick={() => navigate(routePaths.projectEdit(lang, p.id))} />
              )}
              {p.canManage && !p.archived && (
                <ToolbarAction
                  icon="archive"
                  label={t("archive")}
                  onClick={() =>
                    actions.ask({
                      title: t("archive"),
                      message: t("archiveMessage"),
                      success: t("feedback.archived"),
                      action: async () => {
                        await projectApi.archive(p.id);
                        await projects.reload();
                      },
                    })
                  }
                />
              )}
            </TableRowOptions>
          )}
        />
      )}
      {actions.confirmation}
    </OperationalPage>
  );
}
