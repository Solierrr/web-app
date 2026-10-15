export interface ProfessionalDraft {
  revision: number;
  name: string;
  cpf: string;
  birthDate: string;
  email: string;
  phone: string;
  professionId: string;
  council: string | null;
  registrationNumber: string | null;
  registrationExpiration: string | null;
  documentIds: string[];
}

export interface ProfessionalPolicy {
  version: number;
  configured: boolean;
  requiresRegistration: boolean;
  requiredDocuments: string[];
  criteria: string[];
}

export interface ProfessionalSubmission {
  id: string;
  revision: number;
  baseApprovedVersion: number;
  status: string;
  snapshot: ProfessionalDraft;
  approved: ProfessionalDraft | null;
  policy: ProfessionalPolicy;
  validation: { status?: string; criteriaResults?: { code: string; result: string; reason: string; documentIds: string[] }[] };
  createdAt: string;
  decidedAt: string | null;
  decidedBy: string | null;
  decisionOrigin: string | null;
  decisionReason: string | null;
}

export interface ProfessionalAccount {
  revision: number;
  approvedVersion: number;
  suspended: boolean;
  draft: ProfessionalDraft;
  approved: ProfessionalDraft | null;
  submissions: ProfessionalSubmission[];
}

export interface ProfessionalDocumentInfo { id: string; kind: string; fileName?: string; sha256: string; contentType: string }
