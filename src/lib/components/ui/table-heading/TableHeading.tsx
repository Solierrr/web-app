import type { ComponentProps } from "react";
import Icon from "@@/ui/icon/Icon";

export default function TableHeading({
  label,
  direction,
  onSort,
  disabled,
  children,
  ...props
}: Omit<ComponentProps<"th">, "children"> & {
  label: string;
  direction?: "asc" | "desc";
  onSort?: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <th
      {...props}
      scope="col"
      aria-sort={onSort ? (direction === "asc" ? "ascending" : direction === "desc" ? "descending" : "none") : undefined}
      className="border-b border-operational-border px-4 py-3.5 text-left font-medium whitespace-nowrap">
      {children ??
        (onSort ? (
          <button
            type="button"
            onClick={onSort}
            disabled={disabled}
            className="flex w-full cursor-pointer items-center justify-start gap-2 text-inherit disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-operational-ink">
            <span className="text-inherit">{label}</span>
            <span aria-hidden="true" className={direction ? "text-orange" : "text-operational-muted"}>
              <Icon
                name={direction ? "arrowUp" : "chevronDown"}
                size={14}
                color="currentColor"
                className={`${direction === "desc" ? "rotate-180" : ""} text-inherit [&_*]:text-inherit`}
              />
            </span>
          </button>
        ) : (
          label
        ))}
    </th>
  );
}
