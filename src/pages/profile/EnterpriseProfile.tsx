import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ProfilePage from "@/pages/profile/ProfilePage";
import { PrimaryButton } from "@@/ui/button/Button.presets";
import { getCompany } from "@/features/companies/company.service";
import type { Company } from "@/features/companies/company";

// TODO: substituir pelo id da empresa autenticada quando o login estiver conectado à API real.
const OWN_COMPANY_ID = "company-1";

export default function EnterpriseProfile() {
    const { t } = useTranslation("commons");
    const [company, setCompany] = useState<Company | null>(null);

    useEffect(() => {
        let active = true;

        getCompany(OWN_COMPANY_ID).then((result) => {
            if (active) setCompany(result);
        });

        return () => { active = false; };
    }, []);

    if (!company) return null;

    return (
        <ProfilePage
            bannerUrl={company.bannerUrl}
            avatarUrl={company.logoUrl}
            name={company.tradeName}
            subtitle={company.businessContact?.website ?? company.cnpj}
            actions={
                <PrimaryButton
                    content={t("actions.edit")}
                    description={t("actions.edit")}
                    rounded
                />
            }
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
