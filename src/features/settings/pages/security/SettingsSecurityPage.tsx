import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { changePassword, getCurrentFirebaseUser } from "@/config/firebase/auth/auth.service";

export default function SettingsSecurityPage() {
  const { t } = useTranslation("commons", { keyPrefix: "settingsSecurity" });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<"unlinked" | "failed" | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!getCurrentFirebaseUser()) {
      setError("unlinked");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await changePassword(currentPassword, newPassword);
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
    <main className="mx-auto flex max-w-md flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          {t("currentPassword")}
          <input
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            required
            className="rounded-lg border border-gray-300 p-2"
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
            className="rounded-lg border border-gray-300 p-2"
          />
        </label>
        {error === "unlinked" ? <p role="alert" className="text-red-700">{t("unlinkedError")}</p> : null}
        {error === "failed" ? <p role="alert" className="text-red-700">{t("changeError")}</p> : null}
        {success ? <p role="status">{t("changeSuccess")}</p> : null}
        <button type="submit" disabled={saving} className="rounded-lg bg-orange px-4 py-2 text-white disabled:opacity-50">
          {t("submit")}
        </button>
      </form>
    </main>
  );
}
