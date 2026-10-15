import { Link } from "react-router-dom";
import Icon from "@@/ui/icon/Icon";

interface BreadcrumbItem {
  label: string;
  to?: string;
  onClick?: () => void;
}

interface BreadcrumbsProps {
  label: string;
  items: BreadcrumbItem[];
  disabled?: boolean;
}

export default function Breadcrumbs({ label, items, disabled = false }: BreadcrumbsProps) {
  const classes =
    "rounded-soft bg-white px-2 py-1 text-body text-operational-muted transition-colors hover:bg-operational-hover focus-visible:outline-2 focus-visible:outline-operational-ink";
  return (
    <nav aria-label={label}>
      <ol className="flex flex-wrap items-center justify-start gap-1 select-text">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-1">
            {index > 0 && (
              <span aria-hidden="true" className="flex size-5 items-center justify-center rounded-soft bg-white text-operational-muted">
                <Icon name="chevronRight" size={12} color="currentColor" className="text-inherit [&_*]:text-inherit" />
              </span>
            )}
            {index === items.length - 1 ? (
              <span aria-current="page" className="rounded-soft bg-white px-2 py-1 text-body text-operational-muted">
                {item.label}
              </span>
            ) : item.to ? (
              <Link
                to={item.to}
                aria-disabled={disabled || undefined}
                tabIndex={disabled ? -1 : undefined}
                className={`${classes} ${disabled ? "opacity-50" : ""}`}
                onClick={(event) => {
                  if (disabled) event.preventDefault();
                  else if (!event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && event.button === 0) item.onClick?.();
                }}>
                {item.label}
              </Link>
            ) : (
              <button
                type="button"
                onClick={item.onClick}
                disabled={disabled}
                className={`${classes} cursor-pointer disabled:cursor-not-allowed disabled:opacity-50`}>
                {item.label}
              </button>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
