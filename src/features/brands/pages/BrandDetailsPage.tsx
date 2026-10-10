import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import OperationalPage from "@@/layout/operational-page/OperationalPage";
import OperationalDetails, { DetailField, DetailSection } from "@@/layout/operational-page/OperationalDetails";
import Breadcrumbs from "@@/ui/breadcrumbs/Breadcrumbs";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import StatusField from "@@/ui/status-field/StatusField";
import Alert from "@@/feedback/alert/Alert";
import { useActiveContext } from "@/lib/shared/context/ActiveContext";
import { DEFAULT, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";
import BrandManager from "../manager/BrandManager";
import { listBrands } from "../brand.service";
import type { Brand } from "../brand";

export default function BrandDetailsPage() {
  const { t } = useTranslation("brands");
  const { t: common } = useTranslation("saas");
  const { brandId, lang: parameter } = useParams();
  const lang = isSupportedLanguage(parameter) ? parameter : DEFAULT;
  const { company, can = () => false } = useActiveContext();
  const [params, setParams] = useSearchParams();
  const [result, setResult] = useState<{ id?: string; context?: string; items: Brand[]; error: boolean } | null>(null);
  const loading = !result || result.id !== brandId || result.context !== company?.id;
  const brand = loading ? undefined : result.items.find((item) => item.id === brandId);
  useEffect(() => {
    let active = true;
    listBrands()
      .then((items) => {
        if (active) setResult({ id: brandId, context: company?.id, items, error: false });
      })
      .catch(() => {
        if (active) setResult({ id: brandId, context: company?.id, items: [], error: true });
      });
    return () => {
      active = false;
    };
  }, [brandId, company?.id]);
  const editable =
    !!brand &&
    !brand.archived &&
    !brand.legacy &&
    !brand.pending &&
    (brand.visibility === "PUBLIC" ? can("POST /api/brands/{id}/requests") : brand.ownerCompanyId === company?.id && can("PUT /api/brands/{id}"));
  const editing = params.get("edit") === "true" && editable;
  function closeForm() {
    const next = new URLSearchParams(params);
    next.delete("edit");
    setParams(next, { replace: true });
  }
  const reference = brand?.referenceUrl && /^https?:\/\//i.test(brand.referenceUrl) ? brand.referenceUrl : undefined;
  return (
    <OperationalPage
      loading={loading}
      title={brand?.name ?? t("details.title")}
      description={t(editing ? "details.editDescription" : "details.description")}
      centered
      sideBackground
      form={editing}
      formBackground={editing}
      breadcrumbs={
        <Breadcrumbs
          label={t("details.navigation")}
          items={[
            { label: t("details.catalog"), to: routePaths.solarPanelModelsCrud(lang) },
            { label: brand?.name ?? t("details.title"), ...(editing && brandId ? { to: routePaths.brandDetail(lang, brandId) } : {}) },
            ...(editing ? [{ label: t("details.edit") }] : []),
          ]}
        />
      }
      actions={
        <ToolbarAction
          icon="chevronLeft"
          label={common("details.back")}
          content={common("details.back")}
          to={routePaths.solarPanelModelsCrud(lang)}
        />
      }>
      {!loading && (!brand || result?.error) ? (
        <Alert>{common("details.error")}</Alert>
      ) : (
        brand &&
        (editing ? (
          <BrandManager
            key={brand.id}
            initialBrandId={brand.id}
            brands={result!.items}
            onClose={closeForm}
            onSaved={async () => {
              const items = await listBrands();
              setResult({ id: brandId, context: company?.id, items, error: false });
              closeForm();
            }}
          />
        ) : (
          <OperationalDetails
            title={t("details.overview")}
            status={
              brand.pending ? (
                <StatusField state="pending" label={t("statuses.PENDING")} />
              ) : (
                <span className="rounded-small bg-white px-3 py-2 text-body text-operational-muted">{t(`visibility.${brand.visibility}`)}</span>
              )
            }
            actions={
              editable && (
                <ToolbarAction
                  icon="edit"
                  label={t(brand.visibility === "PUBLIC" ? "requestCorrection" : "details.edit")}
                  content={t(brand.visibility === "PUBLIC" ? "requestCorrection" : "details.edit")}
                  backgroundColor="var(--color-white)"
                  to={`${routePaths.brandDetail(lang, brand.id)}?edit=true`}
                />
              )
            }
            media={
              <div className="flex min-h-64 items-center justify-center rounded-medium bg-white p-6">
                {brand.logoUrl ? (
                  <img src={brand.logoUrl} alt={brand.name} className="max-h-64 w-full object-contain" />
                ) : (
                  <p className="text-operational-muted">{t("details.noLogo")}</p>
                )}
              </div>
            }>
            <DetailSection plain title={t("details.identification")}>
              <DetailField label={t("name")} value={brand.name} />
              <DetailField label={t("privacy")} value={t(`visibility.${brand.visibility}`)} />
              <DetailField
                label={t("details.reference")}
                value={
                  reference ? (
                    <a href={reference} target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-4">
                      {reference}
                    </a>
                  ) : (
                    ""
                  )
                }
              />
            </DetailSection>
            {brand.pending && <Alert state="info">{t("pendingHelp")}</Alert>}
            {brand.visibility === "PUBLIC" && <Alert state="info">{t("publicHelp")}</Alert>}
          </OperationalDetails>
        ))
      )}
    </OperationalPage>
  );
}
