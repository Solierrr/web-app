import OperationalPage from "@@/layout/operational-page/OperationalPage";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { changePassword, getCurrentFirebaseUser } from "@/config/firebase/auth/auth.service";
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
    if (!isAlwaysMockMode() && !getCurrentFirebaseUser()) {
      setError("unlinked");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      if (isAlwaysMockMode()) await waitForMockService();
      else await changePassword(currentPassword, newPassword);
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
    <OperationalPage title={t("title")} compact>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          {t("currentPassword")}
          <input
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            required
            className="rounded-small border border-operational-border p-2"
          />
        </label>
        <label className="flex flex-col gap-1">
          {t("newPassword")}
          <input
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            required
            minLength={12}
            className="rounded-small border border-operational-border p-2"
          />
        </label>
        {error === "unlinked" ? (
          <p role="alert" className="text-red-700">
            {t("unlinkedError")}
          </p>
        ) : null}
        {error === "failed" ? (
          <p role="alert" className="text-red-700">
            {t("changeError")}
          </p>
        ) : null}
        {success ? <p role="status">{t("changeSuccess")}</p> : null}
        <button type="submit" disabled={saving} className="rounded-small bg-orange px-4 py-2 text-white disabled:opacity-50">
          {t("submit")}
        </button>
      </form>
    </OperationalPage>
  );
}
