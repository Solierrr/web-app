import { Route } from "react-router-dom";

import { AppLayout } from "@/config/AppLayout";
import { NotFoundPage } from "@/pages/error/not-found/NotFound";
import ForgotPasswordPage from "@/features/access/pages/forgot-password/ForgotPasswordPage";
import LoginPage from "@/features/access/pages/login/LoginPage";
import RegisterPage from "@/features/access/pages/register/RegisterPage";
import SolarPanelAnnouncement from "@/features/solar-panel/pages/announcement/SolarPanelAnnouncement";
import Chat from "@/features/messages/pages/Chat";
import ChatbotPage from "@/features/messages/pages/ChatbotPage";
import SolarPanelModelCrud from "@/features/solar-panel/pages/crud/SolarPanelModelCrud";
import CompanyFeed from "@/features/companies/pages/feed/CompanyFeed";
import ProfessionalFeed from "@/features/professionals/pages/feed/ProfessionalFeed";
import SolarPanelFeed from "@/features/solar-panel/pages/feed/SolarPanelFeed";
import ProfileOnboarding from "@/components/layout/profile/ProfileOnboarding";
import ProfilePage from "@/components/layout/profile/ProfilePage";
import ProfessionalSearch from "@/features/professionals/pages/search/ProfessionalSearch";
import SolarPanelSearch from "@/features/solar-panel/pages/search/SolarPanelSearch";
import CompanySearch from "@/features/companies/pages/search/CompanySearch";

const COMPANY_SLUG = "solaria-energia";
const PRODUCT_SLUG = "painel-monocristalino";
const CONTACT_ID = "user-1";

export function TestRoutes() {
  return (
    <>
      <Route path="test/login" element={<LoginPage />} />
      <Route path="test/register" element={<RegisterPage />} />
      <Route path="test/forgot-password" element={<ForgotPasswordPage />} />

      <Route path="test" element={<AppLayout />}>
        <Route path="feeds/solar-panels" element={<SolarPanelFeed />} />
        <Route path="feeds/professionals" element={<ProfessionalFeed />} />
        <Route path="feeds/companies" element={<CompanyFeed />} />

        <Route path="search/solar-panels" element={<SolarPanelSearch />} />
        <Route path="search/professionals" element={<ProfessionalSearch />} />
        <Route path="search/companies" element={<CompanySearch />} />

        <Route path={`solar-panels/${COMPANY_SLUG}/${PRODUCT_SLUG}`} element={<SolarPanelAnnouncement />} />

        <Route path="profiles/template" element={<ProfilePage name="Template" />} />

        <Route path="onboarding/user" element={<ProfileOnboarding kind="user" />} />
        <Route path="onboarding/company" element={<ProfileOnboarding kind="company" />} />

        <Route path="admin/solar-panel-models" element={<SolarPanelModelCrud />} />
        <Route path={`messages/${CONTACT_ID}`} element={<Chat />} />
        <Route path="chatbot" element={<ChatbotPage />} />
      </Route>
    </>
  );
}
