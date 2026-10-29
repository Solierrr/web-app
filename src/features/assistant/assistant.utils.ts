import { isSupportedLanguage, type SupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths, routeSegment } from "@/config/i18n/paths";
import type { AgentReply } from "./assistant";

export const CONFIRM_MESSAGE = "sim";
export const DECLINE_MESSAGE = "não";

export const OPERATIONAL_SCREENS = [
  "dashboard",
  "operationalChatbot",
  "projects",
  "projectCreate",
  "inbox",
  "cart",
  "orders",
  "sales",
  "plan",
  "analytics",
  "ownUserProfile",
  "ownCompanyProfile",
  "settings",
  "settingsSecurity",
  "settingsPrivacy",
  "settingsSessions",
  "offersManagement",
  "solarPanelModelsCrud",
  "employeesManagement",
  "unitsManagement",
  "registrationsManagement",
  "registrationStatus",
  "brandRequests",
  "solarPanelsFeed",
  "infrastructureFeed",
  "professionalsFeed",
  "companiesFeed",
  "searchSolarPanels",
  "searchProfessionals",
  "searchCompanies",
  "registerCompany",
  "registerProfessional",
  "activateAccess",
  "forgotPassword",
  "adminDashboard",
  "supplierDashboard",
  "demandantDashboard",
  "chatbot",
] as const satisfies readonly (keyof typeof routePaths)[];

export type OperationalScreen = (typeof OPERATIONAL_SCREENS)[number];

export interface ScreenLink {
  screen: OperationalScreen;
  to: string;
}

const PATH_PATTERN = /(?<![\p{L}\p{N}:/@.-])\/(?:pt-BR|en-US|es-ES)(?:\/[\p{L}\p{N}_~-]+)*(?![\p{L}\p{N}_~@/-]|\.[\p{L}\p{N}./])/gu;

function pathKey(path: string, language: SupportedLanguage): string {
  return path
    .split("/")
    .filter(Boolean)
    .slice(1)
    .map((segment) => (segment.toLowerCase() === "chatbot" ? routeSegment(language, "chatbot") : segment.toLowerCase()))
    .join("/");
}

export function extractScreenLinks(text: string, currentLanguage: SupportedLanguage): ScreenLink[] {
  const links = new Map<OperationalScreen, ScreenLink>();
  for (const [match] of text.matchAll(PATH_PATTERN)) {
    const language = match.split("/")[1];
    if (!isSupportedLanguage(language)) continue;
    const wanted = pathKey(match, language);
    for (const screen of OPERATIONAL_SCREENS) {
      if (links.has(screen)) continue;
      if (pathKey(routePaths[screen](language), language) === wanted) links.set(screen, { screen, to: routePaths[screen](currentLanguage) });
    }
  }
  return [...links.values()];
}

export function hasPendingProposal(reply: Pick<AgentReply, "response" | "specialistsUsed">): boolean {
  return (
    reply.specialistsUsed.some((agent) => agent === "action_proposer" || agent === "proposal_decision") &&
    /respond[ae]\s+["“]sim["”]/i.test(reply.response)
  );
}
