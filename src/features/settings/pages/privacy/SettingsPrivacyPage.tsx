import FormError from "@@/feedback/toast/FormError";
import Checkbox from "@@/ui/checkbox/Checkbox";
import { PrimaryButton } from "@@/ui/button/Button.presets";
import OperationalForm from "@@/layout/operational-page/OperationalForm";
import OperationalPage from "@@/layout/operational-page/OperationalPage";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { getPrivacyPreferences, savePrivacyPreferences } from "../../settings.service";

export default function SettingsPrivacyPage() {
  const { t } = useTranslation("commons", { keyPrefix: "settingsPrivacy" });
  const [preferences, setPreferences] = useState(getPrivacyPreferences);
  const [saved, setSaved] = useState<boolean | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(savePrivacyPreferences(preferences));
  }

  function toggle(name: keyof typeof preferences) {
    setPreferences({ ...preferences, [name]: !preferences[name] });
    setSaved(null);
  }

  return (
    <OperationalPage title={t("title")} description={t("description")} compact form centered formBackground>
      <p className="text-body text-operational-muted">{t("localNotice")}</p>
      <OperationalForm plain onSubmit={handleSubmit}>
        <Checkbox label={t("showContact")} checked={preferences.showContact} onChange={() => toggle("showContact")} />
        <Checkbox label={t("showInSearch")} checked={preferences.showInSearch} onChange={() => toggle("showInSearch")} />
        {saved === true ? <p role="status">{t("saved")}</p> : null}
        <FormError message={saved === false ? t("saveError") : null} />
        <PrimaryButton type="submit" className="min-h-12 w-full" content={t("save")} description={t("save")} />
      </OperationalForm>
    </OperationalPage>
  );
}
