import type { RegistrationKind } from "../../onboarding";

export interface RegistrationField {
  name: string;
  type?: string;
  required?: boolean;
}

export function registrationFields(kind: RegistrationKind, step: number): RegistrationField[] {
  if (kind === "company" && step === 1) return [
    { name: "cnpj", required: true },
    { name: "tradeName", required: true },
    { name: "corporateName", required: true },
    { name: "companyEmail", type: "email", required: true },
    { name: "phone", type: "tel" },
    { name: "zipCode", required: true },
    { name: "state", required: true },
    { name: "city", required: true },
    { name: "street", required: true },
    { name: "number" },
  ];
  if (kind === "professional" && step === 1) return [
    { name: "name", required: true },
    { name: "cpf", required: true },
    { name: "birthDate", type: "date", required: true },
    { name: "phone", type: "tel", required: true },
    { name: "crea", required: true },
    { name: "certNr10Url", type: "url", required: true },
    { name: "certNr35Url", type: "url", required: true },
  ];
  if (kind === "invitation" && step === 0) return [{ name: "code", required: true }];
  return [
    { name: "name", required: true },
    { name: "email", type: "email", required: true },
    { name: "password", type: "password", required: true },
    { name: "confirmPassword", type: "password", required: true },
  ];
}
