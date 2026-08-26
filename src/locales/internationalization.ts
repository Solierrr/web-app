import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const ptBR = import.meta.glob("./pt-BR/*.json", { eager: true, import: "default" });
const esES = import.meta.glob("./es-ES/*.json", { eager: true, import: "default" });
const enUS = import.meta.glob("./en-US/*.json", { eager: true, import: "default" });

i18n
  .use(initReactI18next)
  .init({
    resources: {
      'pt-BR': { translation: ptBR },
      'en-US': { translation: enUS },
      'es-ES': { translation: esES },
    },

    lng: 'pt-BR',
    fallbackLng: 'en-US',

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;