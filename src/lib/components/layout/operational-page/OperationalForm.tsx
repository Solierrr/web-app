import { useId, useState, type ComponentProps, type ReactNode } from "react";
import { flushSync } from "react-dom";
import Canvas from "@@/layout/access/canvas/Canvas";
import ToolbarAction from "@@/ui/button/ToolbarAction";

export function FormSurface({ children }: { children: ReactNode }) {
  return (
    <div className="form-surface relative isolate mx-auto w-full min-w-0 rounded-medium border border-operational-border bg-white">
      <div aria-hidden="true" className="form-corners pointer-events-none absolute inset-0 overflow-hidden rounded-medium">
        <Canvas variant="grid" style={{ maskImage: "none" }} />
      </div>
      <div className="relative mx-auto flex w-full max-w-operational-form flex-col gap-6 px-5 py-8 sm:px-10 sm:py-10">{children}</div>
    </div>
  );
}

export function FormSection({
  title,
  children,
  collapsible = false,
  defaultExpanded = true,
  titleAccessory,
  variant = "default",
}: {
  title: string;
  children: ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  titleAccessory?: ReactNode;
  variant?: "default" | "tonal";
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const id = useId();
  if (collapsible) {
    return (
      <section
        aria-labelledby={`${id}-title`}
        className={`flex w-full min-w-0 flex-col ${variant === "tonal" ? "gap-0 rounded-surface bg-surface-container px-5 sm:px-6" : "gap-4"}`}
        onInvalidCapture={() => flushSync(() => setExpanded(true))}>
        <div
          className={`flex items-center justify-between gap-3 ${variant === "tonal" ? "min-h-16 py-2" : "border-b border-operational-border pb-2"}`}>
          <div className="flex min-w-0 items-center gap-2">
            <h2 id={`${id}-title`} className="text-body font-semi-bold">
              {title}
            </h2>
            {titleAccessory}
          </div>
          <ToolbarAction
            icon="chevronDown"
            iconSize={24}
            color="var(--color-input-icon)"
            className={`w-14! [&_svg]:transition-transform [&_svg]:duration-300 motion-reduce:[&_svg]:transition-none ${expanded ? "[&_svg]:rotate-180" : ""}`}
            label={title}
            aria-controls={id}
            aria-expanded={expanded}
            onClick={() => setExpanded(!expanded)}
          />
        </div>
        <div id={id} aria-hidden={!expanded} inert={!expanded} className={`form-section-body ${expanded ? "is-expanded" : ""}`}>
          <div className="min-h-0 overflow-hidden">
            <div className={`flex w-full min-w-0 flex-col gap-4 ${variant === "tonal" ? "pb-6 pt-2" : ""}`}>{children}</div>
          </div>
        </div>
      </section>
    );
  }
  return (
    <fieldset className="flex min-w-0 flex-col gap-5 rounded-medium border border-operational-border bg-white/95 p-5 sm:p-6">
      <legend className="px-2 text-body font-semi-bold text-operational-ink">{title}</legend>
      {children}
    </fieldset>
  );
}

export default function OperationalForm({
  children,
  className = "",
  plain = false,
  tone = "default",
  ...props
}: ComponentProps<"form"> & { plain?: boolean; tone?: "default" | "tonal" }) {
  const form = (
    <form
      {...props}
      className={`operational-form flex w-full min-w-0 flex-col gap-6 [&>:is(div,label):has(+section)]:pb-2 ${plain ? "operational-form-login [&_[role=combobox]]:min-h-12" : ""} ${tone === "tonal" ? "[&_.bg-input-bg]:transition-colors [&_.bg-input-bg:focus-within]:ring-2 [&_.bg-input-bg:focus-within]:ring-operational-muted/30 [&_.bg-input-bg:has([aria-invalid=true])]:ring-2 [&_.bg-input-bg:has([aria-invalid=true])]:ring-feedback-error/40" : ""} ${className}`}>
      {children}
    </form>
  );
  return plain ? form : <FormSurface>{form}</FormSurface>;
}
