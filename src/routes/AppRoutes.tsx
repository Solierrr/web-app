import type { ReactNode } from "react";
import { Route, Routes } from "react-router-dom";

import AppMode from "@/config/vite/mode.enum";

import { TestRoutes } from "./TestRoutes";
import { AppLayout } from "../config/AppLayout";
import { SaaSLayout } from "@/lib/components/layout/saas/SaaSLayout";
import LanguageLayout, { RootRedirect } from "../config/inter/browser/LanguageLayout";
import { NotFoundPage } from "../features/error/pages/not-found/NotFound";

import { SUPPORTED, type SupportedLanguage } from "@/config/inter/browser/languages";
import { joinSegments } from "@/config/inter/paths";

import SolarPanelAnnouncement from "@/features/solar-panel/pages/announcement/SolarPanelAnnouncement";
import SolarPanelFeed from "@/features/solar-panel/pages/feed/SolarPanelFeed";
import ProfessionalFeed from "@/features/professionals/pages/feed/ProfessionalFeed";
import CompanyFeed from "@/features/companies/pages/feed/CompanyFeed";
import SolarPanelSearch from "@/features/solar-panel/pages/search/SolarPanelSearch";
import ProfessionalSearch from "@/features/professionals/pages/search/ProfessionalSearch";
import CompanySearch from "@/features/companies/pages/search/CompanySearch";
import ProfileOnboarding from "@/lib/components/layout/profile/ProfileOnboarding";
import CompanyOnboarding from "@/features/companies/pages/onboarding/CompanyOnboarding";
import ProfessionalOnboarding from "@/features/professionals/pages/onboarding/ProfessionalOnboarding";
import AccountSetupPage from "@/features/access/pages/account-setup/AccountSetupPage";
import AccessInfoPage from "@/features/access/pages/access-info/AccessInfoPage";
import EnterpriseProfile from "@/features/companies/pages/profile/EnterpriseProfile";
import CompanyProfile from "@/features/companies/pages/profile/CompanyProfile";
import UserProfile from "@/features/users/pages/profile/UserProfile";
import ProfessionalProfile from "@/features/professionals/pages/profile/ProfessionalProfile";
import SolarPanelModelCrud from "@/features/solar-panel/pages/crud/SolarPanelModelCrud";
import SolarPanelModelPage from "@/features/solar-panel/pages/crud/SolarPanelModelPage";
import Chat from "@/features/messages/pages/Chat";
import Inbox from "@/features/messages/pages/Inbox";
import ContactCompany from "@/features/messages/pages/ContactCompany";
import ChatbotPage from "@/features/messages/pages/ChatbotPage";
import LoginPage from "@/features/access/pages/login/LoginPage";
import OnboardingPage from "@/features/access/pages/onboarding/OnboardingPage";
import ForgotPasswordPage from "@/features/access/pages/forgot-password/ForgotPasswordPage";
import VerifyEmailPage from "@/features/access/pages/verify-email/VerifyEmailPage";
import SettingsPage from "@/features/settings/pages/SettingsPage";
import SettingsSecurityPage from "@/features/settings/pages/security/SettingsSecurityPage";
import SettingsPrivacyPage from "@/features/settings/pages/privacy/SettingsPrivacyPage";
import SettingsSessionsPage from "@/features/settings/pages/sessions/SettingsSessionsPage";
import ResetPasswordPage from "@/features/access/pages/reset-password/ResetPasswordPage";
import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import EmployeesPage from "@/features/companies/pages/employees/EmployeesPage";
import EmployeePage from "@/features/companies/pages/employees/EmployeePage";
import OffersPage from "@/features/offers/pages/OffersPage";
import OfferPage from "@/features/offers/pages/OfferPage";
import UnitsPage from "@/features/units/pages/UnitsPage";
import UnitPage from "@/features/units/pages/UnitPage";
import RequireAuth from "@/features/access/require-auth/RequireAuth";
import RequireVerifiedEmail from "@/features/access/require-verified-email/RequireVerifiedEmail";
import RequireCompany from "@/features/access/require-company/RequireCompany";
import RequirePlatformAdmin from "@/features/access/require-platform-admin/RequirePlatformAdmin";
import RegistrationStatusPage from "@/features/access/pages/registration-status/RegistrationStatusPage";
import RegistrationDetailPage from "@/features/platform-admin/pages/registration/RegistrationDetailPage";
import RegistrationsPage from "@/features/platform-admin/pages/registrations/RegistrationsPage";

interface RouteDefinition {
  key: string;
  path: (lang: SupportedLanguage) => string;
  element: ReactNode;
}

