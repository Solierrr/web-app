import i18n from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";

function namespacesFromGlob(modules: Record<string, unknown>) {
  const namespaces: Record<string, object> = {};
  for (const [path, content] of Object.entries(modules)) {
    const name = path.match(/([^/]+)\.json$/)?.[1];
    if (name) namespaces[name] = content as object;
  }
  return namespaces;
}

const ptBR = import.meta.glob("./pt-BR/*.json", { eager: true, import: "default" });
const esES = import.meta.glob("./es-ES/*.json", { eager: true, import: "default" });
const enUS = import.meta.glob("./en-US/*.json", { eager: true, import: "default" });

i18n.use(initReactI18next).init({
  resources: {
    "pt-BR": namespacesFromGlob(ptBR),
    "en-US": namespacesFromGlob(enUS),
    "es-ES": namespacesFromGlob(esES),
  },
  lng: "pt-BR",
  fallbackLng: "en-US",
  interpolation: {
    escapeValue: false,
  },
});

export { useTranslation };
export default i18n;
