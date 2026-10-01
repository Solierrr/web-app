import type { FormEvent, ReactNode } from "react";
import Input from "@@/ui/input/Input";
import { PasswordInput } from "@@/ui/input/Input.presets";
import { PrimaryButton } from "@@/ui/button/Button.presets";
import Logo from "@/lib/components/brand/logo/Logo";
import { AnimatedBackground } from "./Access.helper";

export interface AccessField {
  name: string;
  placeholder: string;
  type?: string;
  password?: boolean;
  minLength?: number;
}

interface AccessProps {
  heading: string;
  helperText?: ReactNode;
  fields: AccessField[];
  submitLabel: string;
  error?: ReactNode;
  footer?: ReactNode;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  children?: ReactNode;
  busy?: boolean;
}

export default function Access({ helperText, fields, submitLabel, error, footer, onSubmit, children, busy = false }: AccessProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit?.(event);
  }

  return (
    <div className="flex min-h-screen w-full scrollbar-none">
      <div className="flex flex-col w-full justify-center items-center-safe sm:px-20 lg:w-7/11">
        <div className="flex flex-col w-full max-w-120 max-md:px-8 max-sm:px-4 gap-6 items-center-safe h-min">
          <div className="flex flex-col w-full gap-12">
            <Logo className="self-baseline"/>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
              {children}
              {fields.map((field) =>
                field.password ? (
                  <PasswordInput key={field.name} name={field.name} placeholder={field.placeholder} minLength={field.minLength} required className="w-full" />
                ) : (
                  <Input key={field.name} name={field.name} type={field.type ?? "text"} placeholder={field.placeholder} required className="w-full" />
                ),
              )}
              <PrimaryButton type="submit" disabled={busy} content={submitLabel} description={submitLabel} rounded className="w-full" />
              {error && <div className="text-orange">{error}</div>}
            </form>
          </div>
          {helperText && <div className="text-black/70">{helperText}</div>}
          {footer}
        </div>
      </div>

      <AnimatedBackground className="hidden min-h-screen overflow-hidden lg:block lg:w-full" />
    </div>
  );
}
