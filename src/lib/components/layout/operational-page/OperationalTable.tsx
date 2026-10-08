import type { OperationalColumn, OperationalTableProps } from "./OperationalTable.d";
export type { OperationalColumn } from "./OperationalTable.d";
import { text, normalize } from "./OperationalTable.utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Pagination from "@@/ui/pagination/Pagination";
import Skeleton from "@@/feedback/skeleton/Skeleton";
import Surface from "@@/ui/surface/Surface";
import Input from "@@/ui/input/Input";
import Select from "@@/ui/select/Select";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import TableHeading from "@@/ui/table-heading/TableHeading";
import Popover from "@@/overlay/popover/Popover";
import TableRowOptions from "./OperationalTable.actions";
import { notify } from "@@/feedback/toast/Toast.utils";

export default function OperationalTable<T>({
  label,
  columns,
  items,
  getKey,
  empty,
  onRefresh,
  rowAction,
  onOrderedItemsChange,
}: OperationalTableProps<T>) {
  const { t } = useTranslation("commons", { keyPrefix: "tableUi" });
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sort, setSort] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [bar, setBar] = useState(true);
  const [popup, setPopup] = useState<"filters" | "settings" | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const settings = useRef<HTMLButtonElement>(null);
  const filterButton = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setPopup(null), []);
  const dataColumns = columns.filter((column) => column.key !== "actions");
  const actions = columns.find((column) => column.key === "actions");
  const value = (column: OperationalColumn<T>, item: T) => (column.value ? column.value(item) : text(column.render(item)));
  const ordered = items?.filter((item) => dataColumns.every((column) => !filters[column.key] || String(value(column, item)) === filters[column.key]));
  if (ordered && sort) {
    const column = dataColumns.find((column) => column.key === sort.key)!;
    ordered.sort((a, b) => {
      const left = value(column, a),
        right = value(column, b);
      if (left == null || right == null) return left == null ? (right == null ? 0 : 1) : -1;
      const order =
        typeof left === "number" && typeof right === "number"
          ? left - right
          : String(left).localeCompare(String(right), undefined, { numeric: true });
      return order * (sort.direction === "asc" ? 1 : -1);
    });
  }
  const lastSort = useRef<string | undefined>(undefined);
  const lastOrder = useRef<readonly T[] | null>(null);
  useEffect(() => {
    if (!ordered || !onOrderedItemsChange) return;
    if (
      lastSort.current === JSON.stringify(sort) &&
      lastOrder.current?.length === ordered.length &&
      ordered.every((item, index) => lastOrder.current?.[index] === item)
    )
      return;
    lastOrder.current = ordered;
    lastSort.current = JSON.stringify(sort);
    onOrderedItemsChange(ordered, sort);
  }, [ordered, onOrderedItemsChange, sort]);
  const filtered = ordered?.filter((item) => dataColumns.some((column) => normalize(String(value(column, item) ?? "")).includes(normalize(query))));
  const current = Math.min(page, Math.max(1, Math.ceil((filtered?.length ?? 0) / 5)));
  const visible = filtered?.slice((current - 1) * 5, current * 5);
  const activeFilters = Object.values(filters).some(Boolean);
  async function refresh() {
    if (!onRefresh || refreshing) return;
    setRefreshing(true);
    try {
      await onRefresh();
      notify(t("refreshed"));
    } catch {
      notify(t("refreshError"));
    } finally {
      setRefreshing(false);
    }
  }
  return (
    <section aria-label={label} aria-busy={items === null || refreshing} className="mx-auto flex w-full min-w-0 flex-col gap-3 lg:w-[85%]">
      {bar && (
        <div className="flex min-w-0 items-center gap-2">
          <Input
            name="tableSearch"
            aria-label={t("search")}
            placeholder={t("search")}
            value={query}
            disabled={items === null}
            icon={{ name: "search" }}
            className="min-w-0 flex-1"
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />
          {dataColumns.some((column) => column.filterable) && (
            <ToolbarAction
              ref={filterButton}
              icon="filter"
              label={t("filters")}
              content={t("filters")}
              disabled={items === null}
              onClick={() => setPopup((value) => (value === "filters" ? null : "filters"))}
            />
          )}
          {activeFilters && (
            <ToolbarAction
              icon="x"
              label={t("clearFilters")}
              onClick={() => {
                setFilters({});
                setPage(1);
              }}
            />
          )}
        </div>
      )}
      <Surface>
        <div role="region" aria-label={label} tabIndex={0} className="scrollbar-none overflow-x-auto">
          <table
            className="table-auto w-max min-w-full border-separate border-spacing-0 text-left text-body"
            aria-label={label}
            aria-busy={items === null || refreshing}>
            <thead className="bg-operational-surface">
              <tr>
                {dataColumns.map((column) => (
                  <TableHeading
                    key={column.key}
                    label={column.label}
                    disabled={items === null}
                    direction={sort?.key === column.key ? sort.direction : undefined}
                    onSort={() => {
                      setSort(
                        sort?.key !== column.key
                          ? { key: column.key, direction: "asc" }
                          : sort.direction === "asc"
                            ? { key: column.key, direction: "desc" }
                            : null,
                      );
                      setPage(1);
                    }}
                  />
                ))}
                <th scope="col" className="sticky right-0 z-20 border-b border-operational-border bg-operational-surface px-4 py-3.5 text-left">
                  <ToolbarAction
                    ref={settings}
                    icon="more"
                    label={t("settings")}
                    className="h-8! w-10!"
                    disabled={items === null}
                    onClick={() => setPopup((value) => (value === "settings" ? null : "settings"))}
                  />
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child>td]:border-b-0">
              {visible?.map((item) => (
                <tr key={getKey(item)} className="transition-colors hover:bg-operational-hover/40">
                  {dataColumns.map((column) => (
                    <td key={column.key} className="h-20 border-b border-operational-border px-4 py-0 align-middle whitespace-nowrap">
                      <div className="scrollbar-none flex h-[79px] items-center overflow-auto py-3">
                        <div className="max-h-full">{column.render(item) === "—" ? "" : column.render(item)}</div>
                      </div>
                    </td>
                  ))}
                  <td className="sticky right-0 z-10 h-20 border-b border-operational-border bg-operational-surface px-4 align-middle">
                    <div className="flex items-center justify-end gap-2">
                      {rowAction?.(item)}
                      {(actions || !rowAction) && (
                        <TableRowOptions name={String(value(dataColumns[0], item) ?? "")} disabled={!actions || !actions.render(item)}>
                          {actions?.render(item)}
                        </TableRowOptions>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {items === null &&
                Array.from({ length: 3 }, (_, index) => (
                  <tr key={index}>
                    <td colSpan={dataColumns.length} className="h-20 border-b border-operational-border px-4">
                      <Skeleton height="1.25rem" width="100%" className="rounded-small" />
                    </td>
                    <td className="sticky right-0 h-20 border-b border-operational-border bg-operational-surface px-4">
                      <TableRowOptions disabled />
                    </td>
                  </tr>
                ))}
              {filtered?.length === 0 && (
                <tr>
                  <td colSpan={dataColumns.length + 1} className="h-20 px-4 text-center text-operational-muted">
                    {query || activeFilters ? t("noResults") : empty}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {items !== null && (
          <div className="border-t border-operational-border">
            <Pagination
              page={current}
              total={filtered?.length ?? 0}
              pageSize={5}
              summaryMode="pages"
              appearance="borderless"
              onPageChange={setPage}
            />
          </div>
        )}
      </Surface>
      {popup && (
        <Popover
          label={popup === "settings" ? t("settings") : t("filters")}
          anchorRef={popup === "settings" ? settings : filterButton}
          onClose={close}>
          <div className="relative flex flex-col gap-3">
            <ToolbarAction icon="x" label={t("close")} onClick={close} className="absolute -right-2 -top-2 h-7! w-7!" />
            {popup === "settings" ? (
              <div className="flex flex-col gap-2 pr-6">
                <ToolbarAction
                  icon="search"
                  label={bar ? t("hideSearch") : t("showSearch")}
                  content={bar ? t("hideSearch") : t("showSearch")}
                  onClick={() => {
                    setBar((value) => !value);
                    close();
                  }}
                  className="w-full! justify-start"
                />
                {onRefresh && (
                  <ToolbarAction
                    icon="refresh"
                    label={t("refresh")}
                    content={t("refresh")}
                    disabled={refreshing}
                    onClick={() => {
                      close();
                      void refresh();
                    }}
                    className="w-full! justify-start"
                  />
                )}
              </div>
            ) : (
              <div className="grid gap-3 pr-6 sm:grid-cols-2">
                {dataColumns
                  .filter((column) => column.filterable)
                  .map((column) => (
                    <label key={column.key} className="flex min-w-0 flex-col gap-2">
                      {column.label}
                      <Select
                        name={column.label}
                        value={filters[column.key] ?? ""}
                        placeholder={t("all")}
                        options={[...new Set(items?.map((item) => String(value(column, item) ?? "")))].filter(Boolean)}
                        onChange={(selected) => {
                          setFilters((current) => ({ ...current, [column.key]: selected ?? "" }));
                          setPage(1);
                        }}
                      />
                    </label>
                  ))}
              </div>
            )}
          </div>
        </Popover>
      )}
    </section>
  );
}
