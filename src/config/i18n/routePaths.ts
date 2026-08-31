import i18n from "@/config/i18n/internationalization";
import { isSupportedLanguage, type SupportedLanguage } from "@/config/i18n/browser/languages";

// Chaves do namespace i18n "routes" — cada uma é um segmento de URL
// traduzido por idioma (ex.: "solarPanel" -> "placa-solar" / "solar-panel" /
// "panel-solar"). Ver src/config/locales/{lang}/routes.json.
export const ROUTE_SEGMENT_KEYS = [
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

export type RouteSegmentKey = (typeof ROUTE_SEGMENT_KEYS)[number];

/**
 * Traduz um único segmento de rota para o idioma informado. Usa
 * `i18n.getFixedT` (em vez do hook `useTranslation`) porque a montagem de
 * rotas roda fora do ciclo de render de um componente específico (dentro de
 * `AppRoutes` e de utilitários como `translatePathToLanguage`).
 */
export function routeSegment(lang: SupportedLanguage, key: RouteSegmentKey): string {
  return i18n.getFixedT(lang, "routes")(key);
}

export function joinSegments(lang: SupportedLanguage, ...keys: RouteSegmentKey[]): string {
  return keys.map((key) => routeSegment(lang, key)).join("/");
}

/**
 * URLs "idiomáticas" (com prefixo de idioma e, para empresa/profissional/
 * produto, com slug em vez de id) usadas pelas páginas para linkar entre si.
 * Os padrões de rota registrados em `AppRoutes.tsx` usam os mesmos
 * `joinSegments`/`routeSegment` para garantir que fiquem sempre em sincronia.
 */
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
  companyProfile: (lang: SupportedLanguage, companySlug: string) =>
    `/${lang}/${joinSegments(lang, "company")}/${companySlug}`,

  ownUserProfile: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "user")}`,
  professionalProfile: (lang: SupportedLanguage, professionalSlug: string) =>
    `/${lang}/${joinSegments(lang, "professional")}/${professionalSlug}`,

  profileOnboardingUser: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "profileSetup", "user")}`,
  profileOnboardingCompany: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "profileSetup", "company")}`,

  solarPanelModelsCrud: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "admin", "solarPanelModels")}`,

  chat: (lang: SupportedLanguage, contactId: string) => `/${lang}/${joinSegments(lang, "messages")}/${contactId}`,
  chatbot: (lang: SupportedLanguage) => `/${lang}/${joinSegments(lang, "chatbot")}`,
};

/**
 * Troca o idioma da URL atual, traduzindo cada segmento literal para o novo
 * idioma (usado pelo `LanguageSwitcher`). Segmentos que não batem com
 * nenhuma chave conhecida — slugs, ids, parâmetros — são mantidos como
 * estão, já que não fazem parte do dicionário de rotas.
 */
export function translatePathToLanguage(pathname: string, targetLang: SupportedLanguage): string {
  const [, currentLang, ...rest] = pathname.split("/");

  if (!isSupportedLanguage(currentLang)) return `/${targetLang}`;

  const translatedRest = rest.map((segment) => {
    const matchedKey = ROUTE_SEGMENT_KEYS.find((key) => routeSegment(currentLang, key) === segment);
    return matchedKey ? routeSegment(targetLang, matchedKey) : segment;
  });

  return `/${[targetLang, ...translatedRest].join("/")}`;
}