const ACCESS: RouteDefinition[] = [
  { key: "login", path: (lang) => joinSegments(lang, "login"), element: <LoginPage /> },
  { key: "register", path: (lang) => joinSegments(lang, "register"), element: <OnboardingPage key="professional" kind="professional" /> },
  { key: "registerCompany", path: (lang) => joinSegments(lang, "register", "company"), element: <OnboardingPage key="company" kind="company" /> },
  {
    key: "registerProfessional",
    path: (lang) => joinSegments(lang, "register", "professional"),
    element: <OnboardingPage key="professional" kind="professional" />,
  },
  { key: "activateAccess", path: (lang) => joinSegments(lang, "register", "access"), element: <OnboardingPage key="invitation" kind="invitation" /> },
  { key: "forgotPassword", path: (lang) => joinSegments(lang, "forgotPassword"), element: <ForgotPasswordPage /> },
  { key: "resetPassword", path: (lang) => joinSegments(lang, "resetPassword"), element: <ResetPasswordPage /> },
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
  {
    key: "modelDetail",
    path: (lang) => `${joinSegments(lang, "admin", "solarPanelModels")}/:modelId`,
    element: (
      <RequireCompany type="SUPPLIER" permission="GET /api/models">
        <SolarPanelModelPage />
      </RequireCompany>
    ),
  },
  { key: "operationalChatbot", path: (lang) => joinSegments(lang, "dashboard", "chatbot"), element: <ChatbotPage operational /> },
  {
    key: "offerDetail",
    path: (lang) => `${joinSegments(lang, "admin", "offers")}/:offerId`,
    element: (
      <RequireCompany type="SUPPLIER" permission="GET /api/offers/company/{companyId}">
        <OfferPage />
      </RequireCompany>
    ),
  },
  {
    key: "unitDetail",
    path: (lang) => `${joinSegments(lang, "admin", "units")}/:unitId`,
    element: (
      <RequireCompany type="DEMANDANT" permission="GET /api/local-units/company/{companyId}">
        <UnitPage />
      </RequireCompany>
    ),
  },
  {
    key: "employeeDetail",
    path: (lang) => `${joinSegments(lang, "admin", "employees")}/:employeeId`,
    element: (
      <RequireCompany permission="GET /api/user-companies/company/{companyId}">
        <EmployeePage />
      </RequireCompany>
    ),
  },
  { key: "dashboard", path: (lang) => joinSegments(lang, "dashboard"), element: <DashboardPage /> },
  { key: "verifyEmail", path: (lang) => joinSegments(lang, "verifyEmail"), element: <VerifyEmailPage /> },
  { key: "settings", path: (lang) => joinSegments(lang, "settings"), element: <SettingsPage /> },
  { key: "settingsSecurity", path: (lang) => joinSegments(lang, "settings", "security"), element: <SettingsSecurityPage /> },
  { key: "settingsPrivacy", path: (lang) => joinSegments(lang, "settings", "privacy"), element: <SettingsPrivacyPage /> },
  { key: "settingsSessions", path: (lang) => joinSegments(lang, "settings", "sessions"), element: <SettingsSessionsPage /> },
  { key: "accountSetup", path: (lang) => joinSegments(lang, "profileSetup"), element: <AccountSetupPage /> },
  { key: "profileOnboardingCompany", path: (lang) => joinSegments(lang, "profileSetup", "company"), element: <CompanyOnboarding /> },
  { key: "profileOnboardingProfessional", path: (lang) => joinSegments(lang, "profileSetup", "professional"), element: <ProfessionalOnboarding /> },
  { key: "profileOnboardingAccess", path: (lang) => joinSegments(lang, "profileSetup", "access"), element: <AccessInfoPage /> },
  { key: "contactCompany", path: (lang) => `${joinSegments(lang, "messages", "company")}/:companyId`, element: <ContactCompany /> },
  {
    key: "inbox",
    path: (lang) => joinSegments(lang, "messages"),
    element: (
      <RequireVerifiedEmail>
        <Inbox />
      </RequireVerifiedEmail>
    ),
  },
  {
    key: "chat",
    path: (lang) => `${joinSegments(lang, "messages")}/:conversationId`,
    element: (
      <RequireVerifiedEmail>
        <Chat />
      </RequireVerifiedEmail>
    ),
  },
  { key: "ownCompanyProfile", path: (lang) => joinSegments(lang, "company"), element: <EnterpriseProfile /> },
  { key: "ownUserProfile", path: (lang) => joinSegments(lang, "user"), element: <UserProfile /> },
  {
    key: "solarPanelModelsCrud",
    path: (lang) => joinSegments(lang, "admin", "solarPanelModels"),
    element: (
      <RequireCompany type="SUPPLIER" permission="GET /api/models">
        <SolarPanelModelCrud />
      </RequireCompany>
    ),
  },
  {
    key: "employeesManagement",
    path: (lang) => joinSegments(lang, "admin", "employees"),
    element: (
      <RequireCompany permission="GET /api/user-companies/company/{companyId}">
        <EmployeesPage />
      </RequireCompany>
    ),
  },
  {
    key: "offersManagement",
    path: (lang) => joinSegments(lang, "admin", "offers"),
    element: (
      <RequireCompany type="SUPPLIER" permission="GET /api/offers/company/{companyId}">
        <OffersPage />
      </RequireCompany>
    ),
  },
  {
    key: "unitsManagement",
    path: (lang) => joinSegments(lang, "admin", "units"),
    element: (
      <RequireCompany type="DEMANDANT" permission="GET /api/local-units/company/{companyId}">
        <UnitsPage />
      </RequireCompany>
    ),
  },
  { key: "registrationStatus", path: (lang) => joinSegments(lang, "registrationStatus"), element: <RegistrationStatusPage /> },
  {
    key: "registrationDetail",
    path: (lang) => `${joinSegments(lang, "admin", "registrations")}/:kind/:id`,
    element: (
      <RequirePlatformAdmin>
        <RegistrationDetailPage />
      </RequirePlatformAdmin>
    ),
  },
  {
    key: "registrationsManagement",
    path: (lang) => joinSegments(lang, "admin", "registrations"),
    element: (
      <RequirePlatformAdmin>
        <RegistrationsPage />
      </RequirePlatformAdmin>
    ),
  },
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

          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route element={<RequireAuth />}>
          <Route element={<SaaSLayout />}>
            {SUPPORTED.flatMap((lang) => SAAS.map(({ key, path, element }) => <Route key={`${lang}-${key}`} path={path(lang)} element={element} />))}
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
