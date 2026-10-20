import FormError from "@@/feedback/toast/FormError";
import { PrimaryButton } from "@@/ui/button/Button.presets";
import Input from "@@/ui/input/Input";
import OperationalForm from "@@/layout/operational-page/OperationalForm";
import OperationalPage from "@@/layout/operational-page/OperationalPage";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { changePassword } from "@/features/access/access.credentials.service";
import { getAuthSession, clearAuthSession } from "@/lib/shared/auth/authToken.utils";
import { isAlwaysMockMode, waitForMockService } from "@/config/mocks/mockMode.utils";

export default function SettingsSecurityPage() {
  const { t } = useTranslation("commons", { keyPrefix: "settingsSecurity" });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<"unlinked" | "failed" | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isAlwaysMockMode() && !getAuthSession()) {
      setError("unlinked");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      if (isAlwaysMockMode()) await waitForMockService();
      else {
        await changePassword(currentPassword, newPassword);
        clearAuthSession();
      }
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
    } catch {
      setError("failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <OperationalPage title={t("title")} compact form centered formBackground>
      <OperationalForm plain onSubmit={handleSubmit}>
        <label className="flex flex-col gap-1">
          {t("currentPassword")}
          <Input
            name="currentPassword"
            aria-label={t("currentPassword")}
            placeholder={t("currentPassword")}
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            required
            className="w-full"
          />
        </label>
        <label className="flex flex-col gap-1">
          {t("newPassword")}
          <Input
            name="newPassword"
            aria-label={t("newPassword")}
            placeholder={t("newPassword")}
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            required
            minLength={12}
            className="w-full"
          />
        </label>
        <FormError message={error === "unlinked" ? t("unlinkedError") : null} />
        <FormError message={error === "failed" ? t("changeError") : null} />
        {success ? <p role="status">{t("changeSuccess")}</p> : null}
        <PrimaryButton type="submit" disabled={saving} className="min-h-12 w-full" content={t("submit")} description={t("submit")} />
      </OperationalForm>
    </OperationalPage>
  );
}
