import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import Skeleton from "@@/feedback/skeleton/Skeleton";
import OfferShelf from "@/features/marketplace/components/OfferShelf";
import ProjectCard from "@/features/projects/components/ProjectCard";
import { useProjectResource, useProjects } from "@/features/projects/projects.hooks";
import { projectApi } from "@/features/projects/projects.service";
import type { Project } from "@/features/projects/projects.d";

const PLACEHOLDERS = 3;

function ProjectShelf({ projects }: { projects: Project[] | null }) {
  const { t } = useTranslation("profile", { keyPrefix: "company" });
  const { t: tProjects } = useProjects();
  const sorted = projects?.toSorted((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <OfferShelf title={t("projects")}>
      {!sorted ? (
        Array.from({ length: PLACEHOLDERS }, (_, i) => (
          <div key={i} className="flex w-72 shrink-0 flex-col gap-4 sm:w-88" aria-hidden="true">
            <div className="aspect-[6/5] overflow-hidden rounded-surface">
              <Skeleton />
            </div>
            <Skeleton height={20} width="60%" className="rounded-medium" />
          </div>
        ))
      ) : sorted.length === 0 ? (
        <p role="status" className="text-body text-operational-muted">
          {tProjects("empty")}
        </p>
      ) : (
        sorted.map((project) => (
          <div key={project.id} className="w-72 shrink-0 snap-start sm:w-88">
            <ProjectCard project={project} />
          </div>
        ))
      )}
    </OfferShelf>
  );
}

export default function CompanyProfileProjects({ companyId }: { companyId: string }) {
  const { t } = useTranslation("profile", { keyPrefix: "company" });
  const loader = useCallback(async () => (await projectApi.list(companyId)).filter((project) => project.ownerCompanyId === companyId), [companyId]);
  const { data, error, reload } = useProjectResource(loader);
  if (error)
    return (
      <div className="flex items-center gap-3">
        <p role="alert">{error}</p>
        <ToolbarAction icon="refresh" label={t("retry")} onClick={() => void reload().catch(() => undefined)} />
      </div>
    );
  return <ProjectShelf projects={data} />;
}
