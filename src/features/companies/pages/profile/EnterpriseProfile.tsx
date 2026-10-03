import OperationalPage from "@@/layout/operational-page/OperationalPage";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import ProfilePage from "@/lib/components/layout/profile/ProfilePage";
import ProfilePageSkeleton from "@/lib/components/layout/profile/ProfilePageSkeleton";
import { ProfileEditForm } from "@/lib/components/layout/profile/ProfilePage.reusable";
import { getMyCompany, updateMyCompanyProfile } from "@/features/companies/company.service";
import type { Company } from "@/features/companies/company";
import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";
import { isAlwaysMockMode } from "@/config/mocks/mockMode.utils";
import { EnterpriseProfileInformation } from "./EnterpriseProfile.reusable";
import { getEnterpriseProfileFields, toEnterpriseProfileUpdate } from "./EnterpriseProfile.utils";

interface EnterpriseProfilePackedProps {
  company: Company;
}

function EnterpriseProfilePacked({ company }: EnterpriseProfilePackedProps) {
  const { t } = useTranslation("commons");
  const { t: tProfile } = useTranslation("profile", { keyPrefix: "edit" });
  const [currentCompany, setCurrentCompany] = useState(company);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const mockMode = isAlwaysMockMode();
  const labels = {
    tradeName: tProfile("tradeName"),
    corporateName: tProfile("corporateName"),
    cnpj: tProfile("cnpj"),
    email: tProfile("email"),
    phone: tProfile("phone"),
    website: tProfile("website"),
    street: tProfile("street"),
    number: tProfile("number"),
    neighborhood: tProfile("neighborhood"),
    city: tProfile("city"),
    state: tProfile("state"),
    zipCode: tProfile("zipCode"),
    country: tProfile("country"),
    notAvailable: tProfile("notAvailable"),
    companyDetails: tProfile("companyDetails"),
    contactDetails: tProfile("contactDetails"),
    addressDetails: tProfile("addressDetails"),
    companyType: tProfile("companyType"),
    supplier: tProfile("supplier"),
    demandant: tProfile("demandant"),
  };

  async function handleSave(values: Record<string, string>) {
    setSaving(true);
    setSaveError(false);
    try {
      const updated = await updateMyCompanyProfile(currentCompany.id, toEnterpriseProfileUpdate(values));
      setCurrentCompany(updated);
      setEditing(false);
    } catch {
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  }

  const actions = mockMode ? (
    <button type="button" onClick={() => setEditing((value) => !value)} className="rounded-medium bg-orange px-4 py-2 font-medium text-white">
      {editing ? t("actions.cancel") : t("actions.edit")}
    </button>
  ) : null;

  return (
    <ProfilePage
      operational
      operationalTitle={t("saasSidebar.companyProfile")}
      bannerUrl={currentCompany.bannerUrl}
      avatarUrl={currentCompany.logoUrl}
      name={currentCompany.tradeName}
      subtitle={currentCompany.businessContact?.website ?? currentCompany.cnpj}
      actions={actions}>
      {editing ? (
        <ProfileEditForm
          title={tProfile("companyTitle")}
          fields={getEnterpriseProfileFields(currentCompany, labels)}
          onCancel={() => setEditing(false)}
          onSave={handleSave}
          saving={saving}
          error={saveError ? tProfile("saveError") : undefined}
          notice={tProfile("mockNotice")}
        />
      ) : (
        <EnterpriseProfileInformation company={currentCompany} labels={labels} />
      )}
      {!mockMode && <p className="text-sm text-input-text">{tProfile("companyReadOnly")}</p>}
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

    getMyCompany()
      .then((result) => {
        if (active) setCompany(result);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) return <ProfilePageSkeleton operational />;
  if (error)
    return (
      <OperationalPage title={t("saasSidebar.companyProfile")}>
        <p role="alert">{t("myCompany.loadError")}</p>
      </OperationalPage>
    );
  if (!company)
    return (
      <OperationalPage title={t("saasSidebar.companyProfile")}>
        <p>{t("myCompany.empty")}</p>
        <Link className="text-orange" to={routePaths.profileOnboardingCompany(lang)}>
          {t("myCompany.register")}
        </Link>
      </OperationalPage>
    );

  return <EnterpriseProfilePacked company={company} />;
}
