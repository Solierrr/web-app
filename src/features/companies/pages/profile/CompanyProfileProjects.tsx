import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import ProjectGrid from "@/features/projects/components/ProjectGrid";
import { useProjectResource } from "@/features/projects/projects.hooks";
import { projectApi } from "@/features/projects/projects.service";

export default function CompanyProfileProjects({ companyId }: { companyId: string }) {
  const { t } = useTranslation("profile", { keyPrefix: "company" });
  const loader = useCallback(async () => (await projectApi.list(companyId)).filter((project) => project.ownerCompanyId === companyId), [companyId]);
  const { data, error, reload } = useProjectResource(loader);
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h2 className="text-label font-semi-bold">{t("projects")}</h2>
        <p className="text-body text-operational-muted">{t("projectsPrivate")}</p>
      </div>
      {error ? (
        <div className="flex items-center gap-3">
          <p role="alert">{error}</p>
          <ToolbarAction icon="refresh" label={t("retry")} onClick={() => void reload().catch(() => undefined)} />
        </div>
      ) : (
        <ProjectGrid projects={data} onRefresh={reload} rowAction={() => null} />
      )}
    </section>
  );
}
