import Icon, { type IconName } from "@@/ui/icon/Icon";

export type StatusFieldState = "approved" | "rejected" | "pending" | "cancelled" | "highlight";

const STATES: Record<StatusFieldState, { icon: IconName; color: string; classes: string }> = {
  cancelled: { icon: "x", color: "var(--color-operational-muted)", classes: "bg-operational-hover text-operational-muted" },
  approved: { icon: "check", color: "var(--color-green)", classes: "bg-green/10 text-green" },
  rejected: { icon: "x", color: "var(--color-orange-copper)", classes: "bg-orange-copper/10 text-orange-copper" },
  highlight: { icon: "check", color: "var(--color-orange)", classes: "bg-orange/10 text-orange" },
  pending: { icon: "clock", color: "var(--color-operational-muted)", classes: "bg-operational-hover text-operational-muted" },
};

export default function StatusField({
  state,
  label,
  icon: customIcon,
  pill = false,
  className = "",
}: {
  state: StatusFieldState;
  label: string;
  icon?: IconName;
  pill?: boolean;
  className?: string;
}) {
  const { icon, color, classes } = STATES[state];
  return (
    <span
      className={`inline-flex items-center gap-2 whitespace-nowrap ${pill ? "rounded-full" : "rounded-small"} px-2.5 py-1 text-body font-medium leading-5 ${classes} ${className}`}>
      <span aria-hidden="true" className="flex shrink-0">
        <Icon name={customIcon ?? icon} size={14} color={color} />
      </span>
      {label}
    </span>
  );
}
