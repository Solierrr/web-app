import { useState, type ReactNode } from "react";
import Surface from "@@/ui/surface/Surface";
import SearchBar, { SearchBarAction, SearchBarSelect } from "@@/ui/search-bar/SearchBar";
import ValueField from "@@/ui/value-field/ValueField";
import Skeleton from "@@/feedback/skeleton/Skeleton";
import Pagination from "@@/ui/pagination/Pagination";
import { useProjects } from "../projects.hooks";
import type { ProjectMember } from "../projects.d";
export default function ProjectMembersView({
  items,
  busy,
  failed = false,
  onRefresh,
  rowAction,
}: {
  items: ProjectMember[] | null;
  busy: boolean;
  failed?: boolean;
  onRefresh: () => void;
  rowAction?: (member: ProjectMember) => ReactNode;
}) {
  const { t, lang } = useProjects();
  const [query, setQuery] = useState(""),
    [role, setRole] = useState(""),
    [page, setPage] = useState(1);
  const filtered = (items ?? []).filter(
    (m) =>
      (!role || m.role === role) &&
      [m.name, m.functionName, t(`roles.${m.role}`)].filter(Boolean).join(" ").toLocaleLowerCase(lang).includes(query.trim().toLocaleLowerCase(lang)),
  );
  const current = Math.min(page, Math.max(1, Math.ceil(filtered.length / 12)));
  return (
    <div className="flex flex-col gap-5">
      <SearchBar
        name={t("searchMembers")}
        placeholder={t("searchMembers")}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setPage(1);
        }}
        actions={
          <>
            <SearchBarSelect
              name={t("role")}
              placeholder={t("allMembers")}
              value={role}
              options={[[t("allMembers"), ""], ...["OWNER", "MANAGER", "MEMBER", "VIEWER"].map((r) => [t(`roles.${r}`), r] as const)]}
              onChange={(v) => {
                setRole(v ?? "");
                setPage(1);
              }}
            />
            <SearchBarAction icon="refresh" label={t("refresh")} disabled={busy} onClick={onRefresh} />
          </>
        }
      />
      <div className="grid gap-4 lg:grid-cols-2" aria-busy={!items && !failed}>
        {!items && !failed
          ? [0, 1, 2, 3].map((key) => (
              <Surface key={key}>
                <div className="flex flex-col gap-3 p-5">
                  <Skeleton width="60%" height={20} />
                  <Skeleton width="80%" height={16} />
                </div>
              </Surface>
            ))
          : filtered.slice((current - 1) * 12, current * 12).map((m) => (
              <Surface key={m.id}>
                <article className="flex flex-col gap-4 p-5">
                  <div className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="flex size-12 shrink-0 items-center justify-center rounded-medium bg-white text-body font-semi-bold text-operational-muted">
                      {m.name
                        .trim()
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((word) => word[0])
                        .join("")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="break-words text-body! font-semi-bold">{m.name}</h3>
                      {m.functionName && <p className="mt-1 break-words text-body text-operational-muted">{m.functionName}</p>}
                    </div>
                    {rowAction && <div className="shrink-0">{rowAction(m)}</div>}
                  </div>
                  <div className="self-start">
                    <ValueField>{t(`roles.${m.role}`)}</ValueField>
                  </div>
                  <p className="text-body text-operational-muted">{t(`roleHelp.${m.role}`)}</p>
                </article>
              </Surface>
            ))}
      </div>
      {items && !filtered.length && (
        <p role="status" className="py-10 text-center text-operational-muted">
          {query || role ? t("noResults") : t("membersEmpty")}
        </p>
      )}
      {items && filtered.length > 12 && (
        <Pagination page={current} total={filtered.length} pageSize={12} onPageChange={setPage} appearance="borderless" summaryMode="pages" />
      )}
    </div>
  );
}
