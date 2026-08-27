import type CompanyStatus from '@/domain/enum/companyStatus';
import type { Address } from '@/domain/models/shared/address';
import type { BusinessContact } from '@/domain/models/shared/businessContact';

export interface Company {
    id: string;
    status: CompanyStatus;
    cnpj: string;
    tradeName: string;
    corporateName: string;
    address?: Address;
    businessContact?: BusinessContact;
}
