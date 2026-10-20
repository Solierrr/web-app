import SupportedLanguages from "@/config/i18n/supported.enum";
import { cookieLanguage, languageCookie, preferredLanguage } from "../routing/routing";

export const SUPPORTED = Object.values(SupportedLanguages);
export type SupportedLanguage = SupportedLanguages;
export const DEFAULT: SupportedLanguage = SupportedLanguages.PTBR;

export function isSupportedLanguage(value: string | undefined): value is SupportedLanguage {
  return !!value && (SUPPORTED as string[]).includes(value);
}

export function detectLanguage(): SupportedLanguage {
  const remembered = cookieLanguage(document.cookie);
  const browserLanguages = navigator.languages?.length ? navigator.languages : [navigator.language];
  const selected = remembered ?? preferredLanguage(browserLanguages.join(","));
  return SUPPORTED.find((language) => language === selected) ?? DEFAULT;
}

export function rememberLanguage(language: SupportedLanguage) {
  document.cookie = languageCookie(language, window.location.protocol === "https:");
}
