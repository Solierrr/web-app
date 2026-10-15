import { useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import { ContextMenu, type ContextMenuHandle } from "@@/overlay/contextMenu/ContextMenu";
import { CompanyStatus } from "@/features/companies/company.enum";

export type RegistrationStatusFilter = "ALL" | `${CompanyStatus}`;
export type RegistrationTypeFilter = "ALL" | "SUPPLIER" | "DEMANDANT";

export default function RegistrationsFilters({
  status,
  type,
  showType,
  disabled,
  onStatusChange,
  onTypeChange,
}: {
  status: RegistrationStatusFilter;
  type: RegistrationTypeFilter;
  showType: boolean;
  disabled: boolean;
  onStatusChange: (value: RegistrationStatusFilter) => void;
  onTypeChange: (value: RegistrationTypeFilter) => void;
}) {
  const { t } = useTranslation("commons", { keyPrefix: "registrations" });
  const id = useId();
  const menu = useRef<ContextMenuHandle>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState<"status" | "type" | null>(null);
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {(["status", ...(showType ? ["type"] : [])] as ("status" | "type")[]).map((kind) => {
        const value = kind === "status" ? status : type;
        const label = `${t(kind === "status" ? "statusFilter" : "typeFilter")}: ${value === "ALL" ? t("all") : kind === "status" ? t(`status.${value}`) : t(value)}`;
        return (
          <ToolbarAction
            key={kind}
            icon="filter"
            label={label}
            content={label}
            disabled={disabled}
            backgroundColor="var(--color-input-bg)"
            aria-haspopup="menu"
            aria-expanded={open === kind}
            aria-controls={open === kind ? id : undefined}
            onClick={(event) => {
              if (open === kind) {
                menu.current?.close();
                return;
              }
              trigger.current = event.currentTarget;
              const bounds = event.currentTarget.getBoundingClientRect();
              const values = kind === "status" ? ["ALL", ...Object.values(CompanyStatus)] : ["ALL", "SUPPLIER", "DEMANDANT"];
              setOpen(kind);
              menu.current?.open(
                values.map((option) => ({
                  label: option === "ALL" ? t("all") : kind === "status" ? t(`status.${option}`) : t(option),
                  icon: option === value ? "check" : undefined,
                  onClick: () => {
                    if (kind === "status") onStatusChange(option as RegistrationStatusFilter);
                    else onTypeChange(option as RegistrationTypeFilter);
                  },
                })),
                bounds.right,
                bounds.bottom + 4,
              );
            }}
          />
        );
      })}
      <ContextMenu
        ref={menu}
        id={id}
        label={t("filters")}
        autoFocus
        triggerRef={trigger}
        align="end"
        onClose={() => {
          setOpen(null);
          trigger.current?.focus();
        }}
      />
    </div>
  );
}
