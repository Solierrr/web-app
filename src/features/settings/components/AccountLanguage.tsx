import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NativeSelect } from "@@/ui/select/Select";
import { SUPPORTED as SUPPORTED_LANGUAGES, isSupportedLanguage, rememberLanguage } from "@/config/i18n/browser/languages";
import { translatePathToLanguage } from "@/config/i18n/paths";
import { updateAccountLocale } from "@/features/access/access.service";

const LANGUAGE_LABELS: Record<string, string> = {
  "pt-BR": "Português",
  "en-US": "English",
  "es-ES": "Español",
};

// Idioma da conta: define o idioma dos e-mails e leva o site para a mesma página no idioma escolhido
export default function AccountLanguage() {
  const { t, i18n } = useTranslation("commons", { keyPrefix: "settings" });
  const location = useLocation();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function handleChange(value: string) {
    if (!isSupportedLanguage(value) || value === i18n.language) return;
    setBusy(true);
    setFailed(false);
    try {
      await updateAccountLocale(value);
      rememberLanguage(value);
      navigate(translatePathToLanguage(location.pathname, value) + location.search + location.hash, { state: location.state });
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-labelledby="account-language-title" className="flex flex-col gap-3 rounded-surface border-ui bg-white p-4 shadow-surface">
      <h2 id="account-language-title" className="text-label font-medium">
        {t("language")}
      </h2>
      <p className="text-operational-muted">{t("languageHelp")}</p>
      <NativeSelect
        name="account-language"
        aria-label={t("language")}
        value={i18n.language}
        disabled={busy}
        onChange={(event) => void handleChange(event.target.value)}
        className="w-full sm:w-fit">
        {SUPPORTED_LANGUAGES.map((code) => (
          <option key={code} value={code}>
            {LANGUAGE_LABELS[code]}
          </option>
        ))}
      </NativeSelect>
      {failed && <p role="alert">{t("languageError")}</p>}
    </section>
  );
}
