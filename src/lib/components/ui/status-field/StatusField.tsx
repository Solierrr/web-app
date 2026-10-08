import Icon, { type IconName } from "@@/ui/icon/Icon";

export type StatusFieldState = "approved" | "rejected" | "pending" | "cancelled";

const STATES: Record<StatusFieldState, { icon: IconName; color: string; classes: string }> = {
  cancelled: { icon: "x", color: "var(--color-operational-muted)", classes: "bg-operational-hover text-operational-muted" },
  approved: { icon: "check", color: "var(--color-green)", classes: "bg-green/10 text-green" },
  rejected: { icon: "x", color: "var(--color-orange-copper)", classes: "bg-orange-copper/10 text-orange-copper" },
  pending: { icon: "clock", color: "var(--color-operational-muted)", classes: "bg-operational-hover text-operational-muted" },
};

export default function StatusField({ state, label, className = "" }: { state: StatusFieldState; label: string; className?: string }) {
  const { icon, color, classes } = STATES[state];
  return (
    <span
      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-small px-2.5 py-1 text-body font-medium leading-5 ${classes} ${className}`}>
      <span aria-hidden="true" className="flex shrink-0">
        <Icon name={icon} size={14} color={color} />
      </span>
      {label}
    </span>
  );
}
