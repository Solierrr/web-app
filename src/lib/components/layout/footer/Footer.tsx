import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SurfaceGroup from "@@/ui/surface/SurfaceGroup";
import GroupAction from "@@/ui/button/GroupAction";
import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";

const GITHUB_URL = "https://github.com/Solierrr";
const CONTACT_EMAIL = "solaria.innetwork@gmail.com";

export default function Footer() {
  const { t: market } = useTranslation("marketplace");
  const { t: policy } = useTranslation("policy");
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;

  return (
    <footer className="mx-auto w-full max-w-marketplace-page px-5 pb-8 pt-6 sm:px-10 lg:px-18">
      <div className="flex justify-center">
        <nav aria-label={market("footer.navigation")}>
          <SurfaceGroup direction="horizontal">
            <GroupAction layout="icon" to={GITHUB_URL} target="_blank" rel="noopener noreferrer" icon="github" label={market("footer.github")} />
            <GroupAction layout="icon" to={`mailto:${CONTACT_EMAIL}`} icon="mail" label={market("footer.email")} />
            <GroupAction layout="icon" to={routePaths.termsPolicy(lang)} icon="shieldCheck" label={policy("terms")} />
          </SurfaceGroup>
        </nav>
      </div>
    </footer>
  );
}
