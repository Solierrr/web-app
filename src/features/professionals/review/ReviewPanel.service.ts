import { isAlwaysMockMode, waitForMockService } from "@/config/mocks/mockMode.utils";
import { professionalMocks } from "@/config/mocks/registry";
import { decideSubmission, getReviewSubmission, getDocumentInfo, loadProfessionalDocument } from "../professional.submission.service";
import { getMockProfessionalReviews, decideMockProfessional } from "./review.d.mocks";
import type { ProfessionalSubmission } from "../professional.submission";
import type { ViewerDocument } from "@@/ui/document-viewer/DocumentViewer.d";
export interface ReviewDetails {
  submission: ProfessionalSubmission;
  documents: ViewerDocument[];
}
const fixtureFiles = [
  { name: "Certificado demonstrativo.pdf", url: "/mock-documents/certificado-demonstrativo.pdf", contentType: "application/pdf" },
  {
    name: "Formação demonstrativa.docx",
    url: "/mock-documents/formacao-demonstrativa.docx",
    contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  },
  { name: "Arquivo sem preview.txt", url: "/mock-documents/arquivo-demonstrativo.txt", contentType: "text/plain" },
];
export async function getReviewDetails(id: string): Promise<ReviewDetails> {
  if (!isAlwaysMockMode()) {
    const submission = await getReviewSubmission(id);
    const info = await Promise.all(submission.snapshot.documentIds.map(getDocumentInfo));
    return {
      submission,
      documents: info.map((file, index) => ({ id: file.id, name: file.fileName || `Documento ${index + 1}`, contentType: file.contentType })),
    };
  }
  await waitForMockService();
  const review = getMockProfessionalReviews().find((item) => item.id === id);
  if (!review) throw new Error("Review not found");
  const person = professionalMocks.find((item) => item.id === id);
  const registration = person?.registrations?.[0];
  const documents = fixtureFiles.map((file, index) => ({ id: `demo-${index}`, name: file.name, contentType: file.contentType }));
  return {
    documents,
    submission: {
      id,
      revision: 0,
      baseApprovedVersion: 0,
      status: review.status === "UNDER_ANALYSIS" ? "MANUAL_REVIEW" : review.status,
      snapshot: {
        revision: 0,
        name: review.person.name,
        cpf: "",
        birthDate: "",
        email: person?.contact?.email ?? "",
        phone: person?.contact?.number ?? "",
        professionId: registration?.profession ?? "",
        council: registration?.council ?? null,
        registrationNumber: review.crea,
        registrationExpiration: registration?.expirationDate ?? null,
        documentIds: documents.map((item) => item.id),
      },
      approved: null,
      policy: { version: 1, configured: false, requiresRegistration: true, requiredDocuments: [], criteria: [] },
      validation: {},
      createdAt: "",
      decidedAt: null,
      decidedBy: null,
      decisionOrigin: null,
      decisionReason: null,
    },
  };
}
export async function loadReviewDocument(id: string): Promise<Blob> {
  if (!isAlwaysMockMode()) return loadProfessionalDocument(id);
  const file = fixtureFiles[Number(id.replace("demo-", ""))];
  if (!file) throw new Error("Document not found");
  const response = await fetch(file.url);
  if (!response.ok) throw new Error("Document unavailable");
  return new Blob([await response.arrayBuffer()], { type: file.contentType });
}
export async function decideReview(submission: ProfessionalSubmission, approved: boolean, reason: string) {
  if (!isAlwaysMockMode()) return decideSubmission(submission.id, submission.revision, approved, reason);
  await waitForMockService();
  const current = getMockProfessionalReviews().find((item) => item.id === submission.id);
  if (current?.status !== "UNDER_ANALYSIS") throw new Error("Review changed");
  decideMockProfessional(submission.id, approved);
  return { ...submission, status: approved ? "APPROVED" : "REJECTED", decisionReason: reason };
}
