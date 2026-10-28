import FormError from "@@/feedback/toast/FormError";
import OperationalForm from "@@/layout/operational-page/OperationalForm";
import { useState, type FormEvent, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import Textarea from "@@/ui/textarea/Textarea";
import Input from "@@/ui/input/Input";
import { PrimaryButton, WhiteButton } from "@@/ui/button/Button.presets";

interface ProfileInfoSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function ProfileInfoSection({ title, description, children }: ProfileInfoSectionProps) {
  return (
    <section className="rounded-surface border-ui bg-white shadow-surface p-5 sm:p-7">
      <div className="mb-5 flex flex-col gap-1 border-b border-operational-border pb-4">
        <h2 className="text-label">{title}</h2>
        {description && <p className="text-body text-operational-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}

interface ProfileInfoRowProps {
  label: string;
  value?: string | null;
}

export function ProfileInfoRow({ label, value }: ProfileInfoRowProps) {
  if (!value) return null;

  return (
    <div className="grid gap-1 py-2 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-4">
      <dt className="text-body font-medium text-operational-muted">{label}</dt>
      <dd className="break-words text-body font-medium text-operational-ink">{value}</dd>
    </div>
  );
}

export interface ProfileEditField {
  name: string;
  label: string;
  value: string;
  type?: "text" | "email" | "tel" | "url" | "date" | "textarea";
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

interface ProfileEditFormProps {
  title: string;
  fields: ProfileEditField[];
  onCancel: () => void;
  onSave: (values: Record<string, string>) => void | Promise<void>;
  saving?: boolean;
  error?: string;
  notice?: string;
  plain?: boolean;
}

export function ProfileEditForm({ title, fields, onCancel, onSave, saving = false, error, notice, plain = false }: ProfileEditFormProps) {
  const { t } = useTranslation("profile", { keyPrefix: "edit" });
  const [values, setValues] = useState(() => Object.fromEntries(fields.map((field) => [field.name, field.value])));

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void onSave(values);
  }

  const content = (
    <>
      {plain && (
        <>
          <h2 className="text-body font-semi-bold leading-6">{title}</h2>
          <p className="text-body text-operational-muted">{t("description")}</p>
        </>
      )}
      <OperationalForm plain onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <label key={field.name} className="flex min-w-0 flex-col gap-2 text-body font-medium text-operational-muted">
              {field.label}
              {field.type === "textarea" ? (
                <Textarea
                  name={field.name}
                  aria-label={field.label}
                  placeholder={field.placeholder}
                  value={values[field.name] ?? ""}
                  maxLength={field.maxLength}
                  rows={5}
                  onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                  disabled={saving}
                  className="w-full"
                />
              ) : (
                <Input
                  placeholder={field.label}
                  name={field.name}
                  type={field.type ?? "text"}
                  value={values[field.name] ?? ""}
                  required={field.required}
                  minLength={field.minLength}
                  maxLength={field.maxLength}
                  pattern={field.pattern}
                  onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                  disabled={saving}
                  className="w-full"
                />
              )}
            </label>
          ))}
        </div>

        {notice && (
          <p role="note" className="rounded-medium bg-orange/8 px-4 py-3 text-body leading-6 text-operational-muted">
            {notice}
          </p>
        )}
        <FormError message={error} />

        <div className="flex flex-col gap-3">
          <PrimaryButton
            content={saving ? t("saving") : t("save")}
            description={saving ? t("saving") : t("save")}
            className="min-h-12 w-full"
            type="submit"
            disabled={saving}
          />
          <WhiteButton
            content={t("cancel")}
            description={t("cancel")}
            className="min-h-12 w-full"
            type="button"
            onClick={onCancel}
            disabled={saving}
          />
        </div>
      </OperationalForm>
    </>
  );
  return plain ? (
    content
  ) : (
    <ProfileInfoSection title={title} description={t("description")}>
      {content}
    </ProfileInfoSection>
  );
}
