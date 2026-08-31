import type CompanyStatus from '@/features/companies/company.enum';
import type { Address } from '@/shared/types/address/address';
import type { BusinessContact } from '@/shared/types/business-contact/businessContact';

export interface Company {
    id: string;
    status: CompanyStatus;
    cnpj: string;
    tradeName: string;
    corporateName: string;
    address?: Address;
    businessContact?: BusinessContact;

    // NOTE: `company` não tem coluna de logo/banner em schema-api-core.sql.
    // Mantidos como mock até existir upload/armazenamento de imagem para empresas na API.
    logoUrl?: string;
    bannerUrl?: string;

    // NOTE: `company` também não tem coluna de slug em schema-api-core.sql.
    // Usado para montar URLs amigáveis (ex.: /empresa/{slug}) até existir
    // essa coluna (ou geração equivalente) na API.
    slug: string;
}
