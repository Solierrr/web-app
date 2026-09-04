import { Route } from "react-router-dom";

import { AppLayout } from "@/config/AppLayout";
import { NotFoundPage } from "@app/pages/error/not-found/NotFound";
import ForgotPasswordPage from "@app/pages/access/forgot-password/ForgotPasswordPage";
import LoginPage from "@app/pages/access/login/LoginPage";
import RegisterPage from "@app/pages/access/register/RegisterPage";
import SolarPanelAnnouncement from "@app/pages/announcement/SolarPanelAnnouncement";
import Chat from "@app/pages/chat/Chat";
import ChatbotPage from "@app/pages/chat/ChatbotPage";
import SolarPanelModelCrud from "@app/pages/crud/SolarPanelModelCrud";
import CompanyFeed from "@app/pages/feed/company/CompanyFeed";
import ProfessionalFeed from "@app/pages/feed/professional/ProfessionalFeed";
import SolarPanelFeed from "@app/pages/feed/solar-panel/SolarPanelFeed";
import ProfileOnboarding from "@app/pages/profile/onboarding/ProfileOnboarding";
import ProfilePage from "@app/pages/profile/ProfilePage";
import ProfessionalSearch from "@app/pages/search/ProfessionalSearch";
import SolarPanelSearch from "@app/pages/search/SolarPanelSearch";
import CompanySearch from "@app/pages/search/CompanySearch";

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
