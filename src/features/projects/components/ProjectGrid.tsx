import { useState, type ReactNode } from "react";
import SearchBar, { SearchBarAction, SearchBarSelect } from "@@/ui/search-bar/SearchBar";
import Pagination from "@@/ui/pagination/Pagination";
import Skeleton from "@@/feedback/skeleton/Skeleton";
import ProjectCard from "./ProjectCard";
import { useProjects } from "../projects.hooks";
import { notify } from "@@/feedback/toast/Toast.utils";
import type { Project } from "../projects.d";

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
          <>
            <SearchBarSelect
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
            <SearchBarAction icon="refresh" label={t("refresh")} disabled={refreshing} onClick={() => void refresh()} />
          </>
        }
      />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3" aria-busy={!projects}>
        {!projects
          ? Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="flex flex-col gap-4">
                <div className="aspect-[6/5] overflow-hidden rounded-surface">
                  <Skeleton />
                </div>
                <div className="flex flex-col gap-2">
                  <Skeleton height={20} width="75%" className="rounded-medium" />
                  <Skeleton height={16} width="50%" className="rounded-medium" />
                </div>
              </div>
            ))
          : filtered.slice((current - 1) * 9, current * 9).map((p) => <ProjectCard key={p.id} project={p} rowAction={rowAction(p)} />)}
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
