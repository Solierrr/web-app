import { useState } from "react";
import Surface from "@@/ui/surface/Surface";
import SearchBar, { SearchBarAction, SearchBarSelect } from "@@/ui/search-bar/SearchBar";
import Icon from "@@/ui/icon/Icon";
import Skeleton from "@@/feedback/skeleton/Skeleton";
import Pagination from "@@/ui/pagination/Pagination";
import { useProjects } from "../projects.hooks";
import { groupByProjectDay, historyCategory } from "../projects.presentation.utils";
import type { ProjectHistory } from "../projects.d";
export default function ProjectHistoryView({
  items,
  busy,
  failed = false,
  onRefresh,
}: {
  items: ProjectHistory[] | null;
  busy: boolean;
  failed?: boolean;
  onRefresh: () => void;
}) {
  const { t, lang } = useProjects();
  const [query, setQuery] = useState(""),
    [category, setCategory] = useState(""),
    [page, setPage] = useState(1);
  const filtered = (items ?? []).filter(
    (h) =>
      (!category || historyCategory(h.action).key === category) &&
      [h.detail, h.actor, t(`historyKinds.${historyCategory(h.action).key}`)]
        .join(" ")
        .toLocaleLowerCase(lang)
        .includes(query.trim().toLocaleLowerCase(lang)),
  );
  const current = Math.min(page, Math.max(1, Math.ceil(filtered.length / 20)));
  const visible = [...filtered].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice((current - 1) * 20, current * 20);
  const groups = groupByProjectDay(visible, (item) => item.createdAt, true);
  const day = new Intl.DateTimeFormat(lang, { day: "numeric", month: "long", year: "numeric" });
  const time = new Intl.DateTimeFormat(lang, { hour: "2-digit", minute: "2-digit" });
  return (
    <div className="flex flex-col gap-6">
      <SearchBar
        name={t("searchHistory")}
        placeholder={t("searchHistory")}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setPage(1);
        }}
        actions={
          <>
            <SearchBarSelect
              name={t("eventType")}
              placeholder={t("allEvents")}
              value={category}
              options={[
                [t("allEvents"), ""],
                ...["created", "updated", "status", "activity", "people", "photos", "archived"].map((k) => [t(`historyKinds.${k}`), k] as const),
              ]}
              onChange={(v) => {
                setCategory(v ?? "");
                setPage(1);
              }}
            />
            <SearchBarAction icon="refresh" label={t("refresh")} disabled={busy} onClick={onRefresh} />
          </>
        }
      />
      {!items && !failed && (
        <Surface>
          <div aria-busy="true" className="flex flex-col gap-5 p-5">
            {[0, 1, 2].map((key) => (
              <div key={key} className="flex flex-col gap-2">
                <Skeleton height={20} width="45%" />
                <Skeleton height={16} width="70%" />
              </div>
            ))}
          </div>
        </Surface>
      )}
      {items && !filtered.length && (
        <p role="status" className="py-10 text-center text-operational-muted">
          {query || category ? t("noResults") : t("historyEmpty")}
        </p>
      )}
      {groups.map((group) => (
        <section key={group.timestamp} className="flex flex-col gap-3">
          <h3 className="text-body! font-semi-bold">{day.format(new Date(group.timestamp))}</h3>
          <Surface>
            <ol className="px-5 py-2">
              {group.items.map((h, index) => {
                const kind = historyCategory(h.action);
                const title = t(`historyKinds.${kind.key}`);
                const detail = h.detail.replace(/\b(OPEN|IN_PROGRESS|COMPLETED|CANCELED)\b/g, (state) => t(`status.${state}`));
                return (
                  <li key={h.id} className="relative flex gap-4 py-4">
                    {index < group.items.length - 1 && (
                      <span aria-hidden="true" className="absolute -bottom-4 left-5 top-14 w-px bg-operational-border" />
                    )}
                    <span
                      aria-hidden="true"
                      className="relative flex size-10 shrink-0 items-center justify-center rounded-medium bg-white text-operational-muted">
                      <Icon name={kind.icon} color="currentColor" size={20} />
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h4 className="text-body font-semi-bold">{title}</h4>
                        <time dateTime={h.createdAt} className="text-body text-operational-muted">
                          {time.format(new Date(h.createdAt))}
                        </time>
                      </div>
                      {detail && detail !== title && <p className="whitespace-pre-wrap break-words text-body">{detail}</p>}
                      {h.actor && <p className="text-body text-operational-muted">{h.actor}</p>}
                    </div>
                  </li>
                );
              })}
            </ol>
          </Surface>
        </section>
      ))}
      {items && filtered.length > 20 && (
        <Pagination page={current} total={filtered.length} pageSize={20} onPageChange={setPage} appearance="borderless" summaryMode="pages" />
      )}
    </div>
  );
}
