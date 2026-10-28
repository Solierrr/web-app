import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import Icon, { type IconName } from "@@/ui/icon/Icon";

type CardAction = { icon: IconName; label: string } & (
  { to: string; onClick?: never; disabled?: never } | { to?: never; onClick: () => void; disabled?: boolean }
);

export default function MarketplaceCard({
  href,
  name,
  media,
  children,
  action,
}: {
  href: string;
  name: string;
  media: ReactNode;
  children: ReactNode;
  action: CardAction;
}) {
  const actionClass =
    "flex size-10 shrink-0 items-center justify-center rounded-full bg-operational-surface text-operational-ink transition-colors hover:bg-operational-hover active:bg-black/20 focus-visible:outline-2 focus-visible:outline-operational-ink disabled:cursor-not-allowed disabled:opacity-50";
  const icon = <Icon name={action.icon} size={20} color="currentColor" />;
  return (
    <article className="group grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-4">
      <Link to={href} aria-label={name} className="contents focus-visible:[&>div]:outline-2 focus-visible:[&>div]:outline-operational-ink">
        <div className="col-span-2 rounded-surface">{media}</div>
        <div className="min-w-0">{children}</div>
      </Link>
      {action.to !== undefined ? (
        <Link to={action.to} aria-label={action.label} title={action.label} className={actionClass}>
          {icon}
        </Link>
      ) : (
        <button
          type="button"
          aria-label={action.label}
          title={action.label}
          disabled={action.disabled}
          onClick={action.onClick}
          className={`${actionClass} cursor-pointer`}>
          {icon}
        </button>
      )}
    </article>
  );
}
