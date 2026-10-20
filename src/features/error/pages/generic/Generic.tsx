import SideCanvas from "@@/layout/access/canvas/SideCanvas";
import OrganicLogo from "@@/brand/logo/OrganicLogo";
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
      <SideCanvas centerWidth="36rem" centerHeight="28rem" />
      <div className="relative flex w-full max-w-operational-copy flex-col items-center gap-6 p-4 text-center sm:p-6">
        <OrganicLogo width={8} holdMs={2500} transitionMs={500} rotateShape />
        {code && <p className="select-none text-8xl font-semi-bold leading-none tracking-tight text-orange sm:text-9xl">{code}</p>}
        <div className="flex max-w-operational-form flex-col gap-1">
          <h1 className="text-subtitle font-semi-bold leading-tight text-operational-ink">{title}</h1>
          <p className="text-label text-operational-muted leading-relaxed">{message}</p>
        </div>
        <PrimaryButton
          rounded
          variant="soft"
          type="button"
          content={actionLabel}
          description={actionLabel}
          onClick={onReturn}
          className="mt-2 min-h-12 min-w-48"
        />
      </div>
    </main>
  );
}
