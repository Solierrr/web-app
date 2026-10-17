import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import Surface from "@@/ui/surface/Surface";
import SearchBar from "@@/ui/search-bar/SearchBar";
import Select from "@@/ui/select/Select";
import Pagination from "@@/ui/pagination/Pagination";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import Icon from "@@/ui/icon/Icon";
import ValueField from "@@/ui/value-field/ValueField";
import Skeleton from "@@/feedback/skeleton/Skeleton";
import ProjectStatus from "./ProjectStatus";
import { useProjects } from "../projects.hooks";
import { projectApi, projectPhotoBlob } from "../projects.service";
import { routePaths } from "@/config/i18n/paths";
import { notify } from "@@/feedback/toast/Toast.utils";
import type { Project } from "../projects.d";

function ProjectCover({ project }: { project: Project }) {
  const { t } = useProjects();
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
  return (
    <div className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-input-bg">
      {src ? (
        <img
          src={src}
          alt={project.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none"
          onError={() => setSrc(undefined)}
        />
      ) : (
        <div className="flex flex-col items-center gap-3 text-operational-muted">
          <Icon name="folder" />
          <span className="text-body">{t("noCover")}</span>
        </div>
      )}
    </div>
  );
}

export default function ProjectGrid({
  projects,
  onRefresh,
  rowAction,
}: {
  projects: Project[] | null;
  onRefresh: () => Promise<unknown>;
  rowAction: (project: Project) => ReactNode;
}) {
  const { lang, t } = useProjects();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>();
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const filtered =
    projects?.filter(
      (p) =>
        (!status || (p.archived ? "ARCHIVED" : p.status) === status) &&
        [p.name, p.description, p.location?.city, p.location?.state]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase(lang)
          .includes(query.trim().toLocaleLowerCase(lang)),
    ) ?? [];
  const current = Math.min(page, Math.max(1, Math.ceil(filtered.length / 9)));
  async function refresh() {
    setRefreshing(true);
    try {
      await onRefresh();
    } catch {
      notify(t("feedback.failed"));
    } finally {
      setRefreshing(false);
    }
  }
  return (
    <div className="flex flex-col gap-6">
      <SearchBar
        name={t("searchProjects")}
        placeholder={t("searchProjects")}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setPage(1);
        }}
        actions={
          <div className="flex items-center gap-2">
            <Select
              name={t("statusLabel")}
              placeholder={t("allProjects")}
              value={status}
              options={[
                [t("allProjects"), ""],
                ...["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELED"].map((value) => [t(`status.${value}`), value] as const),
                [t("archived"), "ARCHIVED"],
              ]}
              onChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
            />
            <ToolbarAction icon="refresh" label={t("refresh")} disabled={refreshing} onClick={() => void refresh()} />
          </div>
        }
      />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3" aria-busy={!projects}>
        {!projects
          ? Array.from({ length: 6 }, (_, i) => (
              <Surface key={i}>
                <div className="aspect-[4/3]">
                  <Skeleton />
                </div>
                <div className="flex flex-col gap-3 p-5">
                  <Skeleton height={20} width="75%" className="rounded-medium" />
                  <Skeleton height={16} width="50%" className="rounded-medium" />
                </div>
              </Surface>
            ))
          : filtered.slice((current - 1) * 9, current * 9).map((p) => (
              <Surface key={p.id} className="relative transition-shadow duration-200">
                <Link
                  to={routePaths.projectDetail(lang, p.id)}
                  className="group block rounded-medium focus-visible:outline-2 focus-visible:outline-operational-ink">
                  <ProjectCover project={p} />
                  <div className="flex flex-col gap-3 p-5">
                    <div className="pr-12">
                      <ProjectStatus status={p.status} archived={p.archived} />
                    </div>
                    <h2 className="line-clamp-2 text-body font-semi-bold leading-6 text-operational-ink">{p.name}</h2>
                    {p.description && <p className="line-clamp-2 text-body text-operational-muted">{p.description}</p>}
                    {[p.location?.city, p.location?.state].some(Boolean) ? (
                      <div className="self-start">
                        <ValueField>{[p.location?.city, p.location?.state].filter(Boolean).join(" / ")}</ValueField>
                      </div>
                    ) : (
                      <p className="text-body text-operational-muted">{t(`roles.${p.role}`)}</p>
                    )}
                  </div>
                </Link>
                <div className="absolute right-5 top-5 rounded-medium bg-white">{rowAction(p)}</div>
              </Surface>
            ))}
      </div>
      {projects && !filtered.length && (
        <p role="status" className="py-12 text-center text-operational-muted">
          {projects.length ? t("noResults") : t("empty")}
        </p>
      )}
      {projects && filtered.length > 0 && (
        <Pagination page={current} total={filtered.length} pageSize={9} onPageChange={setPage} summaryMode="pages" appearance="borderless" />
      )}
    </div>
  );
}
