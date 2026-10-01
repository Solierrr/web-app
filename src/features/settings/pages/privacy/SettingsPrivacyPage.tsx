import OperationalPage from "@@/layout/operational-page/OperationalPage";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { getPrivacyPreferences, savePrivacyPreferences } from "../../settings.service";

export default function SettingsPrivacyPage() {
  const { t } = useTranslation("commons", { keyPrefix: "settingsPrivacy" });
  const [preferences, setPreferences] = useState(getPrivacyPreferences);
  const [saved, setSaved] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    savePrivacyPreferences(preferences);
    setSaved(true);
  }

  function toggle(name: keyof typeof preferences) {
    setPreferences({ ...preferences, [name]: !preferences[name] });
    setSaved(false);
  }

  return (
    <OperationalPage title={t("title")} description={t("description")} compact>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={preferences.showContact} onChange={() => toggle("showContact")} />
          {t("showContact")}
        </label>
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={preferences.showInSearch} onChange={() => toggle("showInSearch")} />
          {t("showInSearch")}
        </label>
        {saved ? <p role="status">{t("saved")}</p> : null}
        <button type="submit" className="self-start rounded-small bg-orange px-4 py-2 text-white">
          {t("save")}
        </button>
      </form>
    </OperationalPage>
  );
}
