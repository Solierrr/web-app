import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ProfilePage from "@/components/layout/profile/ProfilePage";
import ProfilePageSkeleton from "@/components/layout/profile/ProfilePageSkeleton";
import { getCatalogCompanyBySlug, type CatalogCompany } from "@/features/companies/company.service";
import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";

interface CompanyProfilePackedProps {
    company: CatalogCompany;
}

function CompanyProfilePacked({ company }: CompanyProfilePackedProps) {
    const { lang: langParam } = useParams<{ lang: string }>();
    const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
    const { t } = useTranslation("commons");

    return (
        <ProfilePage
            avatarUrl={company.logoUrl}
            name={company.tradeName}
            subtitle={company.city && company.state ? `${company.city}/${company.state}` : undefined}
            actions={
                <Link
                    to={routePaths.contactCompany(lang, company.id)}
                    className="rounded-medium bg-orange px-4 py-2 font-medium text-white"
                >
                    {t("actions.contact")}
                </Link>
            }
        />
    );
}

export default function CompanyProfile() {
    const { companySlug = "" } = useParams<{ companySlug: string }>();
    const { t } = useTranslation("chat");
    const [company, setCompany] = useState<CatalogCompany | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        let active = true;

        getCatalogCompanyBySlug(companySlug).then((result) => {
            if (active) setCompany(result);
        }).catch(() => {
            if (active) setError(true);
        });

        return () => { active = false; };
    }, [companySlug]);

    if (error) return <p role="alert" className="p-6">{t("companyLoadError")}</p>;
    if (!company) return <ProfilePageSkeleton />;

    return <CompanyProfilePacked company={company} />;
}
