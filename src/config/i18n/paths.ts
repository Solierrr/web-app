import i18n from "@/config/i18n/internationalization";
import { type SupportedLanguage } from "@/config/i18n/browser/languages";
import { localizePath } from "./routing/routing";

export const SEGMENT = [
  "solarPanels",
  "infrastructure",
  "professionals",
  "companies",
  "search",
  "solarPanel",
  "company",
  "professional",
  "about",
  "designSystem",
  "login",
  "register",
  "forgotPassword",
  "verifyEmail",
  "profileSetup",
  "user",
  "admin",
  "supplier",
  "demandant",
  "solarPanelModels",
  "messages",
  "chatbot",
  "settings",
  "security",
  "access",
  "dashboard",
  "employees",
  "offers",
  "units",
  "registrations",
  "brandRequests",
  "projects",
  "newProject",
  "editProject",
  "brands",
  "resetPassword",
  "privacy",
  "sessions",
  "registrationStatus",
  "analytics",
  "policy",
  "terms",
  "cookies",
  "cart",
  "orders",
  "sales",
  "plan",
] as const;

export type RouteSegmentKey = (typeof SEGMENT)[number];

export function routeSegment(lang: SupportedLanguage, key: RouteSegmentKey): string {
  return i18n.getFixedT(lang, "routes")(key);
}

export function joinSegments(lang: SupportedLanguage, ...keys: RouteSegmentKey[]): string {
  return keys.map((key) => routeSegment(lang, key)).join("/");
}

export const routePaths = {
  projectCreate: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "projects", "newProject")}`,
  projectDetail: (lang: SupportedLanguage, id: string) => `/${lang}/${joinSegments(lang, "projects")}/${encodeURIComponent(id)}`,
  projectEdit: (lang: SupportedLanguage, id: string) =>
    `/${lang}/${joinSegments(lang, "projects")}/${encodeURIComponent(id)}/${joinSegments(lang, "editProject")}`,

  projects: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "projects")}`,
  brandDetail: (lang: SupportedLanguage, id: string) => `/${lang}/${joinSegments(lang, "brands")}/${encodeURIComponent(id)}`,
  brandRequests: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "brandRequests")}`,
  termsPolicy: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "policy", "terms")}`,
  privacyPolicy: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "policy", "privacy")}`,
  cookiePolicy: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "policy", "cookies")}`,
  home: (lang: SupportedLanguage) => `/${lang}`,

  infrastructureFeed: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "infrastructure")}`,
  infrastructureDetail: (lang: SupportedLanguage, companySlug: string, slug: string) =>
    `/${lang}/${joinSegments(lang, "infrastructure")}/${encodeURIComponent(companySlug)}/${encodeURIComponent(slug)}`,
  solarPanelsFeed: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "solarPanels")}`,
  professionalsFeed: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "professionals")}`,
  companiesFeed: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "companies")}`,

  searchSolarPanels: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "search", "solarPanels")}`,
  searchProfessionals: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "search", "professionals")}`,
  searchCompanies: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "search", "companies")}`,

  productDetail: (lang: SupportedLanguage, companySlug: string, productSlug: string) =>
    `/${lang}/${joinSegments(lang, "solarPanel")}/${companySlug}/${productSlug}`,

  about: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "about")}`,
  designSystem: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "designSystem")}`,

  login: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "login")}`,
  register: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "register")}`,
  registerCompany: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "register", "company")}`,
  registerProfessional: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "register", "professional")}`,
  activateAccess: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "register", "access")}`,
  forgotPassword: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "forgotPassword")}`,
  verifyEmail: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "verifyEmail")}`,

  ownCompanyProfile: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "company")}`,
  companyProfile: (lang: SupportedLanguage, companySlug: string) => `/${lang}/${joinSegments(lang, "company")}/${companySlug}`,

  ownUserProfile: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "user")}`,
  professionalProfile: (lang: SupportedLanguage, professionalSlug: string) => `/${lang}/${joinSegments(lang, "professional")}/${professionalSlug}`,

  accountSetup: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "profileSetup")}`,
  profileOnboardingUser: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "profileSetup", "user")}`,
  profileOnboardingCompany: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "profileSetup", "company")}`,
  profileOnboardingProfessional: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "profileSetup", "professional")}`,
  profileOnboardingAccess: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "profileSetup", "access")}`,

  solarPanelModelsCrud: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "admin", "solarPanelModels")}`,
  adminDashboard: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "admin")}`,
  supplierDashboard: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "supplier")}`,
  demandantDashboard: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "demandant")}`,
  employeesManagement: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "admin", "employees")}`,
  offersManagement: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "admin", "offers")}`,
  unitsManagement: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "admin", "units")}`,
  analytics: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "analytics")}`,
  registrationStatus: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "registrationStatus")}`,
  registrationDetail: (lang: SupportedLanguage, kind: "company" | "professional", id: string) =>
    `/${lang}/${joinSegments(lang, "admin", "registrations")}/${kind}/${encodeURIComponent(id)}`,
  registrationsManagement: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "admin", "registrations")}`,

  inbox: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "messages")}`,
  contactCompany: (lang: SupportedLanguage, companyId: string, productTitle?: string) =>
    `/${lang}/${joinSegments(lang, "messages", "company")}/${companyId}${productTitle ? `?product=${encodeURIComponent(productTitle)}` : ""}`,
  chat: (lang: SupportedLanguage, conversationId: string) => `/${lang}/${joinSegments(lang, "messages")}/${conversationId}`,
  chatbot: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "chatbot")}`,
  operationalChatbot: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "dashboard", "chatbot")}`,

  settings: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "settings")}`,
  settingsSecurity: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "settings", "security")}`,
  settingsPrivacy: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "settings", "privacy")}`,
  settingsSessions: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "settings", "sessions")}`,
  resetPassword: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "resetPassword")}`,
  dashboard: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "dashboard")}`,
  cart: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "cart")}`,
  orders: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "orders")}`,
  orderDetail: (lang: SupportedLanguage, id: string) => `/${lang}/${joinSegments(lang, "orders")}/${encodeURIComponent(id)}`,
  sales: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "admin", "sales")}`,
  plan: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "admin", "plan")}`,
};

export function translatePathToLanguage(pathname: string, targetLang: SupportedLanguage): string {
  return localizePath(pathname, targetLang);
}
