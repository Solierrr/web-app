import type { ComponentProps } from "react";

export default function Surface({
  children,
  className = "",
  contentClassName = "",
  field = false,
  ...props
}: ComponentProps<"div"> & { contentClassName?: string; field?: boolean }) {
  return (
    <div
      {...props}
      className={`${field ? "rounded-field" : "rounded-surface"} border-(length:--border-width-ui) border-solid border-border/50 bg-white p-2 shadow-surface ${className}`}>
      <div
        className={`min-w-0 overflow-hidden ${field ? "rounded-[calc(var(--radius-field)-var(--spacing)*2)]" : "rounded-[calc(var(--radius-surface)-var(--spacing)*2)]"} bg-operational-surface ${contentClassName}`}>
        {children}
      </div>
    </div>
  );
}
