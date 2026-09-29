import type { ReactNode } from "react";
import { Route, Routes } from "react-router-dom";

import AppMode from "@/config/vite/mode.enum";

import { TestRoutes } from "./TestRoutes";
import { AppLayout } from "../config/AppLayout";
import { SaaSLayout } from "@/components/layout/saas/SaaSLayout";
import LanguageLayout, { RootRedirect } from "../config/inter/browser/LanguageLayout";
import { NotFoundPage } from "../pages/error/not-found/NotFound";

import { SUPPORTED, type SupportedLanguage } from "@/config/inter/browser/languages";
import { joinSegments } from "@/config/inter/paths";

import SolarPanelAnnouncement from "@/features/solar-panel/pages/announcement/SolarPanelAnnouncement";
import SolarPanelFeed from "@/features/solar-panel/pages/feed/SolarPanelFeed";
import ProfessionalFeed from "@/features/professionals/pages/feed/ProfessionalFeed";
import CompanyFeed from "@/features/companies/pages/feed/CompanyFeed";
import SolarPanelSearch from "@/features/solar-panel/pages/search/SolarPanelSearch";
import ProfessionalSearch from "@/features/professionals/pages/search/ProfessionalSearch";
import CompanySearch from "@/features/companies/pages/search/CompanySearch";
import ProfileOnboarding from "@/components/layout/profile/ProfileOnboarding";
import CompanyOnboarding from "@/features/companies/pages/onboarding/CompanyOnboarding";
import ProfessionalOnboarding from "@/features/professionals/pages/onboarding/ProfessionalOnboarding";
import AccountSetupPage from "@/features/access/pages/account-setup/AccountSetupPage";
import AccessInfoPage from "@/features/access/pages/access-info/AccessInfoPage";
import EnterpriseProfile from "@/features/companies/pages/profile/EnterpriseProfile";
import CompanyProfile from "@/features/companies/pages/profile/CompanyProfile";
import UserProfile from "@/features/users/pages/profile/UserProfile";
import ProfessionalProfile from "@/features/professionals/pages/profile/ProfessionalProfile";
import SolarPanelModelCrud from "@/features/solar-panel/pages/crud/SolarPanelModelCrud";
import Chat from "@/features/messages/pages/Chat";
import Inbox from "@/features/messages/pages/Inbox";
import ContactCompany from "@/features/messages/pages/ContactCompany";
import ChatbotPage from "@/features/messages/pages/ChatbotPage";
import LoginPage from "@/features/access/pages/login/LoginPage";
import RegisterPage from "@/features/access/pages/register/RegisterPage";
import ForgotPasswordPage from "@/features/access/pages/forgot-password/ForgotPasswordPage";
import VerifyEmailPage from "@/features/access/pages/verify-email/VerifyEmailPage";
import SettingsPage from "@/features/settings/pages/SettingsPage";
import SettingsSecurityPage from "@/features/settings/pages/security/SettingsSecurityPage";
import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import EmployeesPage from "@/features/companies/pages/employees/EmployeesPage";
import OffersPage from "@/features/offers/pages/OffersPage";
import UnitsPage from "@/features/units/pages/UnitsPage";
import RequireAuth from "@/features/access/RequireAuth";
import RequireCompany from "@/features/access/RequireCompany";

interface RouteDefinition {
  key: string;
  path: (lang: SupportedLanguage) => string;
  element: ReactNode;
}

const ACCESS: RouteDefinition[] = [
  { key: "login", path: (lang) => joinSegments(lang, "login"), element: <LoginPage /> },
  { key: "register", path: (lang) => joinSegments(lang, "register"), element: <RegisterPage /> },
  { key: "forgotPassword", path: (lang) => joinSegments(lang, "forgotPassword"), element: <ForgotPasswordPage /> },
];

