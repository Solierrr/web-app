import type { RedirectOption } from "@/lib/shared/types/navigation/navigation";
import { flushSync } from "react-dom";
import { Link, useNavigate } from "react-router-dom";

interface SwitcherProps {
  options: RedirectOption[];
  activeUrl: string;
  label: string;
}

export default function Switcher({ options, activeUrl, label }: SwitcherProps) {
  const navigate = useNavigate();

  return (
    <nav aria-label={label} className="flex w-fit max-w-full flex-wrap gap-2 rounded-full bg-input-bg p-1">
      {options.map((option) => (
        <Link
          key={option.url}
          to={option.url}
          aria-current={option.url === activeUrl ? "page" : undefined}
          onClick={(event) => {
            if (
              event.button !== 0 ||
              event.metaKey ||
              event.ctrlKey ||
              event.shiftKey ||
              event.altKey ||
              option.url === activeUrl ||
              !document.startViewTransition ||
              window.matchMedia("(prefers-reduced-motion: reduce)").matches
            )
              return;

            event.preventDefault();
            document.startViewTransition(() => {
              flushSync(() => navigate(option.url));
            });
          }}
          className={`relative isolate rounded-full px-4 py-2 font-medium transition-colors duration-250 motion-reduce:transition-none ${option.url === activeUrl ? "text-orange" : "text-input-text hover:text-black"}`}>
          {option.url === activeUrl && (
            <span
              aria-hidden="true"
              style={{ viewTransitionName: "switcher-selection" }}
              className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-white"
            />
          )}
          <span className="text-inherit">{option.content}</span>
        </Link>
      ))}
    </nav>
  );
}
