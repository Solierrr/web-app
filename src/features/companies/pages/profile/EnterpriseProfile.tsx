import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ProfilePage from "@/components/layout/profile/ProfilePage";
import ProfilePageSkeleton from "@/components/layout/profile/ProfilePageSkeleton";
import { ProfileEditForm, ProfileInfoRow, ProfileInfoSection } from "@/components/layout/profile/ProfilePage.reusable";
import { PrimaryButton } from "@@/ui/button/Button.presets";
import { getCompany } from "@/features/companies/company.service";
import type { Company } from "@/features/companies/company";

const OWN_COMPANY_ID = "company-1";

interface EnterpriseProfilePackedProps {
  company: Company;
}

function EnterpriseProfilePacked({ company: initialCompany }: EnterpriseProfilePackedProps) {
  const { t } = useTranslation("profile", { keyPrefix: "company" });
  const { t: commons } = useTranslation("commons");
  const [company, setCompany] = useState(initialCompany);
  const [editing, setEditing] = useState(false);
  const companyKind = company.type === "SUPPLIER" ? t("supplier") : company.type === "DEMANDANT" ? t("demandant") : t("kind");

  function saveProfile(values: Record<string, string>) {
    setCompany((current) => ({
      ...current,
      tradeName: values.tradeName,
      corporateName: values.corporateName,
      logoUrl: values.logo || undefined,
      bannerUrl: values.banner || undefined,
      businessContact: {
        companyEmail: values.email,
        phone: values.phone,
        website: values.website,
      },
      address:
        current.address || values.street || values.city || values.state
          ? {
              street: values.street,
              number: values.number,
              complement: current.address?.complement ?? "",
              neighborhood: current.address?.neighborhood ?? "",
              country: current.address?.country ?? "",
              zipCode: current.address?.zipCode ?? "",
              city: values.city,
              state: values.state,
            }
          : undefined,
    }));
    setEditing(false);
  }

  return (
    <ProfilePage
      bannerUrl={company.bannerUrl}
      avatarUrl={company.logoUrl}
      name={company.tradeName}
      subtitle={company.address ? `${company.address.city}/${company.address.state}` : company.businessContact?.website}
      eyebrow={companyKind}
      actions={
        <PrimaryButton
          content={commons(editing ? "actions.cancel" : "actions.edit")}
          description={commons(editing ? "actions.cancel" : "actions.edit")}
          rounded
          onClick={() => setEditing((current) => !current)}
        />
      }>
      {editing ? (
        <ProfileEditForm
          title={t("editTitle")}
          fields={[
            { name: "tradeName", label: t("fields.tradeName"), value: company.tradeName },
            { name: "corporateName", label: t("fields.corporateName"), value: company.corporateName },
            { name: "email", label: t("fields.email"), value: company.businessContact?.companyEmail ?? "", type: "email" },
            { name: "phone", label: t("fields.phone"), value: company.businessContact?.phone ?? "", type: "tel" },
            { name: "website", label: t("fields.website"), value: company.businessContact?.website ?? "", type: "url" },
            { name: "street", label: t("fields.street"), value: company.address?.street ?? "" },
            { name: "number", label: t("fields.number"), value: company.address?.number ?? "" },
            { name: "city", label: t("fields.city"), value: company.address?.city ?? "" },
            { name: "state", label: t("fields.state"), value: company.address?.state ?? "" },
            { name: "logo", label: t("fields.logo"), value: company.logoUrl ?? "", type: "url" },
            { name: "banner", label: t("fields.banner"), value: company.bannerUrl ?? "", type: "url" },
          ]}
          onCancel={() => setEditing(false)}
          onSave={saveProfile}
        />
      ) : (
        <>
          <ProfileInfoSection title={t("identityTitle")} description={t("identityDescription")}>
            <dl className="divide-y divide-black/8">
              <ProfileInfoRow label={t("fields.corporateName")} value={company.corporateName} />
              <ProfileInfoRow label={t("fields.cnpj")} value={company.cnpj} />
              <ProfileInfoRow label={t("fields.website")} value={company.businessContact?.website} />
            </dl>
          </ProfileInfoSection>
          <ProfileInfoSection title={t("contactTitle")}>
            <dl className="divide-y divide-black/8">
              <ProfileInfoRow label={t("fields.email")} value={company.businessContact?.companyEmail} />
              <ProfileInfoRow label={t("fields.phone")} value={company.businessContact?.phone} />
              <ProfileInfoRow
                label={t("fields.address")}
                value={
                  company.address
                    ? `${company.address.street}, ${company.address.number} — ${company.address.city}/${company.address.state}`
                    : undefined
                }
              />
            </dl>
          </ProfileInfoSection>
        </>
      )}
    </ProfilePage>
  );
}

export default function EnterpriseProfile() {
  const [company, setCompany] = useState<Company | null>(null);

  useEffect(() => {
    let active = true;
    getCompany(OWN_COMPANY_ID).then((result) => {
      if (active) setCompany(result);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!company) return <ProfilePageSkeleton />;
  return <EnterpriseProfilePacked company={company} />;
}
