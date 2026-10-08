import { DetailField } from "@@/layout/operational-page/OperationalDetails";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import OperationalPage from "@@/layout/operational-page/OperationalPage";
import { DEFAULT, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";
import { useActiveContext } from "@/lib/shared/context/ActiveContext";
import { listCompanyUnits, type LocalUnit } from "../unit.service";

export default function UnitPage() {
  const { t } = useTranslation("commons", { keyPrefix: "unitsManagement" });
  const { t: tSaas } = useTranslation("saas");
  const { unitId, lang: parameter } = useParams<{ unitId: string; lang: string }>();
  const lang = isSupportedLanguage(parameter) ? parameter : DEFAULT;
  const { company } = useActiveContext();
  const [unit, setUnit] = useState<LocalUnit | null>(null);
  const requestKey = `${company?.id}:${unitId}`;
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    if (!company) return;
    listCompanyUnits(company.id)
      .then((items) => {
        const item = items.find((entry) => entry.id === unitId);
        if (!item) throw new Error("Unit not found");
        if (active) {
          setUnit(item);
          setError(false);
        }
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
          setLoadedKey(requestKey);
        }
      });
    return () => {
      active = false;
    };
  }, [company, unitId, requestKey]);
  return (
    <OperationalPage
      title={t("title")}
      loading={loading || loadedKey !== requestKey}
      compact
      centered
      sideBackground
      actions={
        <ToolbarAction to={routePaths.unitsManagement(lang)} icon="chevronLeft" label={tSaas("details.back")} content={tSaas("details.back")} />
      }>
      {error ? (
        <p role="alert">{tSaas("details.error")}</p>
      ) : (
        unit && (
          <dl className="grid gap-4 rounded-surface border-ui bg-white shadow-surface p-6 sm:grid-cols-2">
            <DetailField label={t("street")} value={unit.address ? `${unit.address.street}, ${unit.address.number ?? "—"}` : t("noAddress")} />
            <DetailField
              label={t("city")}
              value={
                <>
                  {unit.address?.city} / {unit.address?.state}
                </>
              }
            />
            <DetailField label={t("zipCode")} value={unit.address?.zipCode ?? "—"} />
            {unit.address && (
              <div>
                <a
                  className="text-orange underline"
                  target="_blank"
                  rel="noreferrer"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${[unit.address.street, unit.address.number].filter(Boolean).join(" ")}, ${unit.address.city} ${unit.address.state} ${unit.address.zipCode}`,
                  )}`}>
                  {t("openMap")}
                </a>
              </div>
            )}
            <DetailField label={t("complement")} value={unit.complement ?? "—"} />
            <DetailField label={t("locationType")} value={t(`locationTypes.${unit.locationType.toLowerCase()}`)} />
          </dl>
        )
      )}
    </OperationalPage>
  );
}
