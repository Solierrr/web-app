import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ProfilePage from "@/lib/components/layout/profile/ProfilePage";
import ProfilePageSkeleton from "@/lib/components/layout/profile/ProfilePageSkeleton";
import { getCatalogTechnicianBySlug, type CatalogTechnician } from "@/features/professionals/professional.service";

interface ProfessionalProfilePackedProps {
    professional: CatalogTechnician;
}

function ProfessionalProfilePacked({ professional }: ProfessionalProfilePackedProps) {
    const { t } = useTranslation("commons", { keyPrefix: "professionalProfile" });

    return (
        <ProfilePage
            name={professional.name}
            subtitle={professional.professions[0]}
        >
            <div className="flex flex-col gap-2">
                {professional.professions.length > 1 && (
                    <p className="text-input-text">{professional.professions.join(", ")}</p>
                )}
                {professional.crea && (
                    <p className="text-input-text">{t("crea")}: {professional.crea}</p>
                )}
            </div>
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

        getCatalogTechnicianBySlug(professionalSlug).then((result) => {
            if (active) setProfessional(result);
        }).catch(() => {
            if (active) setError(true);
        });

        return () => { active = false; };
    }, [professionalSlug]);

    if (error) return <p role="alert" className="p-6">{t("loadError")}</p>;
    if (!professional) return <ProfilePageSkeleton />;

    return <ProfessionalProfilePacked professional={professional} />;
}
