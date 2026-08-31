import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ProfilePage from "@/pages/profile/ProfilePage";
import { getProfessionalBySlug } from "@/features/professionals/professional.service";
import type { Professional } from "@/features/professionals/professional";
import { DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/locales/languages";
import { routePaths } from "@/config/locales/routePaths";

export default function ProfessionalProfile() {
    const { lang: langParam, professionalSlug = "" } = useParams<{ lang: string; professionalSlug: string }>();
    const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
    const { t } = useTranslation("commons");
    const [professional, setProfessional] = useState<Professional | null>(null);

    useEffect(() => {
        let active = true;

        getProfessionalBySlug(professionalSlug).then((result) => {
            if (active) setProfessional(result);
        });

        return () => { active = false; };
    }, [professionalSlug]);

    if (!professional) return null;

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
