import { listModelPhotos, type ModelPhoto } from "@/features/solar-panel/solarPanel.photo.service";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import OperationalPage from "@@/layout/operational-page/OperationalPage";
import OperationalDetails, { DetailSection, DetailField } from "@@/layout/operational-page/OperationalDetails";
import Breadcrumbs from "@@/ui/breadcrumbs/Breadcrumbs";
import LogoLoader from "@@/feedback/logo-loader/LogoLoader";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import { useActiveContext } from "@/lib/shared/context/ActiveContext";
import { isAlwaysMockMode } from "@/config/mocks/mockMode.utils";
import StatusField from "@@/ui/status-field/StatusField";
import { DEFAULT, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";
import { listSolarPanelModels } from "@/features/solar-panel/solarPanel.service";
import { SolarPanelModelStatus } from "@/features/solar-panel/solarPanel.enum";
import type { SolarPanel } from "@/features/solar-panel/solarPanel";

export default function SolarPanelModelPage() {
  const { t } = useTranslation("crud", { keyPrefix: "solarPanelModel" });
  const { company, can = () => false } = useActiveContext();
  const { t: tSaas } = useTranslation("saas");
  const { modelId, lang: parameter } = useParams<{ modelId: string; lang: string }>();
  const lang = isSupportedLanguage(parameter) ? parameter : DEFAULT;
  const [result, setResult] = useState<{ id?: string; model: SolarPanel | null; photos: ModelPhoto[]; error: boolean } | null>(null);
  const loading = !result || result.id !== modelId;
  const model = loading ? null : result.model;
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const photos = [...(result?.photos ?? [])].sort((a, b) => Number(!!b.primary) - Number(!!a.primary));
  const mainPhoto = photos.find((photo) => photo.id === selectedPhoto) ?? photos[0];
  useEffect(() => {
    let active = true;
    Promise.all([listSolarPanelModels(), listModelPhotos(modelId ?? "")])
      .then(([items, photos]) => {
        const item = items.find((entry) => entry.id === modelId);
        if (!item) throw new Error("Model not found");
        if (active) setResult({ id: modelId, model: item, photos, error: false });
      })
      .catch(() => {
        if (active) setResult({ id: modelId, model: null, photos: [], error: true });
      });
    return () => {
      active = false;
    };
  }, [modelId]);

  if (loading) {
    return (
      <main aria-busy="true" className="flex min-h-full w-full items-center justify-center">
        <LogoLoader label={tSaas("shell.loading")} />
      </main>
    );
  }

  const number = new Intl.NumberFormat(lang, { maximumFractionDigits: 4 });
  const measurement = (value: number | undefined, unit: string) => (value == null ? "" : `${number.format(value)} ${unit}`);
  const status =
    model?.status === SolarPanelModelStatus.APPROVED ? "approved" : model?.status === SolarPanelModelStatus.REJECTED ? "rejected" : "pending";

  const editable =
    !!model &&
    can("PUT /api/models/{id}") &&
    (isAlwaysMockMode() || (model.creatorCompanyId === company?.id && model.status === SolarPanelModelStatus.UNDERANALYSIS));

  return (
    <OperationalPage
      centered
      sideBackground
      title={model ? [model.brand, model.model].filter(Boolean).join(" ") || t("title") : t("title")}
      description={t("details.description")}
      breadcrumbs={
        <Breadcrumbs
          label={t("navigation")}
          items={[
            { label: t("title"), to: routePaths.solarPanelModelsCrud(lang) },
            { label: model ? [model.brand, model.model].filter(Boolean).join(" ") : t("details.overview") },
          ]}
        />
      }
      actions={
        <ToolbarAction icon="chevronLeft" label={tSaas("details.back")} content={tSaas("details.back")} to={routePaths.solarPanelModelsCrud(lang)} />
      }>
      {result.error ? (
        <p role="alert">{tSaas("details.error")}</p>
      ) : (
        model && (
          <OperationalDetails
            title={t("details.overview")}
            status={<StatusField state={status} label={t(`statuses.${model.status}`)} />}
            actions={
              editable && (
                <ToolbarAction
                  icon="edit"
                  label={t("editHeading")}
                  content={t("editHeading")}
                  backgroundColor="var(--color-white)"
                  to={`${routePaths.solarPanelModelsCrud(lang)}?edit=${encodeURIComponent(model.id)}`}
                />
              )
            }
            media={
              <section aria-label={t("photos.title")} className="flex min-w-0 flex-col gap-4">
                <div className="flex min-h-64 items-center justify-center rounded-medium bg-white p-6">
                  {mainPhoto ? (
                    <img src={mainPhoto.url} alt={`${model.brand ?? ""} ${model.model ?? ""}`} className="max-h-96 w-full object-contain" />
                  ) : (
                    <p className="text-operational-muted">{t("photos.none")}</p>
                  )}
                </div>
                {photos.length > 1 && (
                  <div className="scrollbar-none flex gap-3 overflow-auto">
                    {photos.map((photo, index) => (
                      <button
                        key={photo.id}
                        type="button"
                        aria-label={t("photos.view", { number: index + 1 })}
                        aria-pressed={photo.id === mainPhoto?.id}
                        onClick={() => setSelectedPhoto(photo.id)}
                        className={`flex size-20 shrink-0 cursor-pointer items-center justify-center rounded-medium p-2 focus-visible:outline-2 focus-visible:outline-operational-ink ${photo.id === mainPhoto?.id ? "bg-input-bg" : "bg-white"}`}>
                        <img src={photo.url} alt="" className="max-h-full max-w-full object-contain" />
                      </button>
                    ))}
                  </div>
                )}
              </section>
            }>
            <DetailSection plain title={t("details.performance")}>
              <DetailField prominent label={t("fields.powerOutput")} value={measurement(model.powerOutput, "Wp")} />
              <DetailField prominent label={t("fields.efficiency")} value={measurement(model.efficiency, "%")} />
            </DetailSection>
            <DetailSection plain title={t("details.identification")}>
              <DetailField
                label={t("fields.brand")}
                value={
                  model.brandId ? (
                    <Link className="hover:underline underline-offset-4" to={routePaths.brandDetail(lang, model.brandId)}>
                      {model.brand}
                    </Link>
                  ) : (
                    model.brand
                  )
                }
              />
              <DetailField label={t("fields.model")} value={model.model} />
              <DetailField label={t("fields.type")} value={model.type} />
            </DetailSection>
            <DetailSection plain title={t("details.physical")}>
              <DetailField label={t("fields.width")} value={measurement(model.dimension?.width, "m")} />
              <DetailField label={t("fields.length")} value={measurement(model.dimension?.length, "m")} />
              <DetailField label={t("fields.weight")} value={measurement(model.weight, "kg")} />
            </DetailSection>
          </OperationalDetails>
        )
      )}
    </OperationalPage>
  );
}
