import { Route } from "react-router-dom";

import { AppLayout } from "@/config/AppLayout";
import { AboutPage } from "@/pages/AboutPage";
import { HomePage } from "@/pages/HomePage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import ForgotPasswordPage from "@/pages/access/forgot-password/ForgotPasswordPage";
import LoginPage from "@/pages/access/login/LoginPage";
import RegisterPage from "@/pages/access/register/RegisterPage";
import SolarPanelAnnouncement from "@/pages/announcement/SolarPanelAnnouncement";
import Chat from "@/pages/chat/Chat";
import ChatbotPage from "@/pages/chat/ChatbotPage";
import SolarPanelModelCrud from "@/pages/crud/SolarPanelModelCrud";
import CompanyFeed from "@/pages/feed/company/CompanyFeed";
import ProfessionalFeed from "@/pages/feed/professional/ProfessionalFeed";
import SolarPanelFeed from "@/pages/feed/solar-panel/SolarPanelFeed";
import ProfileOnboarding from "@/pages/profile/onboarding/ProfileOnboarding";
import ProfilePage from "@/pages/profile/ProfilePage";
import ProfessionalSearch from "@/pages/search/ProfessionalSearch";
import SolarPanelSearch from "@/pages/search/SolarPanelSearch";
import CompanySearch from "@/pages/search/CompanySearch";

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
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="not-found" element={<NotFoundPage />} />
        <Route path="design-system" element={<HomePage />} />

        <Route path="feeds/solar-panels" element={<SolarPanelFeed />} />
        <Route path="feeds/professionals" element={<ProfessionalFeed />} />
        <Route path="feeds/companies" element={<CompanyFeed />} />

        <Route path="search/solar-panels" element={<SolarPanelSearch />} />
        <Route path="search/professionals" element={<ProfessionalSearch />} />
        <Route path="search/companies" element={<CompanySearch />} />

        <Route path={`products/solar-panels/${COMPANY_SLUG}/${PRODUCT_SLUG}`} element={<SolarPanelAnnouncement />} />

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
