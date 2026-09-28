import type { FormEvent, ReactNode } from "react";
import Input from "@@/ui/input/Input";
import { PasswordInput } from "@@/ui/input/Input.presets";
import { PrimaryButton } from "@@/ui/button/Button.presets";
import Logo from "@/components/brand/logo/Logo";
import { LoginWithGoogle, LoginWithMicrosoft, type LoginProvider } from "@/config/firebase/auth/layout/LoginWithProvider";
import { AnimatedBackground } from "./Access.helper";
import { getMocksMode } from "@/config/mocks/mockMode.utils";
import MocksMode from "@/config/mocks/mocksMode.enum";

export interface AccessField {
  name: string;
  placeholder: string;
  type?: string;
  password?: boolean;
  required?: boolean;
}

interface AccessProps {
  heading: string;
  helperText?: ReactNode;
  formHeaderContent?: ReactNode;
  fields: AccessField[];
  formContent?: ReactNode;
  submitLabel: string;
  footer?: ReactNode;
  error?: ReactNode;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  onMockProviderLogin?: (provider: LoginProvider) => Promise<void>;
}

export default function Access({ heading, helperText, formHeaderContent, fields, formContent, submitLabel, footer, error, onSubmit, onMockProviderLogin }: AccessProps) {
  const mocksEnabled = getMocksMode() !== MocksMode.DEACTIVATED;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit?.(event);
  }

  return (
    <div className="flex min-h-screen w-full scrollbar-none">
      <div className="flex flex-col w-full justify-center items-center-safe sm:px-20 lg:w-7/11">
        <div className="flex flex-col w-full max-w-120 max-md:px-8 max-sm:px-4 gap-6 items-center-safe h-min">
          <div className="flex flex-col w-full gap-12">
            <div className="flex items-center gap-3">
              <Logo className="self-baseline" />
              <h1 className="text-title font-semi-bold">{heading}</h1>
            </div>

            <form onSubmit={handleSubmit} noValidate={mocksEnabled} className="flex flex-col gap-4 w-full">
              {formHeaderContent}
              {fields.map((field) =>
                field.password ? (
                  <PasswordInput key={field.name} name={field.name} placeholder={field.placeholder} required={!mocksEnabled && (field.required ?? true)} className="w-full" />
                ) : (
                  <Input
                    key={field.name}
                    name={field.name}
                    type={field.type ?? "text"}
                    placeholder={field.placeholder}
                    required={!mocksEnabled && (field.required ?? true)}
                    className="w-full"
                  />
                ),
              )}
              {formContent}
              <PrimaryButton type="submit" content={submitLabel} description={submitLabel} rounded className="w-full" />
              {error && <div className="text-orange">{error}</div>}
            </form>
          </div>

          <div className="flex flex-row items-center-safe justify-center gap-4">
            <LoginWithGoogle onMockLogin={onMockProviderLogin ? () => onMockProviderLogin("google") : undefined} />
            <LoginWithMicrosoft onMockLogin={onMockProviderLogin ? () => onMockProviderLogin("microsoft") : undefined} />
          </div>

          {helperText && <div className="text-black/70">{helperText}</div>}
          {footer}
        </div>
      </div>

      <AnimatedBackground className="hidden min-h-screen overflow-hidden lg:block lg:w-full" />
    </div>
  );
}
