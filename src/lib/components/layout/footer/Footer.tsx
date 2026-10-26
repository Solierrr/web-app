import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Icon from "@@/ui/icon/Icon";
import { notify } from "@@/feedback/toast/Toast.utils";
import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";

const GITHUB_URL = "https://github.com/Solierrr";
const CONTACT_EMAIL = "solaria.innetwork@gmail.com";

const iconLink =
  "flex size-10 items-center justify-center rounded-full text-operational-muted transition-colors hover:bg-operational-hover hover:text-operational-ink focus-visible:outline-2 focus-visible:outline-orange";

export default function Footer() {
  const { t: market } = useTranslation("marketplace");
  const { t: policy } = useTranslation("policy");
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;

  function copyEmail() {
    void navigator.clipboard
      ?.writeText(CONTACT_EMAIL)
      .then(() => notify(market("footer.copied", { email: CONTACT_EMAIL })))
      .catch(() => undefined);
  }

  return (
    <footer className="flex justify-center px-5 pb-12 pt-16">
      <div className="flex items-center gap-2">
        <a href={GITHUB_URL} target="_blank" rel="noreferrer" aria-label={market("footer.github")} title={market("footer.github")} className={iconLink}>
          <Icon name="github" size={20} color="currentColor" />
        </a>
        <a href={`mailto:${CONTACT_EMAIL}`} onClick={copyEmail} aria-label={market("footer.email")} title={CONTACT_EMAIL} className={iconLink}>
          <Icon name="mail" size={20} color="currentColor" />
        </a>
        <Link to={routePaths.termsPolicy(lang)} aria-label={policy("terms")} title={policy("terms")} className={iconLink}>
          <Icon name="shieldCheck" size={20} color="currentColor" />
        </Link>
      </div>
    </footer>
  );
}
