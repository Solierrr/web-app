import type { ReactNode } from "react";

export interface OperationalColumn<T> {
  key: string;
  label: string;
  render: (item: T) => ReactNode;
  value?: (item: T) => string | number | null | undefined;
  filterable?: boolean;
}
export interface OperationalTableProps<T> {
  label: string;
  columns: OperationalColumn<T>[];
  items: T[] | null;
  getKey: (item: T) => string;
  empty: string;
  rowAction?: (item: T) => ReactNode;
  onOrderedItemsChange?: (items: readonly T[], sort: { key: string; direction: "asc" | "desc" } | null) => void;
  onRefresh?: () => Promise<void>;
}
