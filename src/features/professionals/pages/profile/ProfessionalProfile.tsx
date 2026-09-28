import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ProfilePage from "@/components/layout/profile/ProfilePage";
import ProfilePageSkeleton from "@/components/layout/profile/ProfilePageSkeleton";
import { ProfileInfoRow, ProfileInfoSection } from "@/components/layout/profile/ProfilePage.reusable";
import { getProfessionalBySlug } from "@/features/professionals/professional.service";
import type { Professional } from "@/features/professionals/professional";
import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";

interface ProfessionalProfilePackedProps {
  professional: Professional;
}

function ProfessionalProfilePacked({ professional }: ProfessionalProfilePackedProps) {
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const { t } = useTranslation("commons");
  const { t: profile } = useTranslation("profile", { keyPrefix: "professional" });
  const registration = professional.registrations?.[0];

  return (
    <ProfilePage
      avatarUrl={professional.avatar}
      name={professional.name}
      subtitle={registration?.profession}
      eyebrow={profile("kind")}
      actions={
        <Link to={routePaths.chat(lang, professional.id)} className="rounded-medium bg-orange px-4 py-2 font-medium text-white">
          {t("actions.contact")}
        </Link>
      }>
      <ProfileInfoSection title={profile("professionalTitle")} description={profile("professionalDescription")}>
        <dl className="divide-y divide-black/8">
          <ProfileInfoRow label={profile("fields.location")} value={`${professional.address.city}/${professional.address.state}`} />
          <ProfileInfoRow label={profile("fields.email")} value={professional.contact.email} />
          <ProfileInfoRow label={profile("fields.profession")} value={registration?.profession} />
          <ProfileInfoRow
            label={profile("fields.registration")}
            value={registration ? `${registration.council} · ${registration.number}` : undefined}
          />
        </dl>
      </ProfileInfoSection>
    </ProfilePage>
  );
}

export default function ProfessionalProfile() {
  const { professionalSlug = "" } = useParams<{ professionalSlug: string }>();
  const [professional, setProfessional] = useState<Professional | null>(null);

  useEffect(() => {
    let active = true;

    getProfessionalBySlug(professionalSlug).then((result) => {
      if (active) setProfessional(result);
    });

    return () => {
      active = false;
    };
  }, [professionalSlug]);

  if (!professional) return <ProfilePageSkeleton />;

  return <ProfessionalProfilePacked professional={professional} />;
}
