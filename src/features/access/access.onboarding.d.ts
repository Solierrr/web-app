export type RegistrationKind = "company" | "professional" | "invitation";

export interface RegistrationDraft {
  kind: RegistrationKind;
  step: number;
  fields: Record<string, string>;
}

export interface OperationalMembership {
  id: string;
  name: string;
  type: "SUPPLIER" | "DEMANDANT";
  admin: boolean;
  companyProfile?: MockCompanyProfile;
}

export interface MockCompanyProfile {
  cnpj: string;
  corporateName: string;
  companyEmail: string;
  phone: string;
  website: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
}

export interface MockProfessionalProfile {
  name: string;
  email: string;
  phone: string;
  crea: string;
  profession: string;
  council: string;
  registrationNumber: string;
  expirationDate: string;
}

export interface OperationalAccount {
  professional: boolean;
  professionalProfile?: MockProfessionalProfile;
  memberships: OperationalMembership[];
  selectedContext?: string;
}
