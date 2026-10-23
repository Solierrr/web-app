import FormError from "@@/feedback/toast/FormError";
import { createContext, useContext, useId, useState, type ChangeEventHandler, type FormEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import Input from "@@/ui/input/Input";
import { PasswordInput } from "@@/ui/input/Input.presets";
import { PrimaryButton } from "@@/ui/button/Button.presets";
import OrganicLogo from "@@/brand/logo/OrganicLogo";
import SideCanvas from "./canvas/SideCanvas";
import Alert from "@@/feedback/alert/Alert";
import { notify } from "@@/feedback/toast/Toast.utils";
import SurfaceGroup from "@@/ui/surface/SurfaceGroup";

export interface AccessField {
  name: string;
  placeholder: string;
  type?: string;
  password?: boolean;
  minLength?: number;
  label?: string;
  value?: string;
  defaultValue?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  autoComplete?: string;
  autoFocus?: boolean;
  readOnly?: boolean;
}

export interface AccessProps {
  heading: string;
  helperText?: ReactNode;
  fields?: AccessField[];
  submitLabel?: string;
  submitVariant?: "advanced" | "flat" | "soft";
  error?: ReactNode;
  notice?: ReactNode;
  footer?: ReactNode;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  children?: ReactNode;
  busy?: boolean;
  animatedBackground?: boolean;
  compact?: boolean;
  formHeader?: ReactNode;
  beforeSubmit?: ReactNode;
  background?: ReactNode;
  logoWidth?: number;
  logoInteractive?: boolean;
  backAction?: ReactNode;
  topAction?: ReactNode;
  stepKey?: string;
}

function AccessBody({
  heading,
  helperText,
  fields = [],
  submitLabel,
  submitVariant = "soft",
  error,
  notice,
  footer,
  onSubmit,
  children,
  busy = false,
  compact = true,
  formHeader,
  beforeSubmit,
}: AccessProps) {
  const { t } = useTranslation("access");
  const id = useId();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  function getFieldError(field: AccessField, value: string): string {
    if (!value.trim()) return t("feedback.required");
    if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return t("feedback.invalidEmail");
    if (field.minLength && value.length < field.minLength) return t("feedback.minLength", { count: field.minLength });
    return "";
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const errors: Record<string, string> = {};
    for (const field of fields) {
      const input = event.currentTarget.elements.namedItem(field.name);
      if (!(input instanceof HTMLInputElement)) continue;
      const message = getFieldError(field, input.value);
      if (message) errors[field.name] = message;
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      for (const message of new Set(Object.values(errors))) notify(message === t("feedback.required") ? t("feedback.requiredHelp") : message);
      const input = event.currentTarget.elements.namedItem(Object.keys(errors)[0]);
      if (input instanceof HTMLInputElement) input.focus();
      return;
    }
    onSubmit?.(event);
  }

  return (
      <div className="flex w-full flex-col items-center justify-center">
        <div className={`flex flex-col w-full ${compact ? "max-w-96" : "max-w-120 max-md:px-8 max-sm:px-4"} gap-6 items-center-safe h-min`}>
          <div className="flex flex-col w-full gap-6">
            {(heading !== "Solaria" || helperText) && (
              <div className="flex flex-col gap-1 text-center">
                {heading !== "Solaria" && <h1 className="text-subtitle font-semi-bold leading-tight text-operational-ink">{heading}</h1>}
                {helperText && <div className="text-label leading-relaxed text-operational-muted">{helperText}</div>}
              </div>
            )}
            {formHeader}
            {notice && <Alert state="info">{notice}</Alert>}

            {submitLabel ? (
              <form
                noValidate
                aria-busy={busy}
                onSubmit={handleSubmit}
                onChange={(event) => {
                  const input = event.target;
                  if (!(input instanceof HTMLInputElement)) return;
                  const field = fields.find((item) => item.name === input.name);
                  if (!field) return;
                  setFieldValues((current) => ({ ...current, [input.name]: input.value }));
                  if (fieldErrors[input.name]) setFieldErrors((current) => ({ ...current, [input.name]: getFieldError(field, input.value) }));
                }}
                className="flex flex-col gap-4 w-full">
                {children}
                {fields.length > 0 && (
                  <SurfaceGroup>
                    {fields.map((field) => (
                      <div key={field.name} className="group relative flex flex-col px-4 py-1">
                        {field.label && (
                          <label
                            htmlFor={`${id}-${field.name}`}
                            className="absolute left-4 top-8 z-10 -translate-y-1/2 cursor-text text-body font-medium text-operational-muted transition-all duration-150 group-focus-within:top-[1.125rem] group-focus-within:text-sidebar group-has-[input:not(:placeholder-shown)]:top-[1.125rem] group-has-[input:not(:placeholder-shown)]:text-sidebar motion-reduce:transition-none">
                            {field.label}
                            {getFieldError(field, field.value ?? fieldValues[field.name] ?? field.defaultValue ?? "") && (
                              <span aria-hidden="true" className="text-feedback-error">
                                {" "}
                                *
                              </span>
                            )}
                          </label>
                        )}
                        {field.password ? (
                          <PasswordInput
                            id={`${id}-${field.name}`}
                            name={field.name}
                            placeholder={field.placeholder}
                            minLength={field.minLength}
                            required
                            defaultValue={field.defaultValue}
                            value={field.value}
                            onChange={field.onChange}
                            autoComplete={field.autoComplete}
                            autoFocus={field.autoFocus}
                            readOnly={field.readOnly}
                            disabled={busy}
                            aria-label={field.label ?? field.name}
                            aria-invalid={Boolean(fieldErrors[field.name])}
                            className="w-full min-h-14 bg-transparent! rounded-none! [&_input]:px-0 [&_input::placeholder]:text-transparent [&_input:focus::placeholder]:text-input-text [&_input]:pt-7 [&_input]:pb-1 [&_button]:mr-0"
                          />
                        ) : (
                          <Input
                            id={`${id}-${field.name}`}
                            name={field.name}
                            type={field.type ?? "text"}
                            placeholder={field.placeholder}
                            required
                            defaultValue={field.defaultValue}
                            value={field.value}
                            onChange={field.onChange}
                            autoComplete={field.autoComplete}
                            autoFocus={field.autoFocus}
                            readOnly={field.readOnly}
                            disabled={busy}
                            aria-label={field.label ?? field.name}
                            aria-invalid={Boolean(fieldErrors[field.name])}
                            className="w-full min-h-14 bg-transparent! rounded-none! [&_input]:px-0 [&_input::placeholder]:text-transparent [&_input:focus::placeholder]:text-input-text [&_input]:pt-7 [&_input]:pb-1 [&_button]:mr-0"
                          />
                        )}
                      </div>
                    ))}
                  </SurfaceGroup>
                )}
                {beforeSubmit}
                <PrimaryButton
                  variant={submitVariant}
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
            {typeof error === "string" ? <FormError message={error} /> : error}
          </div>
          {footer}
        </div>
      </div>
  );
}

interface AccessSlots {
  back: HTMLDivElement | null;
  top: HTMLDivElement | null;
  background: HTMLDivElement | null;
}

const AccessShellContext = createContext<AccessSlots | null>(null);

export interface AccessShellProps {
  children: ReactNode;
  logoWidth?: number;
  logoInteractive?: boolean;
}

export function AccessShell({ children, logoWidth = 7, logoInteractive = true }: AccessShellProps) {
  const [back, setBack] = useState<HTMLDivElement | null>(null);
  const [top, setTop] = useState<HTMLDivElement | null>(null);
  const [background, setBackground] = useState<HTMLDivElement | null>(null);

  return (
    <AccessShellContext.Provider value={{ back, top, background }}>
      <main className="access-shell relative isolate flex min-h-dvh w-full flex-col items-center gap-6 bg-white px-6 pt-14 pb-10 scrollbar-none sm:px-12">
        <div ref={setBack} className="absolute left-6 top-6 z-20 [&>button]:w-9! [&>a]:w-9!" />
        <div ref={setTop} className="absolute right-6 top-6 z-20" />
        <div ref={setBackground} aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden" />
        <div className="relative flex h-28 w-full shrink-0 items-center justify-center">
          <OrganicLogo
            width={logoWidth}
            interactive={logoInteractive}
            motion="expressive"
            rotateSymbol
            rotateShape
            holdMs={1571}
            transitionMs={1000}
          />
        </div>
        {children}
      </main>
    </AccessShellContext.Provider>
  );
}

function AccessContent(props: AccessProps) {
  const slots = useContext(AccessShellContext);
  const { backAction, topAction, animatedBackground = true, background, stepKey } = props;
  return (
    <>
      {slots?.back && backAction && createPortal(backAction, slots.back)}
      {slots?.top && topAction && createPortal(topAction, slots.top)}
      {slots?.background && animatedBackground && createPortal(background ?? <SideCanvas centerWidth="36rem" centerHeight="48rem" />, slots.background)}
      <AccessBody key={stepKey} {...props} />
    </>
  );
}

export default function Access(props: AccessProps) {
  const insideShell = useContext(AccessShellContext) !== null;
  if (insideShell) return <AccessContent {...props} />;
  return (
    <AccessShell logoWidth={props.logoWidth} logoInteractive={props.logoInteractive}>
      <AccessContent {...props} />
    </AccessShell>
  );
}
