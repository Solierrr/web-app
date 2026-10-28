import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import Dialog from "@@/overlay/dialog/Dialog";
import Icon, { type IconName } from "@@/ui/icon/Icon";

export default function ProfileDetails({ title, summary, icon, children }: { title: string; summary?: string; icon: IconName; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation("profile", { keyPrefix: "public" });
  return (
    <section className="min-w-0">
      <h2 aria-label={title}>
        <button
          type="button"
          aria-label={`${title}: ${t("viewDetails")}`}
          aria-haspopup="dialog"
          onClick={() => setOpen(true)}
          className="flex w-full cursor-pointer items-center gap-4 rounded-surface p-5 text-left transition-colors hover:bg-operational-surface active:bg-operational-hover focus-visible:outline-2 focus-visible:outline-operational-ink">
          <Icon name={icon} size={24} color="currentColor" className="shrink-0 text-operational-muted" />
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-body font-semi-bold text-operational-ink">{title}</span>
            {summary && <span className="text-sidebar font-medium leading-6 text-operational-muted">{summary}</span>}
          </span>
          <span className="sr-only">{t("viewDetails")}</span>
          <Icon name="chevronRight" size={18} color="currentColor" className="shrink-0 text-operational-muted" />
        </button>
      </h2>
      {open && (
        <Dialog title={title} onClose={() => setOpen(false)} compact>
          {children}
        </Dialog>
      )}
    </section>
  );
}
