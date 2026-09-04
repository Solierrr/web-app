import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ProfilePage from "@app/pages/profile/ProfilePage";
import ProfilePageSkeleton from "@app/pages/profile/ProfilePageSkeleton";
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
    const registration = professional.registrations?.[0];

    return (
        <ProfilePage
            avatarUrl={professional.avatar}
            name={professional.name}
            subtitle={registration?.profession}
            actions={
                <Link
                    to={routePaths.chat(lang, professional.id)}
                    className="rounded-medium bg-orange px-4 py-2 font-medium text-white"
                >
                    {t("actions.contact")}
                </Link>
            }
        >
            <div className="flex flex-col gap-2">
                <p className="text-input-text">
                    {professional.address.city}/{professional.address.state}
                </p>
                {professional.contact.email && (
                    <p className="text-input-text">{professional.contact.email}</p>
                )}
                {registration && (
                    <p className="text-input-text">
                        {registration.council} · {registration.number}
                    </p>
                )}
            </div>
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

        return () => { active = false; };
    }, [professionalSlug]);

    if (!professional) return <ProfilePageSkeleton />;

    return <ProfessionalProfilePacked professional={professional} />;
}
