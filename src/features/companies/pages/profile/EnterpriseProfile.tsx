import ProfilePhotoEditor from "@@/layout/profile/ProfilePhotoEditor";
import { useActiveContext } from "@/lib/shared/context/ActiveContext";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import OperationalPage from "@@/layout/operational-page/OperationalPage";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import CompanyProfileView from "./CompanyProfileView";
import { ProfileEditForm } from "@/lib/components/layout/profile/ProfilePage.reusable";
import { getMyCompany, updateMyCompanyProfile } from "@/features/companies/company.service";
import type { Company } from "@/features/companies/company";
import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";
import { CompanyStatus } from "../../company.enum";
import { isAlwaysMockMode } from "@/config/mocks/mockMode.utils";
import { EnterpriseProfileInformation } from "./EnterpriseProfile.reusable";
import { getEnterpriseProfileFields, toEnterpriseProfileUpdate } from "./EnterpriseProfile.utils";

interface EnterpriseProfilePackedProps {
  company: Company;
}

function EnterpriseProfilePacked({ company }: EnterpriseProfilePackedProps) {
  const { t } = useTranslation("commons");
  const { t: tCompany } = useTranslation("profile", { keyPrefix: "company" });
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const { t: tProfile } = useTranslation("profile", { keyPrefix: "edit" });
  const [currentCompany, setCurrentCompany] = useState(company);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const mockMode = isAlwaysMockMode();
  const { can, isAdmin } = useActiveContext();
  const canEdit = mockMode || isAdmin || can?.("PUT /api/companies/{id}");
  const canEditAddress = mockMode || isAdmin || can?.(currentCompany.address?.id ? "PUT /api/addresses/{id}" : "POST /api/addresses");
  const canUploadPhotos = Boolean(mockMode || isAdmin || can?.("PUT /api/company-photos/company/{companyId}/type/{type}"));
  const canRemovePhotos = Boolean(mockMode || isAdmin || can?.("DELETE /api/company-photos/company/{companyId}/type/{type}"));
  const addressFields = ["street", "number", "neighborhood", "city", "state", "zipCode", "country"];
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

  const editingAction = canEdit ? (
    <ToolbarAction
      icon={editing ? "x" : "edit"}
      onClick={() => setEditing((value) => !value)}
      label={editing ? t("actions.cancel") : t("actions.edit")}
      content={editing ? t("actions.cancel") : t("actions.edit")}
      backgroundColor="var(--color-input-bg)"
    />
  ) : null;

  if (editing)
    return (
      <OperationalPage title={t("saasSidebar.companyProfile")} centered form formBackground>
        <ProfileEditForm
          plain
          title={tProfile("companyTitle")}
          fields={getEnterpriseProfileFields(currentCompany, labels).filter(
            (field) => (mockMode || field.name !== "country") && (canEditAddress || !addressFields.includes(field.name)),
          )}
          onCancel={() => setEditing(false)}
          onSave={handleSave}
          saving={saving}
          error={saveError ? tProfile("saveError") : undefined}
          notice={mockMode ? tProfile("mockNotice") : undefined}
        />
      </OperationalPage>
    );

  return (
    <CompanyProfileView
      operational
      canViewProjects
      company={{ ...currentCompany, city: currentCompany.address?.city ?? null, state: currentCompany.address?.state ?? null }}
      actions={
        <>
          {editingAction}
          {currentCompany.type === "SUPPLIER" && currentCompany.status === CompanyStatus.APPROVED && (
            <ToolbarAction
              icon="globe"
              to={routePaths.companyProfile(lang, currentCompany.slug)}
              label={tCompany("publicProfile")}
              content={tCompany("publicProfile")}
              backgroundColor="var(--color-white)"
            />
          )}
        </>
      }>
      {(canUploadPhotos || canRemovePhotos) && (
        <ProfilePhotoEditor
          id={currentCompany.id}
          entity="company"
          canUpload={canUploadPhotos}
          canRemove={canRemovePhotos}
          onChange={(type, url) => setCurrentCompany((current) => ({ ...current, [type === "PROFILE" ? "logoUrl" : "bannerUrl"]: url ?? undefined }))}
        />
      )}
      <EnterpriseProfileInformation company={currentCompany} labels={labels} />
    </CompanyProfileView>
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
    let generation = 0;
    function load() {
      const current = ++generation;
      getMyCompany()
        .then((result) => {
          if (active && current === generation) {
            setCompany(result);
            setError(false);
          }
        })
        .catch(() => {
          if (active && current === generation) setError(true);
        })
        .finally(() => {
          if (active && current === generation) setLoading(false);
        });
    }
    function contextChanged() {
      setLoading(true);
      load();
    }
    load();
    window.addEventListener("solaria:context", contextChanged);
    return () => {
      active = false;
      window.removeEventListener("solaria:context", contextChanged);
    };
  }, []);

  if (loading) return <OperationalPage title="" loading />;
  if (error)
    return (
      <OperationalPage centered sideBackground title={t("saasSidebar.companyProfile")}>
        <p role="alert">{t("myCompany.loadError")}</p>
      </OperationalPage>
    );
  if (!company)
    return (
      <OperationalPage centered sideBackground title={t("saasSidebar.companyProfile")}>
        <p>{t("myCompany.empty")}</p>
        <Link className="text-orange" to={routePaths.profileOnboardingCompany(lang)}>
          {t("myCompany.register")}
        </Link>
      </OperationalPage>
    );

  return <EnterpriseProfilePacked key={company.id} company={company} />;
}
