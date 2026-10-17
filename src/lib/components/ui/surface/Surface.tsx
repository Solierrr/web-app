import type { ComponentProps } from "react";

export default function Surface({ children, className = "", ...props }: ComponentProps<"div">) {
  return (
    <div {...props} className={`rounded-surface border-(length:--border-width-ui) border-solid border-border/50 bg-white p-2 shadow-surface ${className}`}>
      <div className="min-w-0 overflow-hidden rounded-[calc(var(--radius-surface)-var(--spacing)*2)] bg-operational-surface">{children}</div>
    </div>
  );
}
