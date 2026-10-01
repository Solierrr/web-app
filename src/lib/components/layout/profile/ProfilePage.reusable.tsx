import { useState, type FormEvent, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import Input from "@@/ui/input/Input";
import { PrimaryButton, SecondaryButton } from "@@/ui/button/Button.presets";

interface ProfileInfoSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function ProfileInfoSection({ title, description, children }: ProfileInfoSectionProps) {
  return (
    <section className="rounded-hard border border-black/5 bg-white p-5 sm:p-7">
      <div className="mb-5 flex flex-col gap-1 border-b border-black/8 pb-4">
        <h2 className="text-label">{title}</h2>
        {description && <p className="text-sm text-black/55">{description}</p>}
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
      <dt className="text-sm font-medium text-black/50">{label}</dt>
      <dd className="break-words text-sm font-medium text-black/80">{value}</dd>
    </div>
  );
}

export interface ProfileEditField {
  name: string;
  label: string;
  value: string;
  type?: "text" | "email" | "tel" | "url";
}

interface ProfileEditFormProps {
  title: string;
  fields: ProfileEditField[];
  onCancel: () => void;
  onSave: (values: Record<string, string>) => void;
}

export function ProfileEditForm({ title, fields, onCancel, onSave }: ProfileEditFormProps) {
  const { t } = useTranslation("profile", { keyPrefix: "edit" });
  const [values, setValues] = useState(() => Object.fromEntries(fields.map((field) => [field.name, field.value])));

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave(values);
  }

  return (
    <ProfileInfoSection title={title} description={t("description")}>
      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <label key={field.name} className="flex min-w-0 flex-col gap-2 text-sm font-medium text-black/70">
              {field.label}
              <Input
                name={field.name}
                type={field.type ?? "text"}
                value={values[field.name] ?? ""}
                onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                className="w-full border border-input-outline bg-white focus-within:border-orange"
              />
            </label>
          ))}
        </div>

        <p role="note" className="rounded-medium bg-orange/8 px-4 py-3 text-sm leading-6 text-black/65">
          {t("mockNotice")}
        </p>

        <div className="flex flex-wrap gap-3">
          <PrimaryButton content={t("save")} description={t("save")} rounded type="submit" />
          <SecondaryButton content={t("cancel")} description={t("cancel")} rounded type="button" onClick={onCancel} />
        </div>
      </form>
    </ProfileInfoSection>
  );
}
