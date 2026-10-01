import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import OperationalPage from "@@/layout/operational-page/OperationalPage";
import { DEFAULT, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";
import { listSolarPanelModels } from "@/features/solar-panel/solarPanel.service";
import type { SolarPanel } from "@/features/solar-panel/solarPanel";

export default function SolarPanelModelPage() {
  const { t } = useTranslation("crud", { keyPrefix: "solarPanelModel" });
  const { t: tSaas } = useTranslation("saas");
  const { modelId, lang: parameter } = useParams<{ modelId: string; lang: string }>();
  const lang = isSupportedLanguage(parameter) ? parameter : DEFAULT;
  const [model, setModel] = useState<SolarPanel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    listSolarPanelModels()
      .then((items) => {
        const item = items.find((entry) => entry.id === modelId);
        if (!item) throw new Error("Model not found");
        if (active) setModel(item);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [modelId]);
  return (
    <OperationalPage
      title={model ? `${model.brand ?? ""} ${model.model ?? ""}` : t("title")}
      loading={loading}
      compact
      actions={<Link to={routePaths.solarPanelModelsCrud(lang)}>{tSaas("details.back")}</Link>}>
      {error ? (
        <p role="alert">{tSaas("details.error")}</p>
      ) : (
        model && (
          <dl className="grid gap-4 rounded-small border border-operational-border p-4">
            <div>
              <dt className="text-sm text-operational-muted">{t("table.status")}</dt>
              <dd>{model.status}</dd>
            </div>
            <div>
              <dt className="text-sm text-operational-muted">{t("fields.type")}</dt>
              <dd>{model.type ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-sm text-operational-muted">{t("fields.powerOutput")}</dt>
              <dd>{model.powerOutput ?? "—"} Wp</dd>
            </div>
            <div>
              <dt className="text-sm text-operational-muted">{t("fields.efficiency")}</dt>
              <dd>{model.efficiency ?? "—"}%</dd>
            </div>
            <div>
              <dt className="text-sm text-operational-muted">{t("fields.weight")}</dt>
              <dd>{model.weight ?? "—"} kg</dd>
            </div>
            <div>
              <dt className="text-sm text-operational-muted">
                {t("fields.width")} / {t("fields.length")}
              </dt>
              <dd>
                {model.dimension?.width ?? "—"} × {model.dimension?.length ?? "—"}
              </dd>
            </div>
          </dl>
        )
      )}
    </OperationalPage>
  );
}
