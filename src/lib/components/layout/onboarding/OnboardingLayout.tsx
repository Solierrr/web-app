import type { FormEvent, ReactNode } from "react";
import { PrimaryButton } from "@@/ui/button/Button.presets";
import Logo from "@/lib/components/brand/logo/Logo";

interface OnboardingLayoutProps {
  eyebrow?: ReactNode;
  title: string;
  steps: string[];
  step: number;
  submitLabel: string;
  children?: ReactNode;
  error?: ReactNode;
  footer?: ReactNode;
  busy?: boolean;
  progressLabel?: string;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
}

export default function OnboardingLayout({
  eyebrow,
  title,
  steps,
  step,
  submitLabel,
  children,
  error,
  footer,
  busy = false,
  progressLabel,
  onSubmit,
}: OnboardingLayoutProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit?.(event);
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center gap-8 px-4 py-8 sm:px-8">
      <header className="flex w-full max-w-2xl flex-col gap-6">
        <Logo className="self-baseline" />
        <ol aria-label={progressLabel} className="flex w-full gap-2">
          {steps.map((label, index) => (
            <li
              key={index}
              aria-current={index === step ? "step" : undefined}
              title={label}
              className={`h-1 flex-1 rounded-full ${index <= step ? "bg-orange" : "bg-black/10"}`}
            />
          ))}
        </ol>
      </header>
      <main className="flex w-full max-w-2xl flex-col gap-6">
        <div>
          {eyebrow && <p className="text-sm text-black/60">{eyebrow}</p>}
          <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {children}
          <PrimaryButton type="submit" disabled={busy} content={submitLabel} description={submitLabel} rounded className="w-full" />
          {error && <div role="alert" className="text-orange">{error}</div>}
        </form>
        {footer}
      </main>
    </div>
  );
}
