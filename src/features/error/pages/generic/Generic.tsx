import Canvas from "@@/layout/access/canvas/Canvas";
import { PrimaryButton } from "@@/ui/button/Button.presets";

interface ErrorPageProps {
  code?: string;
  title: string;
  message: string;
  actionLabel: string;
  onReturn: () => void;
}

export default function ErrorPage({ code, title, message, actionLabel, onReturn }: ErrorPageProps) {
  return (
    <main className="relative isolate flex min-h-dvh w-full items-center justify-center overflow-hidden bg-operational-surface px-6 py-12">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <Canvas variant="grid" interactionScope="page" backgroundColor="var(--color-operational-surface)" style={{ maskImage: "none" }} />
      </div>
      <div className="relative flex w-full max-w-operational-copy flex-col items-center gap-6 rounded-hard bg-white p-4 text-center shadow-[0_0_64px_48px_var(--color-white)] sm:p-6">
        {code && <p className="select-none text-8xl font-semi-bold leading-none tracking-tight text-orange sm:text-9xl">{code}</p>}
        <div className="flex max-w-operational-form flex-col gap-3">
          <h1 className="text-operational-title font-semi-bold leading-8 text-operational-ink">{title}</h1>
          <p className="text-operational-muted leading-7">{message}</p>
        </div>
        <PrimaryButton
          type="button"
          content={actionLabel}
          description={actionLabel}
          icon={{ name: "chevronLeft", inverse: true }}
          onClick={onReturn}
          className="mt-2 h-12 min-w-48"
        />
      </div>
    </main>
  );
}
