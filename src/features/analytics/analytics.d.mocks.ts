import type { AnalyticsDashboard } from "./analytics";

const LOADED_AT = "2026-11-02T12:00:00Z";

export function getAnalyticsDashboardMock(scope: AnalyticsDashboard["scope"], companyId: string | null = null): AnalyticsDashboard {
  if (scope === "SUPPLIER") {
    return {
      scope,
      companyId,
      loadedAt: LOADED_AT,
      kpis: {
        kpi_supplier_offers_summary: [{ registered_offers: 12, active_offers: 9, expired_offers: 1, offers_expiring_in_30_days: 2 }],
        kpi_supplier_stock_summary: [{ stock_units: 340, models_in_stock: 8 }],
        kpi_supplier_proposals_summary: [
          { open_received_proposals: 3, accepted_proposals: 5, closed_acceptance_rate_pct: 62.5, accepted_negotiated_value: 184000 },
        ],
        kpi_supplier_offers_by_status: [
          { commercial_status: "ACTIVE", offer_count: 9 },
          { commercial_status: "EXPIRED", offer_count: 1 },
        ],
        kpi_supplier_proposals_by_status: [
          { proposal_status: "ACCEPTED", received_proposals: 5 },
          { proposal_status: "PENDING", received_proposals: 3 },
        ],
        kpi_supplier_accepted_value_by_month: [
          { proposal_created_month_proxy: "2026-09-01", accepted_negotiated_value: 64000 },
          { proposal_created_month_proxy: "2026-10-01", accepted_negotiated_value: 120000 },
        ],
        kpi_supplier_accepted_value_by_model: [
          { model_name: "Modelo 550W", accepted_negotiated_value: 120000 },
          { model_name: "Modelo 450W", accepted_negotiated_value: 64000 },
        ],
        kpi_supplier_stock_by_model: [
          { model_name: "Modelo 550W", stock_units: 200 },
          { model_name: "Modelo 450W", stock_units: 140 },
        ],
      },
    };
  }
  if (scope === "REQUESTER") {
    return {
      scope,
      companyId,
      loadedAt: LOADED_AT,
      kpis: {
        kpi_requester_summary: [{ registered_local_units: 3, registered_proposals: 4, registered_projects: 2 }],
        kpi_requester_proposals_by_status: [
          { proposal_status: "ACCEPTED", proposal_count: 3 },
          { proposal_status: "PENDING", proposal_count: 1 },
        ],
        kpi_requester_projects_by_status: [{ project_status: "IN_PROGRESS", project_count: 2 }],
      },
    };
  }
  return {
    scope: "PLATFORM",
    companyId: null,
    loadedAt: LOADED_AT,
    kpis: {
      kpi_admin_registrations: [{ active_suppliers: 11, registered_requesters: 15 }],
      kpi_admin_models_by_status: [
        { model_status: "APPROVED", model_count: 20 },
        { model_status: "UNDER_ANALYSIS", model_count: 4 },
      ],
      kpi_admin_proposals_by_status: [
        { proposal_status: "ACCEPTED", proposal_count: 12 },
        { proposal_status: "PENDING", proposal_count: 6 },
      ],
    },
  };
}
