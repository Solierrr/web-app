import { ProfileInfoRow, ProfileInfoSection } from "@/lib/components/layout/profile/ProfilePage.reusable";
import type { Company } from "@/features/companies/company";

type EnterpriseProfileLabels = Record<string, string>;

export function EnterpriseProfileInformation({ company, labels }: { company: Company; labels: EnterpriseProfileLabels }) {
  const value = (item?: string | null) => item?.trim() || labels.notAvailable;
  const address = company.address;

  return (
    <>
      <ProfileInfoSection title={labels.companyDetails}>
        <dl className="divide-y divide-black/5">
          <ProfileInfoRow label={labels.tradeName} value={company.tradeName} />
          <ProfileInfoRow label={labels.corporateName} value={company.corporateName} />
          <ProfileInfoRow label={labels.cnpj} value={company.cnpj || labels.notAvailable} />
          <ProfileInfoRow
            label={labels.companyType}
            value={company.type === "SUPPLIER" ? labels.supplier : company.type === "DEMANDANT" ? labels.demandant : labels.notAvailable}
          />
        </dl>
      </ProfileInfoSection>

      <ProfileInfoSection title={labels.contactDetails}>
        <dl className="divide-y divide-black/5">
          <ProfileInfoRow label={labels.email} value={value(company.businessContact?.companyEmail)} />
          <ProfileInfoRow label={labels.phone} value={value(company.businessContact?.phone)} />
          <ProfileInfoRow label={labels.website} value={value(company.businessContact?.website)} />
        </dl>
      </ProfileInfoSection>

      <ProfileInfoSection title={labels.addressDetails}>
        <dl className="divide-y divide-black/5">
          <ProfileInfoRow label={labels.street} value={value(address ? [address.street, address.number].filter(Boolean).join(", ") : "")} />
          <ProfileInfoRow label={labels.neighborhood} value={value(address?.neighborhood)} />
          <ProfileInfoRow label={labels.city} value={value(address?.city)} />
          <ProfileInfoRow label={labels.state} value={value(address?.state)} />
          <ProfileInfoRow label={labels.zipCode} value={value(address?.zipCode)} />
        </dl>
      </ProfileInfoSection>
    </>
  );
}
