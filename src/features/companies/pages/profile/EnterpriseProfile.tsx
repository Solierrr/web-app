import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import ProfilePage from "@/components/layout/profile/ProfilePage";
import ProfilePageSkeleton from "@/components/layout/profile/ProfilePageSkeleton";
import { getMyCompany } from "@/features/companies/company.service";
import type { Company } from "@/features/companies/company";
import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";

interface EnterpriseProfilePackedProps {
    company: Company;
}

function EnterpriseProfilePacked({ company }: EnterpriseProfilePackedProps) {
    return (
        <ProfilePage
            bannerUrl={company.bannerUrl}
            avatarUrl={company.logoUrl}
            name={company.tradeName}
            subtitle={company.businessContact?.website ?? company.cnpj}
        >
            <div className="flex flex-col gap-2">
                <h2>{company.corporateName}</h2>
                {company.address && (
                    <p className="text-input-text">
                        {company.address.street}, {company.address.number} — {company.address.city}/{company.address.state}
                    </p>
                )}
                {company.businessContact?.companyEmail && (
                    <p className="text-input-text">{company.businessContact.companyEmail}</p>
                )}
            </div>
        </ProfilePage>
    );
}

export default function EnterpriseProfile() {
    const { lang: langParam } = useParams<{ lang: string }>();
    const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const { t } = useTranslation("commons");

    useEffect(() => {
        let active = true;

        getMyCompany().then((result) => {
            if (active) setCompany(result);
        }).catch(() => {
            if (active) setError(true);
        }).finally(() => {
            if (active) setLoading(false);
        });

        return () => { active = false; };
    }, []);

    if (loading) return <ProfilePageSkeleton />;
    if (error) return <p role="alert" className="p-6">{t("myCompany.loadError")}</p>;
    if (!company) return <div className="flex flex-col gap-3 p-6"><p>{t("myCompany.empty")}</p><Link className="text-orange" to={routePaths.profileOnboardingCompany(lang)}>{t("myCompany.register")}</Link></div>;

    return <EnterpriseProfilePacked company={company} />;
}
