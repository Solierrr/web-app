import type { ReactNode } from "react";
import Surface from "@@/ui/surface/Surface";

interface OperationalDetailsProps {
  title: string;
  status?: ReactNode;
  actions?: ReactNode;
  media?: ReactNode;
  children: ReactNode;
}

/** Shared reading layout; domain pages own data, permissions and edit destinations. */
export default function OperationalDetails({ title, status, actions, media, children }: OperationalDetailsProps) {
  return (
    <Surface className="mx-auto w-full lg:w-[85%]">
      <section aria-label={title} className="flex min-w-0 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-operational-border px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-body font-semi-bold text-operational-ink">{title}</h2>
            {status}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </header>
        <div className={`grid min-w-0 gap-8 p-5 sm:p-6 ${media ? "lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]" : ""}`}>
          {media && <div className="min-w-0">{media}</div>}
          <div className="flex min-w-0 flex-col gap-6">{children}</div>
        </div>
      </section>
    </Surface>
  );
}

export function DetailSection({ title, children, plain = false }: { title: string; children: ReactNode; plain?: boolean }) {
  const Heading = plain ? "h3" : "h2";
  return (
    <section className={plain ? "min-w-0" : "min-w-0 rounded-surface border-ui bg-white p-5 shadow-surface sm:p-6"}>
      <Heading className="mb-4 text-body font-semi-bold text-operational-ink">{title}</Heading>
      <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">{children}</dl>
    </section>
  );
}
export function DetailField({ label, value, prominent = false }: { label: string; value?: ReactNode; prominent?: boolean }) {
  return (
    <div className={`min-w-0 ${prominent ? "rounded-medium bg-white p-4" : ""}`}>
      <dt className="mb-2 text-body text-operational-muted">{label}</dt>
      <dd className={`break-words text-operational-ink ${prominent ? "text-subtitle font-semi-bold tabular-nums" : "text-body font-medium"}`}>
        {value}
      </dd>
    </div>
  );
}
