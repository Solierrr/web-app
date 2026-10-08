import { useTranslation } from "react-i18next";
import ToolbarAction from "@@/ui/button/ToolbarAction";

interface PaginationProps {
  page: number;
  total: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  appearance?: "bordered" | "borderless";
  summaryMode?: "items" | "pages";
}

export default function Pagination({ page, total, pageSize = 5, onPageChange, summaryMode = "items", appearance = "bordered" }: PaginationProps) {
  const { t } = useTranslation("commons", { keyPrefix: "pagination" });
  const borderless = appearance === "borderless";
  const buttonClass = `h-10! w-10! ${borderless ? "rounded-medium! bg-white" : "rounded-none!"}`;
  const size = Math.max(1, pageSize);
  const last = Math.max(1, Math.ceil(total / size));
  const current = Math.max(1, Math.min(page, last));
  const start = total ? (current - 1) * size + 1 : 0;
  const end = Math.min(current * size, total);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-body">
      <p role="status" aria-live="polite" className="text-operational-muted">
        {summaryMode === "pages" ? t("pageSummary", { current: total ? current : 0, pages: total ? last : 0 }) : t("summary", { start, end, total })}
      </p>
      <nav
        aria-label={t("label")}
        className={
          borderless
            ? "inline-flex gap-1"
            : "inline-flex overflow-hidden rounded-medium border border-operational-border [&>*+*]:border-l [&>*+*]:border-operational-border"
        }>
        <ToolbarAction icon="chevronsLeft" label={t("first")} disabled={current === 1} onClick={() => onPageChange(1)} className={buttonClass} />
        <ToolbarAction
          icon="chevronLeft"
          label={t("previous")}
          disabled={current === 1}
          onClick={() => onPageChange(current - 1)}
          className={buttonClass}
        />
        <ToolbarAction
          label={t("page", { page: current })}
          content={String(current)}
          aria-current="page"
          className={`h-10! min-w-12! bg-operational-surface! ${borderless ? "rounded-medium!" : "rounded-none!"}`}
        />
        <ToolbarAction
          icon="chevronRight"
          label={t("next")}
          disabled={current === last}
          onClick={() => onPageChange(current + 1)}
          className={buttonClass}
        />
        <ToolbarAction
          icon="chevronsRight"
          label={t("last")}
          disabled={current === last}
          onClick={() => onPageChange(last)}
          className={buttonClass}
        />
      </nav>
    </div>
  );
}
