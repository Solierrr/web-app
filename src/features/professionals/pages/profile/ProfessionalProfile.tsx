import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ProfilePage from "@/lib/components/layout/profile/ProfilePage";
import ProfilePageSkeleton from "@/lib/components/layout/profile/ProfilePageSkeleton";
import { getCatalogTechnicianBySlug, type CatalogTechnician } from "@/features/professionals/professional.service";
import { ProfileInfoRow, ProfileInfoSection } from "@/lib/components/layout/profile/ProfilePage.reusable";

interface ProfessionalProfilePackedProps {
  professional: CatalogTechnician;
}

function ProfessionalProfilePacked({ professional }: ProfessionalProfilePackedProps) {
  const { t } = useTranslation("profile", { keyPrefix: "edit" });

  return (
    <ProfilePage name={professional.name} subtitle={professional.professions[0]}>
      <ProfileInfoSection title={t("professionalTitle")}>
        <dl className="divide-y divide-black/5">
          <ProfileInfoRow label={t("profession")} value={professional.professions.join(", ")} />
          <ProfileInfoRow label={t("crea")} value={professional.crea} />
        </dl>
      </ProfileInfoSection>
    </ProfilePage>
  );
}

export default function ProfessionalProfile() {
  const { professionalSlug = "" } = useParams<{ professionalSlug: string }>();
  const { t } = useTranslation("commons", { keyPrefix: "professionalProfile" });
  const [professional, setProfessional] = useState<CatalogTechnician | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    getCatalogTechnicianBySlug(professionalSlug)
      .then((result) => {
        if (active) setProfessional(result);
      })
      .catch(() => {
        if (active) setError(true);
      });

    return () => {
      active = false;
    };
  }, [professionalSlug]);

  if (error)
    return (
      <p role="alert" className="p-6">
        {t("loadError")}
      </p>
    );
  if (!professional) return <ProfilePageSkeleton />;

  return <ProfessionalProfilePacked professional={professional} />;
}
