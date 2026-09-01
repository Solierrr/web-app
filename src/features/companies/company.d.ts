import type CompanyStatus from "@/features/companies/company.enum";
import type { Address } from "@/shared/types/address/address";
import type { BusinessContact } from "@/shared/types/business-contact/businessContact";

export interface Company {
  id: string;
  status: CompanyStatus;
  cnpj: string;
  tradeName: string;
  corporateName: string;
  address?: Address;
  businessContact?: BusinessContact;
  logoUrl?: string;
  bannerUrl?: string;
  slug: string;
}
