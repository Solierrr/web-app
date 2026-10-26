import { useEffect, type ReactNode } from "react";
import i18n from "../src/config/i18n/internationalization";

export default function StorybookLocale({ locale, children }: { locale: string; children: ReactNode }) {
  useEffect(() => {
    void i18n.changeLanguage(locale);
  }, [locale]);

  return children;
}
