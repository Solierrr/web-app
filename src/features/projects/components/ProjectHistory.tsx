import { useCallback } from "react";
import Alert from "@@/feedback/alert/Alert";
import ProjectHistoryView from "./ProjectHistoryView";
import type { Project } from "../projects.d";
import { projectApi } from "../projects.service";
import { useProjects, useProjectResource, useProjectActions } from "../projects.hooks";
export default function ProjectHistory({ project }: { project: Project }) {
  const { t } = useProjects();
  const r = useProjectResource(useCallback(() => projectApi.history(project.id), [project.id]));
  const a = useProjectActions();
  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-label font-semi-bold">{t("history")}</h2>
      {r.error && <Alert>{r.error}</Alert>}
      <ProjectHistoryView
        items={r.data}
        failed={Boolean(r.error)}
        busy={a.busy}
        onRefresh={() => void a.execute(r.reload, t("feedback.refreshed"))}
      />
    </div>
  );
}
