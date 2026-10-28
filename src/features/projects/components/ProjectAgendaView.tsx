import { useState, type ReactNode } from "react";
import Surface from "@@/ui/surface/Surface";
import SearchBar, { SearchBarAction, SearchBarSelect } from "@@/ui/search-bar/SearchBar";
import ValueField from "@@/ui/value-field/ValueField";
import Pagination from "@@/ui/pagination/Pagination";
import Skeleton from "@@/feedback/skeleton/Skeleton";
import ProjectStatus from "./ProjectStatus";
import { useProjects } from "../projects.hooks";
import { groupByProjectDay } from "../projects.presentation.utils";
import type { ProjectActivity, ProjectMember } from "../projects.d";

export default function ProjectAgendaView({
  items,
  members,
  busy,
  failed = false,
  onRefresh,
  rowAction,
}: {
  items: ProjectActivity[] | null;
  members: ProjectMember[];
  busy: boolean;
  failed?: boolean;
  onRefresh: () => void;
  rowAction: (item: ProjectActivity) => ReactNode;
}) {
  const { t, lang } = useProjects();
  const [query, setQuery] = useState(""),
    [status, setStatus] = useState(""),
    [type, setType] = useState(""),
    [page, setPage] = useState(1);
  const filtered = (items ?? []).filter(
    (item) =>
      (!status || item.status === status) &&
      (!type || item.type === type) &&
      [item.title, item.description, t(`types.${item.type}`), ...item.assigneeIds.map((id) => members.find((m) => m.userId === id)?.name)]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase(lang)
        .includes(query.trim().toLocaleLowerCase(lang)),
  );
  const current = Math.min(page, Math.max(1, Math.ceil(filtered.length / 12)));
  const groups = groupByProjectDay(filtered, (item) => item.startsAt);
  const visible = new Set(
    [...filtered]
      .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
      .slice((current - 1) * 12, current * 12)
      .map((item) => item.id),
  );
  const day = new Intl.DateTimeFormat(lang, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const time = new Intl.DateTimeFormat(lang, { hour: "2-digit", minute: "2-digit" });
  return (
    <div className="flex flex-col gap-6">
      <SearchBar
        name={t("searchAgenda")}
        placeholder={t("searchAgenda")}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setPage(1);
        }}
        actions={
          <>
            <SearchBarSelect
              name={t("statusLabel")}
              placeholder={t("allActivities")}
              value={status}
              options={[[t("allActivities"), ""], ...["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELED"].map((s) => [t(`status.${s}`), s] as const)]}
              onChange={(v) => {
                setStatus(v ?? "");
                setPage(1);
              }}
            />
            <SearchBarSelect
              name={t("activityType")}
              placeholder={t("allTypes")}
              value={type}
              options={[[t("allTypes"), ""], ...["SERVICE", "VISIT", "MEETING", "OTHER"].map((value) => [t(`types.${value}`), value] as const)]}
              onChange={(value) => {
                setType(value ?? "");
                setPage(1);
              }}
            />
            <SearchBarAction icon="refresh" label={t("refresh")} disabled={busy} onClick={onRefresh} />
          </>
        }
      />
      {!items && !failed && (
        <div aria-busy="true" className="flex flex-col gap-4">
          {[0, 1, 2].map((key) => (
            <Surface key={key}>
              <div className="flex flex-col gap-3 p-5">
                <Skeleton height={20} width="45%" />
                <Skeleton height={16} width="70%" />
              </div>
            </Surface>
          ))}
        </div>
      )}
      {items && !filtered.length && (
        <p role="status" className="py-10 text-center text-operational-muted">
          {query || status || type ? t("noResults") : t("agendaEmpty")}
        </p>
      )}
      {groups
        .filter((group) => group.items.some((item) => visible.has(item.id)))
        .map((group) => (
          <section key={group.timestamp} className="flex flex-col gap-3">
            <h3 className="text-body! font-semi-bold">
              <time dateTime={group.timestamp}>{day.format(new Date(group.timestamp))}</time>
            </h3>
            <Surface>
              <ol className="divide-y divide-operational-border">
                {group.items
                  .filter((item) => visible.has(item.id))
                  .map((item) => {
                    const end = item.endsAt ? new Date(item.endsAt) : null;
                    const sameDay = end && new Date(item.startsAt).toDateString() === end.toDateString();
                    const people = item.assigneeIds.map((id) => members.find((m) => m.userId === id)?.name).filter(Boolean);
                    return (
                      <li key={item.id} className="flex flex-col gap-4 p-5 sm:flex-row">
                        <div className="flex shrink-0 items-start sm:w-28">
                          <ValueField>
                            <time dateTime={item.startsAt}>{time.format(new Date(item.startsAt))}</time>
                          </ValueField>
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <ProjectStatus status={item.status} />
                            <span className="text-body text-operational-muted">
                              {t(`types.${item.type}`)} · {t(item.onsite ? "onsite" : "remote")}
                            </span>
                          </div>
                          <h4 className="break-words text-body font-semi-bold">{item.title}</h4>
                          {item.description && <p className="whitespace-pre-wrap break-words text-body text-operational-muted">{item.description}</p>}
                          <dl className="grid gap-3 text-body sm:grid-cols-2">
                            <div>
                              <dt className="text-operational-muted">{t("endsAt")}</dt>
                              <dd>
                                {end ? (
                                  <time dateTime={item.endsAt!}>{sameDay ? time.format(end) : `${day.format(end)} · ${time.format(end)}`}</time>
                                ) : (
                                  t("noEndTime")
                                )}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-operational-muted">{t("assignees")}</dt>
                              <dd className="break-words">
                                {people.length ? people.join(", ") : t(item.assigneeIds.length ? "assigneesUnavailable" : "unassigned")}
                              </dd>
                            </div>
                          </dl>
                        </div>
                        <div className="shrink-0 self-end sm:self-start">{rowAction(item)}</div>
                      </li>
                    );
                  })}
              </ol>
            </Surface>
          </section>
        ))}
      {items && filtered.length > 12 && (
        <Pagination page={current} total={filtered.length} pageSize={12} onPageChange={setPage} summaryMode="pages" appearance="borderless" />
      )}
    </div>
  );
}
