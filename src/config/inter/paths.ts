import i18n from "@/config/inter/internationalization";
import { isSupportedLanguage, type SupportedLanguage } from "@/config/inter/browser/languages";


export const SEGMENT = [
  "solarPanels",
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
] as const;


export type RouteSegmentKey = (typeof SEGMENT)[number];

export function routeSegment(lang: SupportedLanguage, key: RouteSegmentKey): string {
  return i18n.getFixedT(lang, "routes")(key);
}

export function joinSegments(lang: SupportedLanguage, ...keys: RouteSegmentKey[]): string {
  return keys.map((key) => routeSegment(lang, key)).join("/");
}

export const routePaths = {
  home: (lang: SupportedLanguage) => `/${lang}`,

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
  employeesManagement: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "admin", "employees")}`,
  offersManagement: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "admin", "offers")}`,
  unitsManagement: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "admin", "units")}`,

  inbox: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "messages")}`,
  contactCompany: (lang: SupportedLanguage, companyId: string, productTitle?: string) =>
    `/${lang}/${joinSegments(lang, "messages", "company")}/${companyId}${productTitle ? `?product=${encodeURIComponent(productTitle)}` : ""}`,
  chat: (lang: SupportedLanguage, conversationId: string) => `/${lang}/${joinSegments(lang, "messages")}/${conversationId}`,
  chatbot: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "chatbot")}`,

  settings: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "settings")}`,
  settingsSecurity: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "settings", "security")}`,
  dashboard: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "dashboard")}`,
};


export function translatePathToLanguage(pathname: string, targetLang: SupportedLanguage): string {
  const [, currentLang, ...rest] = pathname.split("/");

  if (!isSupportedLanguage(currentLang)) return `/${targetLang}`;

  const translatedRest = rest.map((segment) => {
    const matchedKey = SEGMENT.find((key) => routeSegment(currentLang, key) === segment);
    return matchedKey ? routeSegment(targetLang, matchedKey) : segment;
  });

  return `/${[targetLang, ...translatedRest].join("/")}`;
}
