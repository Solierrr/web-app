import SupportedLanguages from "@/config/inter/supported.enum";

export const SUPPORTED = Object.values(SupportedLanguages);
export type SupportedLanguage = SupportedLanguages;
export const DEFAULT: SupportedLanguage = SupportedLanguages.PTBR;

export function isSupportedLanguage(value: string | undefined): value is SupportedLanguage {
  return !!value && (SUPPORTED as string[]).includes(value);
}

export function detectLanguage(): SupportedLanguage {
  const browserLanguages = navigator.languages?.length ? navigator.languages : [navigator.language];

  for (const browserLanguage of browserLanguages) {
    const exactMatch = SUPPORTED.find((supported) => supported.toLowerCase() === browserLanguage.toLowerCase());
    if (exactMatch) return exactMatch;

    const languageOnly = browserLanguage.split("-")[0];
    const partialMatch = SUPPORTED.find((supported) => supported.split("-")[0] === languageOnly);
    if (partialMatch) return partialMatch;
  }

  return DEFAULT;
}
