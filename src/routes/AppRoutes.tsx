import type { ReactNode } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AppLayout } from '../config/AppLayout';
import LanguageLayout, { RootRedirect } from '../config/i18n/browser/LanguageLayout';
import { AboutPage } from '../pages/AboutPage';
import { HomePage } from '../pages/HomePage';
import { NotFoundPage } from '../pages/NotFoundPage';

import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/config/locales/languages';
import { joinSegments } from '@/config/locales/routePaths';

import SolarPanelAnnouncement from '@/pages/announcement/SolarPanelAnnouncement';
import SolarPanelFeed         from '@/pages/feed/SolarPanelFeed';
import ProfessionalFeed       from '@/pages/feed/ProfessionalFeed';
import CompanyFeed            from '@/pages/feed/CompanyFeed';
import SolarPanelSearch       from '@/pages/search/SolarPanelSearch';
import ProfessionalSearch     from '@/pages/search/ProfessionalSearch';
import CompanySearch          from '@/pages/search/CompanySearch';
import EnterpriseProfile      from '@/pages/profile/EnterpriseProfile';
import CompanyProfile         from '@/pages/profile/CompanyProfile';
import UserProfile            from '@/pages/profile/UserProfile';
import ProfessionalProfile    from '@/pages/profile/ProfessionalProfile';
import ProfileOnboarding      from '@/pages/onboarding/ProfileOnboarding';
import SolarPanelModelCrud    from '@/pages/crud/SolarPanelModelCrud';
import Chat                   from '@/pages/chat/Chat';
import ChatbotPage            from '@/pages/chat/ChatbotPage';
import LoginPage              from '@/pages/access/LoginPage';
import RegisterPage           from '@/pages/access/RegisterPage';
import ForgotPasswordPage     from '@/pages/access/ForgotPasswordPage';

/**
 * Cada rota "traduzível" tem uma chave única (só usada como `key` do React,
 * já que o mesmo elemento se repete uma vez por idioma) e uma função que
 * monta o caminho — relativo a `/:lang` — para um idioma específico. Usa os
 * mesmos `joinSegments`/`routeSegment` que `routePaths.ts` usa para montar
 * os links das páginas, então rota registrada e link nunca ficam fora de
 * sincronia.
 */
interface RouteDefinition {
  key: string;
  path: (lang: SupportedLanguage) => string;
  element: ReactNode;
}

// Páginas de acesso: ficam fora do AppLayout (sem Navbar), mas ainda dentro
// do prefixo de idioma.
const ACCESS_ROUTE_DEFINITIONS: RouteDefinition[] = [
  { key: 'login', path: (lang) => joinSegments(lang, 'login'), element: <LoginPage /> },
  { key: 'register', path: (lang) => joinSegments(lang, 'register'), element: <RegisterPage /> },
  { key: 'forgotPassword', path: (lang) => joinSegments(lang, 'forgotPassword'), element: <ForgotPasswordPage /> },
];

const APP_ROUTE_DEFINITIONS: RouteDefinition[] = [
  // Feeds
  { key: 'solarPanelsFeed', path: (lang) => joinSegments(lang, 'solarPanels'), element: <SolarPanelFeed /> },
  { key: 'professionalsFeed', path: (lang) => joinSegments(lang, 'professionals'), element: <ProfessionalFeed /> },
  { key: 'companiesFeed', path: (lang) => joinSegments(lang, 'companies'), element: <CompanyFeed /> },

  // Busca
  { key: 'searchSolarPanels', path: (lang) => joinSegments(lang, 'search', 'solarPanels'), element: <SolarPanelSearch /> },
  { key: 'searchProfessionals', path: (lang) => joinSegments(lang, 'search', 'professionals'), element: <ProfessionalSearch /> },
  { key: 'searchCompanies', path: (lang) => joinSegments(lang, 'search', 'companies'), element: <CompanySearch /> },

  // Anúncio do produto: /{lang}/placa-solar/{companySlug}/{productSlug} — sem ids.
  {
    key: 'productDetail',
    path: (lang) => `${joinSegments(lang, 'solarPanel')}/:companySlug/:productSlug`,
    element: <SolarPanelAnnouncement />,
  },

  // Informativas
  { key: 'about', path: (lang) => joinSegments(lang, 'about'), element: <AboutPage /> },
  { key: 'designSystem', path: (lang) => joinSegments(lang, 'designSystem'), element: <HomePage /> },

  // Perfis: rota "própria" (usuário/empresa autenticados) sem parâmetro, e
  // rota pública com slug para visitar o perfil de terceiros.
  { key: 'ownCompanyProfile', path: (lang) => joinSegments(lang, 'company'), element: <EnterpriseProfile /> },
  {
    key: 'companyProfile',
    path: (lang) => `${joinSegments(lang, 'company')}/:companySlug`,
    element: <CompanyProfile />,
  },
  { key: 'ownUserProfile', path: (lang) => joinSegments(lang, 'user'), element: <UserProfile /> },
  {
    key: 'professionalProfile',
    path: (lang) => `${joinSegments(lang, 'professional')}/:professionalSlug`,
    element: <ProfessionalProfile />,
  },

  // Onboarding de perfil (genérico, reaproveitado por usuário e empresa)
  {
    key: 'profileOnboardingUser',
    path: (lang) => joinSegments(lang, 'profileSetup', 'user'),
    element: <ProfileOnboarding kind="user" />,
  },
  {
    key: 'profileOnboardingCompany',
    path: (lang) => joinSegments(lang, 'profileSetup', 'company'),
    element: <ProfileOnboarding kind="company" />,
  },

  // CRUD (modelo de referência)
  {
    key: 'solarPanelModelsCrud',
    path: (lang) => joinSegments(lang, 'admin', 'solarPanelModels'),
    element: <SolarPanelModelCrud />,
  },

  // Chat / chatbot — mantém :contactId (não faz sentido como slug legível)
  { key: 'chat', path: (lang) => `${joinSegments(lang, 'messages')}/:contactId`, element: <Chat /> },
  { key: 'chatbot', path: (lang) => joinSegments(lang, 'chatbot'), element: <ChatbotPage /> },
];

export function AppRoutes() {
  return (
    <Routes>
      {/* "/" sem prefixo de idioma -> redireciona pro idioma detectado */}
      <Route path="/" element={<RootRedirect />} />

      <Route path="/:lang" element={<LanguageLayout />}>
        {SUPPORTED_LANGUAGES.flatMap((lang) =>
          ACCESS_ROUTE_DEFINITIONS.map(({ key, path, element }) => (
            <Route key={`${lang}-${key}`} path={path(lang)} element={element} />
          )),
        )}

        <Route element={<AppLayout />}>
          <Route index element={<SolarPanelFeed />} />

          {SUPPORTED_LANGUAGES.flatMap((lang) =>
            APP_ROUTE_DEFINITIONS.map(({ key, path, element }) => (
              <Route key={`${lang}-${key}`} path={path(lang)} element={element} />
            )),
          )}

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
