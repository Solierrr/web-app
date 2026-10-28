import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Select from "@@/ui/select/Select";
import Input from "@@/ui/input/Input";
import Popover from "@@/overlay/popover/Popover";
import SearchBar, { SearchBarAction } from "@@/ui/search-bar/SearchBar";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import { SolarPanelType, SolarPanelModelStatus } from "@/features/solar-panel/solarPanel.enum";
import { EMPTY_FILTERS, MODEL_NUMERIC_FIELDS } from "./SolarPanelModelCrud.table.utils";
import type { ModelFilters, ModelSortField } from "./SolarPanelModelCrud.table";

export default function ModelFiltersPanel({
  value,
  open,
  disabled,
  onChange,
}: {
  value: ModelFilters;
  open: boolean;
  disabled: boolean;
  onChange: (filters: ModelFilters) => void;
}) {
  const { t } = useTranslation("crud", { keyPrefix: "solarPanelModel" });
  const trigger = useRef<HTMLButtonElement>(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const closePopup = useCallback(() => setPopupOpen(false), []);
  const [field, setField] = useState<ModelSortField>("power");
  const range = value.ranges[field] ?? { min: "", max: "" };
  const active = !!(value.type || value.status || Object.values(value.ranges).some((range) => range.min || range.max));
  if (!open) return null;
  return (
    <>
      <SearchBar
        className="mx-auto max-w-full lg:w-[85%]"
        name={t("filters.search")}
        placeholder={t("filters.search")}
        value={value.query ?? ""}
        disabled={disabled}
        onChange={(event) => onChange({ ...value, query: event.target.value })}
        actions={
          <>
            <SearchBarAction
              ref={trigger}
              icon="filter"
              label={t("filters.title")}
              content={t("filters.title")}
              disabled={disabled}
              aria-haspopup="dialog"
              aria-expanded={popupOpen}
              onClick={() => setPopupOpen((current) => !current)}
            />
            {active && (
              <SearchBarAction
                icon="filterRemove"
                label={t("filters.clear")}
                disabled={disabled}
                onClick={() => onChange({ ...EMPTY_FILTERS, query: value.query })}
              />
            )}
          </>
        }
      />
      {popupOpen && (
        <Popover label={t("filters.title")} anchorRef={trigger} onClose={closePopup}>
          <div className="flex flex-col gap-4">
            <ToolbarAction icon="x" label={t("filters.close")} className="absolute right-2 top-2 h-8! w-8!" onClick={closePopup} />
            <div className="grid grid-cols-2 gap-4">
              <label className="flex min-w-0 flex-col gap-2">
                <span>{t("table.type")}</span>
                <Select<string>
                  className="w-full!"
                  name={t("table.type")}
                  clearable={false}
                  value={value.type ?? "ALL"}
                  disabled={disabled}
                  placeholder={t("filters.all")}
                  options={[[t("filters.all"), "ALL"], ...Object.values(SolarPanelType)]}
                  onChange={(type) => onChange({ ...value, type: !type || type === "ALL" ? undefined : (type as SolarPanelType) })}
                />
              </label>
              <label className="flex min-w-0 flex-col gap-2">
                <span className="pr-8">{t("table.status")}</span>
                <Select<string>
                  className="w-full!"
                  name={t("table.status")}
                  clearable={false}
                  value={value.status ?? "ALL"}
                  disabled={disabled}
                  placeholder={t("filters.all")}
                  options={[
                    [t("filters.all"), "ALL"],
                    ...Object.values(SolarPanelModelStatus).map((status) => [t(`statuses.${status}`), status] as const),
                  ]}
                  onChange={(status) => onChange({ ...value, status: !status || status === "ALL" ? undefined : (status as SolarPanelModelStatus) })}
                />
              </label>
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,10rem),1fr))] items-end gap-3">
              <label className="flex min-w-0 flex-col gap-2">
                <span>{t("filters.attribute")}</span>
                <Select
                  className="w-full!"
                  name={t("filters.attribute")}
                  value={field}
                  clearable={false}
                  options={MODEL_NUMERIC_FIELDS.map((key) => [t(`table.${key}`), key] as const)}
                  onChange={(next) => next && setField(next)}
                />
              </label>
              {(["min", "max"] as const).map((bound) => (
                <label key={bound} className="flex min-w-0 flex-col gap-2">
                  <span>{t(`filters.${bound}`)}</span>
                  <Input
                    className="w-full!"
                    name={`${t(`table.${field}`)}: ${t(`filters.${bound}`)}`}
                    type="number"
                    min="0"
                    step="any"
                    value={range[bound]}
                    placeholder={t(`filters.${bound}`)}
                    disabled={disabled}
                    suffix={field === "power" ? "Wp" : field === "efficiency" ? "%" : field === "weight" ? "kg" : "m"}
                    onChange={(event) => onChange({ ...value, ranges: { ...value.ranges, [field]: { ...range, [bound]: event.target.value } } })}
                  />
                </label>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(value.ranges)
                .filter(([, r]) => r.min || r.max)
                .map(([key, r]) => (
                  <ToolbarAction
                    key={key}
                    icon="x"
                    label={t("filters.remove", { field: t(`table.${key}`) })}
                    content={`${t(`table.${key}`)}: ${r.min || "—"} – ${r.max || "—"}`}
                    onClick={() => {
                      const ranges = { ...value.ranges };
                      delete ranges[key as ModelSortField];
                      onChange({ ...value, ranges });
                    }}
                  />
                ))}
            </div>
          </div>
        </Popover>
      )}
    </>
  );
}
