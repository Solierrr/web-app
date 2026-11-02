import i18n from "@/config/i18n/internationalization";
import { isAlwaysMockMode } from "@/config/mocks/mockMode.utils";
import { API_CORE_URL } from "@/lib/shared/http/apiCore.utils";
import { httpJson } from "@/lib/shared/http/http.service";
import type { AnalyticsDashboard } from "./analytics";
import { getAnalyticsDashboardMock } from "./analytics.d.mocks";

const SERVICE_NAME = "analytics";

export async function getPlatformDashboard(): Promise<AnalyticsDashboard> {
  if (isAlwaysMockMode()) return getAnalyticsDashboardMock("PLATFORM");
  return httpJson<AnalyticsDashboard>(`${API_CORE_URL}/analytics/platform`, {
    service: SERVICE_NAME,
    operation: "getPlatformDashboard",
    errorMessage: i18n.t("services:analytics.getPlatformDashboard"),
  });
}

export async function getCompanyDashboard(companyId: string, type?: string | null): Promise<AnalyticsDashboard> {
  if (isAlwaysMockMode()) return getAnalyticsDashboardMock(type === "SUPPLIER" ? "SUPPLIER" : "REQUESTER", companyId);
  return httpJson<AnalyticsDashboard>(`${API_CORE_URL}/analytics/companies/${encodeURIComponent(companyId)}`, {
    service: SERVICE_NAME,
    operation: "getCompanyDashboard",
    errorMessage: i18n.t("services:analytics.getCompanyDashboard", { id: companyId }),
  });
}
