import type { ProfileEditField } from "@/lib/components/layout/profile/ProfilePage.reusable";
import type { Company } from "@/features/companies/company";

export function getEnterpriseProfileFields(company: Company, labels: Record<string, string>): ProfileEditField[] {
  return [
    { name: "tradeName", label: labels.tradeName, value: company.tradeName, required: true, maxLength: 100 },
    { name: "corporateName", label: labels.corporateName, value: company.corporateName, required: true, maxLength: 150 },
    { name: "email", label: labels.email, value: company.businessContact?.companyEmail ?? "", type: "email", required: true },
    { name: "phone", label: labels.phone, value: company.businessContact?.phone ?? "", type: "tel" },
    { name: "website", label: labels.website, value: company.businessContact?.website ?? "", type: "url" },
    { name: "street", label: labels.street, value: company.address?.street ?? "" },
    { name: "number", label: labels.number, value: company.address?.number ?? "" },
    { name: "neighborhood", label: labels.neighborhood, value: company.address?.neighborhood ?? "" },
    { name: "city", label: labels.city, value: company.address?.city ?? "" },
    { name: "state", label: labels.state, value: company.address?.state ?? "" },
    { name: "zipCode", label: labels.zipCode, value: company.address?.zipCode ?? "" },
    { name: "country", label: labels.country, value: company.address?.country ?? "" },
  ];
}

export function toEnterpriseProfileUpdate(
  values: Record<string, string>,
): Pick<Company, "tradeName" | "corporateName" | "businessContact" | "address"> {
  const hasAddress = ["street", "number", "neighborhood", "city", "state", "zipCode", "country"].some((key) => values[key]?.trim());
  return {
    tradeName: values.tradeName.trim(),
    corporateName: values.corporateName.trim(),
    businessContact: {
      companyEmail: values.email.trim(),
      phone: values.phone.trim() || undefined,
      website: values.website.trim() || undefined,
    },
    address: hasAddress
      ? {
          street: values.street.trim(),
          number: values.number.trim(),
          neighborhood: values.neighborhood.trim(),
          city: values.city.trim(),
          state: values.state.trim().toUpperCase(),
          zipCode: values.zipCode.replace(/\D/g, ""),
          country: values.country.trim(),
        }
      : undefined,
  };
}