const APP: RouteDefinition[] = [
  { key: "solarPanelsFeed", path: (lang) => joinSegments(lang, "solarPanels"), element: <SolarPanelFeed /> },
  { key: "professionalsFeed", path: (lang) => joinSegments(lang, "professionals"), element: <ProfessionalFeed /> },
  { key: "companiesFeed", path: (lang) => joinSegments(lang, "companies"), element: <CompanyFeed /> },

  { key: "searchSolarPanels", path: (lang) => joinSegments(lang, "search", "solarPanels"), element: <SolarPanelSearch /> },
  { key: "searchProfessionals", path: (lang) => joinSegments(lang, "search", "professionals"), element: <ProfessionalSearch /> },
  { key: "searchCompanies", path: (lang) => joinSegments(lang, "search", "companies"), element: <CompanySearch /> },

  { key: "productDetail", path: (lang) => `${joinSegments(lang, "solarPanel")}/:companySlug/:productSlug`, element: <SolarPanelAnnouncement /> },

  { key: "companyProfile", path: (lang) => `${joinSegments(lang, "company")}/:companySlug`, element: <CompanyProfile /> },
  { key: "professionalProfile", path: (lang) => `${joinSegments(lang, "professional")}/:professionalSlug`, element: <ProfessionalProfile /> },

  { key: "profileOnboardingUser", path: (lang) => joinSegments(lang, "profileSetup", "user"), element: <ProfileOnboarding kind="user" /> },

  { key: "chatbot", path: (lang) => joinSegments(lang, "chatbot"), element: <ChatbotPage /> },
];

const SAAS: RouteDefinition[] = [
  { key: "dashboard", path: (lang) => joinSegments(lang, "dashboard"), element: <DashboardPage /> },
  { key: "verifyEmail", path: (lang) => joinSegments(lang, "verifyEmail"), element: <VerifyEmailPage /> },
  { key: "settings", path: (lang) => joinSegments(lang, "settings"), element: <SettingsPage /> },
  { key: "settingsSecurity", path: (lang) => joinSegments(lang, "settings", "security"), element: <SettingsSecurityPage /> },
  { key: "accountSetup", path: (lang) => joinSegments(lang, "profileSetup"), element: <AccountSetupPage /> },
  { key: "profileOnboardingCompany", path: (lang) => joinSegments(lang, "profileSetup", "company"), element: <CompanyOnboarding /> },
  { key: "profileOnboardingProfessional", path: (lang) => joinSegments(lang, "profileSetup", "professional"), element: <ProfessionalOnboarding /> },
  { key: "profileOnboardingAccess", path: (lang) => joinSegments(lang, "profileSetup", "access"), element: <AccessInfoPage /> },
  { key: "contactCompany", path: (lang) => `${joinSegments(lang, "messages", "company")}/:companyId`, element: <ContactCompany /> },
  { key: "inbox", path: (lang) => joinSegments(lang, "messages"), element: <RequireCompany><Inbox /></RequireCompany> },
  { key: "chat", path: (lang) => `${joinSegments(lang, "messages")}/:conversationId`, element: <RequireCompany><Chat /></RequireCompany> },
  { key: "ownCompanyProfile", path: (lang) => joinSegments(lang, "company"), element: <EnterpriseProfile /> },
  { key: "ownUserProfile", path: (lang) => joinSegments(lang, "user"), element: <UserProfile /> },
  { key: "solarPanelModelsCrud", path: (lang) => joinSegments(lang, "admin", "solarPanelModels"), element: <RequireCompany type="SUPPLIER"><SolarPanelModelCrud /></RequireCompany> },
  { key: "employeesManagement", path: (lang) => joinSegments(lang, "admin", "employees"), element: <RequireCompany><EmployeesPage /></RequireCompany> },
  { key: "offersManagement", path: (lang) => joinSegments(lang, "admin", "offers"), element: <RequireCompany type="SUPPLIER"><OffersPage /></RequireCompany> },
  { key: "unitsManagement", path: (lang) => joinSegments(lang, "admin", "units"), element: <RequireCompany type="DEMANDANT"><UnitsPage /></RequireCompany> },
];

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      <Route path="/:lang" element={<LanguageLayout />}>
        {import.meta.env.VITE_APP_MODE === AppMode.TEST && <TestRoutes />}

        {SUPPORTED.flatMap((lang) => ACCESS.map(({ key, path, element }) => <Route key={`${lang}-${key}`} path={path(lang)} element={element} />))}

        <Route element={<AppLayout />}>
          <Route index element={<SolarPanelFeed />} />

          {SUPPORTED.flatMap((lang) => APP.map(({ key, path, element }) => <Route key={`${lang}-${key}`} path={path(lang)} element={element} />))}

          <Route element={<RequireAuth />}>
            <Route element={<SaaSLayout />}>
              {SUPPORTED.flatMap((lang) => SAAS.map(({ key, path, element }) => <Route key={`${lang}-${key}`} path={path(lang)} element={element} />))}
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
