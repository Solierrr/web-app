import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ProfilePage from "@/components/layout/profile/ProfilePage";
import ProfilePageSkeleton from "@/components/layout/profile/ProfilePageSkeleton";
import { ProfileInfoRow, ProfileInfoSection } from "@/components/layout/profile/ProfilePage.reusable";
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
  const { t: profile } = useTranslation("profile", { keyPrefix: "company" });
  const companyKind = company.type === "SUPPLIER" ? profile("supplier") : company.type === "DEMANDANT" ? profile("demandant") : profile("kind");

  return (
    <ProfilePage
      bannerUrl={company.bannerUrl}
      avatarUrl={company.logoUrl}
      name={company.tradeName}
      subtitle={company.address ? `${company.address.city}/${company.address.state}` : undefined}
      eyebrow={companyKind}
      actions={
        <Link to={routePaths.chat(lang, company.id)} className="rounded-medium bg-orange px-4 py-2 font-medium text-white">
          {t("actions.contact")}
        </Link>
      }>
      <ProfileInfoSection title={profile("identityTitle")} description={profile("identityDescription")}>
        <dl className="divide-y divide-black/8">
          <ProfileInfoRow label={profile("fields.corporateName")} value={company.corporateName} />
          <ProfileInfoRow label={profile("fields.website")} value={company.businessContact?.website} />
        </dl>
      </ProfileInfoSection>
      <ProfileInfoSection title={profile("contactTitle")}>
        <dl className="divide-y divide-black/8">
          <ProfileInfoRow label={profile("fields.email")} value={company.businessContact?.companyEmail} />
        </dl>
      </ProfileInfoSection>
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

    return () => {
      active = false;
    };
  }, [companySlug]);

  if (!company) return <ProfilePageSkeleton />;

  return <CompanyProfilePacked company={company} />;
}
