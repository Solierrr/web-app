import { useId, useState, type ReactNode } from "react";

interface TooltipProps {
  label: string;
  content: ReactNode;
}

export default function Tooltip({ label, content }: TooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        aria-label={label}
        aria-describedby={open ? id : undefined}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
        className="flex size-7 cursor-help items-center justify-center rounded-full bg-input-bg text-body text-operational-muted focus-visible:outline-2 focus-visible:outline-operational-ink">
        ?
      </button>
      <span
        id={id}
        role="tooltip"
        aria-hidden={!open}
        className={`absolute right-0 top-full z-50 w-64 max-w-[80vw] rounded-medium bg-white p-3 text-body text-operational-ink shadow-overlay transition-[opacity,transform,visibility] duration-200 ease-out motion-reduce:transition-none ${open ? "visible translate-y-0 opacity-100" : "invisible translate-y-1 opacity-0 pointer-events-none"}`}>
        {content}
      </span>
    </span>
  );
}
