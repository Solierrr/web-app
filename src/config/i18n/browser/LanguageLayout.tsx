import { useEffect } from "react";
import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";
import i18n from "@/config/locales/internationalization";
import { detectLanguage, isSupportedLanguage } from "@/config/locales/languages";

/**
 * LanguageLayout
 *
 * Layout de nível mais alto das rotas: lê o primeiro segmento da URL
 * (`:lang`) e garante que ele seja sempre um dos idiomas suportados.
 *
 * - Se não for (ex.: link antigo sem prefixo de idioma, ou URL digitada
 *   errada), redireciona para o idioma detectado no navegador, preservando o
 *   restante do caminho — só o primeiro segmento é trocado.
 * - Se for, sincroniza o idioma do i18next com o da URL antes de renderizar
 *   as rotas filhas: é essa sincronização (e não o contrário) que faz o
 *   conteúdo da página e o `LanguageSwitcher` responderem à URL — a URL é
 *   sempre a fonte da verdade do idioma atual.
 */
export default function LanguageLayout() {
  const { lang } = useParams<{ lang: string }>();
  const location = useLocation();
  const supported = isSupportedLanguage(lang);

  useEffect(() => {
    if (supported && lang && i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [supported, lang]);

  if (!supported) {
    const [, , ...rest] = location.pathname.split("/");
    const redirectPath = `/${detectLanguage()}${rest.length ? `/${rest.join("/")}` : ""}`;
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
}

/**
 * Usado na rota raiz ("/", sem nenhum segmento) e como fallback final: manda
 * para a home do idioma detectado no navegador.
 */
export function RootRedirect() {
  return <Navigate to={`/${detectLanguage()}`} replace />;
}
