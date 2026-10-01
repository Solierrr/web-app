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
}

export interface OperationalAccount {
  professional: boolean;
  memberships: OperationalMembership[];
  selectedContext?: string;
}
