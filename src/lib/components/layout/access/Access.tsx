import type { ChangeEventHandler, FormEvent, ReactNode } from "react";
import Input from "@@/ui/input/Input";
import { PasswordInput } from "@@/ui/input/Input.presets";
import { PrimaryButton } from "@@/ui/button/Button.presets";
import Logo from "@/lib/components/brand/logo/Logo";
import Canvas from "./canvas/Canvas";

export interface AccessField {
  name: string;
  placeholder: string;
  type?: string;
  password?: boolean;
  minLength?: number;
  label?: string;
  value?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  autoComplete?: string;
  autoFocus?: boolean;
}

interface AccessProps {
  heading: string;
  helperText?: ReactNode;
  fields?: AccessField[];
  submitLabel?: string;
  error?: ReactNode;
  footer?: ReactNode;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  children?: ReactNode;
  busy?: boolean;
  animatedBackground?: boolean;
  compact?: boolean;
  formHeader?: ReactNode;
  beforeSubmit?: ReactNode;
  background?: ReactNode;
}

export default function Access({
  heading,
  helperText,
  fields = [],
  submitLabel,
  error,
  footer,
  onSubmit,
  children,
  busy = false,
  animatedBackground = true,
  compact = false,
  formHeader,
  beforeSubmit,
  background,
}: AccessProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit?.(event);
  }

  return (
    <div className="flex min-h-screen w-full bg-white scrollbar-none">
      <div
        className={`flex flex-col w-full justify-center items-center-safe ${compact ? "px-6 py-10 sm:px-12" : "sm:px-20"} ${animatedBackground ? (compact ? "lg:w-1/2 lg:shrink-0" : "lg:w-7/11") : ""}`}>
        <div className={`flex flex-col w-full ${compact ? "max-w-96" : "max-w-120 max-md:px-8 max-sm:px-4"} gap-6 items-center-safe h-min`}>
          <div className={`flex flex-col w-full ${compact ? "gap-7" : "gap-12"}`}>
            <Logo className={compact ? "self-center" : "self-baseline"} />
            {heading !== "Solaria" && <h1 className={`text-2xl font-semibold ${compact ? "text-center" : ""}`}>{heading}</h1>}
            {formHeader}

            {submitLabel ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
                {children}
                {fields.map((field) => (
                  <div key={field.name} className="flex flex-col gap-2">
                    {field.label && (
                      <label htmlFor={`access-${field.name}`} className="text-sm font-medium">
                        {field.label}
                      </label>
                    )}
                    {field.password ? (
                      <PasswordInput
                        id={`access-${field.name}`}
                        name={field.name}
                        placeholder={field.placeholder}
                        minLength={field.minLength}
                        required
                        value={field.value}
                        onChange={field.onChange}
                        autoComplete={field.autoComplete}
                        autoFocus={field.autoFocus}
                        disabled={busy}
                        aria-label={field.label ?? field.name}
                        className={`w-full ${compact ? "min-h-12" : ""}`}
                      />
                    ) : (
                      <Input
                        id={`access-${field.name}`}
                        name={field.name}
                        type={field.type ?? "text"}
                        placeholder={field.placeholder}
                        required
                        value={field.value}
                        onChange={field.onChange}
                        autoComplete={field.autoComplete}
                        autoFocus={field.autoFocus}
                        disabled={busy}
                        aria-label={field.label ?? field.name}
                        className={`w-full ${compact ? "min-h-12" : ""}`}
                      />
                    )}
                  </div>
                ))}
                {beforeSubmit}
                <PrimaryButton
                  type="submit"
                  disabled={busy}
                  content={submitLabel}
                  description={submitLabel}
                  rounded={!compact}
                  className={`w-full ${compact ? "min-h-12" : ""}`}
                />
              </form>
            ) : (
              <div className="flex flex-col gap-4 w-full">{children}</div>
            )}
            {error && (
              <div role="alert" className="text-orange">
                {error}
              </div>
            )}
          </div>
          {helperText && <div className="text-black/70">{helperText}</div>}
          {footer}
        </div>
      </div>

      {animatedBackground &&
        (background ?? (
          <section className="relative hidden min-h-screen min-w-0 flex-1 overflow-hidden bg-white lg:block">
            <Canvas variant="grid" />
          </section>
        ))}
    </div>
  );
}
