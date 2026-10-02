import { CompanyStatus } from "@/features/companies/company.enum";
import type { Company } from "@/features/companies/company";
import { listAllCompanies } from "@/features/companies/company.service";
import { listEmployees } from "@/features/companies/company.management.service";
import { getOfferStatus } from "@/features/offers/offer.utils";
import { listCompanyOffers } from "@/features/offers/offer.service";
import { listProfessionalReviews } from "@/features/professionals/review/review.service";
import { SolarPanelModelStatus } from "@/features/solar-panel/solarPanel.enum";
import { listSolarPanelModels, listSolarPanelModelsByStatus } from "@/features/solar-panel/solarPanel.service";
import { listCompanyUnits } from "@/features/units/unit.service";
import type { KpiResult } from "./analytics";
import { countBy, pickKpis } from "./analytics.utils";

async function settle(entries: [string, Promise<number>][]): Promise<KpiResult> {
  const results = await Promise.allSettled(entries.map(([, promise]) => promise));
  return {
    failed: results.some((result) => result.status === "rejected"),
    kpis: pickKpis(
      entries.map(([key], index) => [key, results[index].status === "fulfilled" ? (results[index] as PromiseFulfilledResult<number>).value : null]),
    ),
  };
}

export function getPlatformKpis(): Promise<KpiResult> {
  const companies = listAllCompanies();
  return settle([
    ["approvedCompanies", companies.then((items) => countBy(items, (item) => item.status === CompanyStatus.APPROVED))],
    ["pendingCompanies", companies.then((items) => countBy(items, (item) => item.status === CompanyStatus.UNDERANALYSIS))],
    ["approvedModels", listSolarPanelModelsByStatus(SolarPanelModelStatus.APPROVED).then((items) => items.length)],
    ["pendingModels", listSolarPanelModelsByStatus(SolarPanelModelStatus.UNDERANALYSIS).then((items) => items.length)],
    ["pendingProfessionals", listProfessionalReviews().then((items) => countBy(items, (item) => item.status === "UNDER_ANALYSIS"))],
  ]);
}

export function getCompanyKpis(company: Company, can: (permission: string) => boolean): Promise<KpiResult> {
  const entries: [string, Promise<number>][] = [];
  if (company.type === "SUPPLIER" && can("GET /api/offers/company/{companyId}")) {
    const offers = listCompanyOffers(company.id);
    entries.push(
      ["activeOffers", offers.then((items) => countBy(items, (item) => getOfferStatus(item) === "ACTIVE"))],
      ["pausedOffers", offers.then((items) => countBy(items, (item) => getOfferStatus(item) === "PAUSED"))],
      ["closedOffers", offers.then((items) => countBy(items, (item) => getOfferStatus(item) === "CLOSED"))],
    );
  }
  if (company.type === "SUPPLIER" && can("GET /api/models")) entries.push(["models", listSolarPanelModels().then((items) => items.length)]);
  if (company.type === "DEMANDANT" && can("GET /api/local-units/company/{companyId}"))
    entries.push(["units", listCompanyUnits(company.id).then((items) => items.length)]);
  if (can("GET /api/user-companies/company/{companyId}")) entries.push(["employees", listEmployees(company.id).then((items) => items.length)]);
  return settle(entries);
}
