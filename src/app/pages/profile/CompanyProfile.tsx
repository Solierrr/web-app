import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ProfilePage from "@app/pages/profile/ProfilePage";
import ProfilePageSkeleton from "@app/pages/profile/ProfilePageSkeleton";
import { getCompanyBySlug } from "@/features/companies/company.service";
import type { Company } from "@/features/companies/company";
import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";

interface CompanyProfilePackedProps {
    company: Company;
}

function CompanyProfilePacked({ company }: CompanyProfilePackedProps) {
    const { lang: langParam } = useParams<{ lang: string }>();
    const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
    const { t } = useTranslation("commons");

    return (
        <ProfilePage
            bannerUrl={company.bannerUrl}
            avatarUrl={company.logoUrl}
            name={company.tradeName}
            subtitle={company.address ? `${company.address.city}/${company.address.state}` : undefined}
            actions={
                <Link
                    to={routePaths.chat(lang, company.id)}
                    className="rounded-medium bg-orange px-4 py-2 font-medium text-white"
                >
                    {t("actions.contact")}
                </Link>
            }
        >
            <div className="flex flex-col gap-2">
                <h2>{company.corporateName}</h2>
                {company.businessContact?.companyEmail && (
                    <p className="text-input-text">{company.businessContact.companyEmail}</p>
                )}
                {company.businessContact?.website && (
                    <p className="text-input-text">{company.businessContact.website}</p>
                )}
            </div>
        </ProfilePage>
    );
}

export default function CompanyProfile() {
    const { companySlug = "" } = useParams<{ companySlug: string }>();
    const [company, setCompany] = useState<Company | null>(null);

    useEffect(() => {
        let active = true;

        getCompanyBySlug(companySlug).then((result) => {
            if (active) setCompany(result);
        });

        return () => { active = false; };
    }, [companySlug]);

    if (!company) return <ProfilePageSkeleton />;

    return <CompanyProfilePacked company={company} />;
}
