import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ProfilePage from "@/pages/profile/ProfilePage";
import Input from "@@/ui/input/Input";
import { PrimaryButton, SecondaryButton } from "@@/ui/button/Button.presets";
import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/routePaths";

interface ProfileOnboardingProps {
  kind?: "user" | "company";
  name?: string;
  onComplete?: (data: { bannerUrl?: string; avatarUrl?: string }) => void;
}

/**
 * ProfileOnboarding
 *
 * Fluxo genérico de "enfeite" do perfil (banner + foto/logo), reaproveitado
 * tanto pelo onboarding de usuário quanto pelo de empresa (via prop `kind`).
 *
 * NOTE: nenhum dos dois campos existe ainda no schema-api-core.sql (`users`
 * só tem `avatar`; `company` não tem nenhuma coluna de imagem) e não há
 * endpoint de upload — por enquanto só aceita uma URL e guarda no estado local.
 *
 * @param props.kind - Define os textos exibidos ("usuário" ou "empresa").
 * @param props.name - Nome já cadastrado, usado na pré-visualização.
 * @param props.onComplete - Chamado ao concluir, com as URLs informadas.
 */
export default function ProfileOnboarding({
  kind = "user",
  name = "",
  onComplete,
}: ProfileOnboardingProps) {
  const navigate = useNavigate();
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const { t } = useTranslation("profile", { keyPrefix: "onboarding" });
  const [bannerUrl, setBannerUrl] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const scope = kind === "company" ? "company" : "user";

  function handleComplete() {
    onComplete?.({ bannerUrl: bannerUrl || undefined, avatarUrl: avatarUrl || undefined });
    navigate(kind === "company" ? routePaths.ownCompanyProfile(lang) : routePaths.ownUserProfile(lang));
  }

  return (
    <ProfilePage
      bannerUrl={bannerUrl || undefined}
      avatarUrl={avatarUrl || undefined}
      name={name || t("previewFallbackName")}
    >
      <div className="flex max-w-md flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2>{t(`${scope}.bannerHeading`)}</h2>
          <Input
            name="bannerUrl"
            placeholder={t("bannerPlaceholder")}
            value={bannerUrl}
            onChange={(event) => setBannerUrl(event.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <h2>{t(`${scope}.avatarHeading`)}</h2>
          <Input
            name="avatarUrl"
            placeholder={t("avatarPlaceholder")}
            value={avatarUrl}
            onChange={(event) => setAvatarUrl(event.target.value)}
          />
        </div>

        <div className="flex flex-row gap-2">
          <PrimaryButton
            content={t("complete")}
            description={t("completeDescription")}
            onClick={handleComplete}
            rounded
          />
          <SecondaryButton
            content={t("skip")}
            description={t("skipDescription")}
            onClick={handleComplete}
            rounded
          />
        </div>
      </div>
    </ProfilePage>
  );
}
