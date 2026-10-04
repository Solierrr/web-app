import type { ComponentProps, CSSProperties } from "react";
import { Link } from "react-router-dom";
import Icon, { type IconName } from "@@/ui/icon/Icon";

type ToolbarActionProps = {
  icon?: IconName;
  label: string;
  content?: string;
  iconGradient?: "orange";
  color?: string;
  backgroundColor?: string;
  hoverColor?: string;
  hoverBackgroundColor?: string;
  hideContentOnMobile?: boolean;
} & ((Omit<ComponentProps<"button">, "children"> & { to?: never }) | Omit<ComponentProps<typeof Link>, "children">);

export default function ToolbarAction({
  icon,
  label,
  content,
  iconGradient,
  className,
  color = "var(--color-black)",
  backgroundColor = "transparent",
  hoverColor = color,
  hoverBackgroundColor = "var(--color-operational-hover)",
  hideContentOnMobile = false,
  style,
  ...props
}: ToolbarActionProps) {
  const classes = `toolbar-action flex h-9 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-small text-lower transition-colors duration-250 bg-[var(--action-bg)] text-[color:var(--action-color)] hover:bg-[var(--action-hover-bg)] hover:text-[color:var(--action-hover-color)] focus-visible:outline-2 focus-visible:outline-orange disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none ${content ? "min-w-[42px] px-3" : "w-[42px]"} ${className ?? ""}`;
  const actionStyle = {
    "--action-bg": backgroundColor,
    "--action-color": color,
    "--action-hover-bg": hoverBackgroundColor,
    "--action-hover-color": hoverColor,
    ...style,
  } as CSSProperties;
  const children = (
    <>
      {icon && <Icon name={icon} size={20} color="currentColor" gradient={iconGradient} className="shrink-0 text-inherit [&_*]:text-inherit" />}
      {content && <span className={`text-lower text-inherit ${hideContentOnMobile ? "hidden sm:inline" : ""}`}>{content}</span>}
    </>
  );

  if (props.to !== undefined) {
    return (
      <Link {...props} style={actionStyle} aria-label={label} title={label} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" {...props} style={actionStyle} aria-label={label} title={label} className={classes}>
      {children}
    </button>
  );
}
