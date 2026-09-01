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
  "profileSetup",
  "user",
  "admin",
  "solarPanelModels",
  "messages",
  "chatbot",
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

  ownCompanyProfile: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "company")}`,
  companyProfile: (lang: SupportedLanguage, companySlug: string) => `/${lang}/${joinSegments(lang, "company")}/${companySlug}`,

  ownUserProfile: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "user")}`,
  professionalProfile: (lang: SupportedLanguage, professionalSlug: string) => `/${lang}/${joinSegments(lang, "professional")}/${professionalSlug}`,

  profileOnboardingUser: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "profileSetup", "user")}`,
  profileOnboardingCompany: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "profileSetup", "company")}`,

  solarPanelModelsCrud: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "admin", "solarPanelModels")}`,

  chat: (lang: SupportedLanguage, contactId: string) => `/${lang}/${joinSegments(lang, "messages")}/${contactId}`,
  chatbot: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "chatbot")}`,
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
