import Icon, { type IconName } from "@@/ui/icon/Icon";

export type StatusFieldState = "approved" | "rejected" | "pending" | "cancelled" | "highlight";

const STATES: Record<StatusFieldState, { icon: IconName; color: string; classes: string }> = {
  cancelled: { icon: "x", color: "var(--color-operational-muted)", classes: "bg-[color-mix(in_srgb,var(--color-black)_8%,white)] text-operational-muted" },
  approved: { icon: "check", color: "var(--color-green)", classes: "bg-[color-mix(in_srgb,var(--color-green)_14%,white)] text-green" },
  rejected: { icon: "x", color: "var(--color-orange-copper)", classes: "bg-[color-mix(in_srgb,var(--color-orange-copper)_14%,white)] text-orange-copper" },
  highlight: { icon: "check", color: "var(--color-orange)", classes: "bg-[color-mix(in_srgb,var(--color-orange)_14%,white)] text-orange-text" },
  pending: { icon: "clock", color: "var(--color-operational-muted)", classes: "bg-[color-mix(in_srgb,var(--color-black)_8%,white)] text-operational-muted" },
};

export default function StatusField({
  state,
  label,
  icon: customIcon,
  className = "",
}: {
  state: StatusFieldState;
  label: string;
  icon?: IconName;
  className?: string;
}) {
  const { icon, color, classes } = STATES[state];
  return (
    <span
      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1 text-body font-medium leading-5 ${classes} ${className}`}>
      <span aria-hidden="true" className="flex shrink-0">
        <Icon name={customIcon ?? icon} size={14} color={color} />
      </span>
      {label}
    </span>
  );
}
