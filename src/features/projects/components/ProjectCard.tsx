import { useEffect, useState, type ReactNode } from "react";
import MarketplaceCard from "@/features/marketplace/components/MarketplaceCard";
import MarketplaceImage from "@/features/marketplace/components/MarketplaceImage";
import ProjectStatus from "./ProjectStatus";
import { useProjects } from "../projects.hooks";
import { projectApi, projectPhotoBlob } from "../projects.service";
import { routePaths } from "@/config/i18n/paths";
import type { Project } from "../projects.d";

function ProjectCover({ project }: { project: Project }) {
  const [src, setSrc] = useState<string>();
  useEffect(() => {
    let active = true;
    let url: string | undefined;
    const controller = new AbortController();
    void projectApi
      .photos(project.id)
      .then(async (photos) => {
        const cover = photos.find((photo) => photo.cover) ?? photos[0];
        if (!active) return;
        if (!cover) {
          setSrc(undefined);
          return;
        }
        const blob = await projectPhotoBlob(project.id, cover.id, controller.signal);
        if (!active) return;
        url = URL.createObjectURL(blob);
        setSrc(url);
      })
      .catch(() => {
        if (active) setSrc(undefined);
      });
    return () => {
      active = false;
      controller.abort();
      if (url) URL.revokeObjectURL(url);
    };
  }, [project]);
  return <MarketplaceImage src={src} alt={project.name} fallback="folder" className="aspect-[6/5] rounded-surface" />;
}

export default function ProjectCard({ project, rowAction }: { project: Project; rowAction?: ReactNode }) {
  const { lang, t } = useProjects();
  const location = [project.location?.city, project.location?.state].filter(Boolean).join(", ");
  const href = routePaths.projectDetail(lang, project.id);
  return (
    <div className="relative min-w-0">
      <MarketplaceCard
        href={href}
        name={project.name}
        action={{ icon: "chevronRight", label: t("view"), to: href }}
        media={
          <div className="relative">
            <ProjectCover project={project} />
            <div className="absolute left-4 top-4 max-w-[calc(100%-5rem)]">
              <ProjectStatus status={project.status} archived={project.archived} />
            </div>
          </div>
        }>
        <div className="flex min-w-0 flex-col gap-1">
          <h3 title={project.name} className="line-clamp-1 text-body font-semi-bold leading-6 text-operational-ink">
            {project.name}
          </h3>
          <p className="line-clamp-1 text-sidebar font-medium leading-6 text-operational-muted">{location || t(`roles.${project.role}`)}</p>
        </div>
      </MarketplaceCard>
      {rowAction && <div className="absolute right-4 top-4 rounded-medium bg-white">{rowAction}</div>}
    </div>
  );
}
