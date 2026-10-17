import type { SolarPanel } from "@/features/solar-panel/solarPanel";
import type { ModelFilters, ModelSort, ModelSortField } from "./SolarPanelModelCrud.table";
import { valueReference } from "@@/ui/value-field/ValueField.utils";

export function modelReferences(items: SolarPanel[]) {
  const groups = new Map<string, SolarPanel[]>();
  for (const item of items) {
    if (!item.type) continue;
    const group = groups.get(item.type) ?? [];
    group.push(item);
    groups.set(item.type, group);
  }
  return new Map(
    [...groups].map(([type, group]) => [
      type,
      Object.fromEntries(MODEL_NUMERIC_FIELDS.map((field) => [field, valueReference(group.map((item) => modelNumber(item, field)))])),
    ]),
  );
}

export const MODEL_TABLE_COLUMNS = [
  { key: "brand" },
  { key: "model" },
  { key: "type" },
  { key: "power" },
  { key: "efficiency" },
  { key: "width" },
  { key: "length" },
  { key: "weight" },
  { key: "status" },
  { key: "actions" },
] as const;

export const MODEL_NUMERIC_FIELDS: ModelSortField[] = ["power", "efficiency", "width", "length", "weight"];
export const EMPTY_FILTERS: ModelFilters = { ranges: {} };

export function modelNumber(item: SolarPanel, field: ModelSortField) {
  return field === "power" ? item.powerOutput : field === "width" || field === "length" ? item.dimension?.[field] : item[field];
}

export function selectModels(items: SolarPanel[], filters: ModelFilters, sort: ModelSort | null) {
  const normalize = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase();
  const query = normalize(filters.query?.trim() ?? "");
  const selected = items.filter((item) => {
    if (query && !normalize(`${item.brand ?? ""} ${item.model ?? ""} ${item.type ?? ""}`).includes(query)) return false;
    if ((filters.type && item.type !== filters.type) || (filters.status && item.status !== filters.status)) return false;
    return MODEL_NUMERIC_FIELDS.every((field) => {
      const range = filters.ranges[field];
      if (!range || (!range.min && !range.max)) return true;
      const value = modelNumber(item, field);
      if (value == null || !Number.isFinite(value)) return false;
      return (!range.min || value >= Number(range.min)) && (!range.max || value <= Number(range.max));
    });
  });
  if (!sort) return selected;
  return selected.sort((a, b) => {
    const left = modelNumber(a, sort.field);
    const right = modelNumber(b, sort.field);
    const missingLeft = left == null || !Number.isFinite(left);
    const missingRight = right == null || !Number.isFinite(right);
    if (missingLeft || missingRight) return missingLeft === missingRight ? 0 : missingLeft ? 1 : -1;
    return (left! - right!) * (sort.direction === "asc" ? 1 : -1);
  });
}
