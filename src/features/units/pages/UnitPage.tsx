import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import OperationalPage from "@@/layout/operational-page/OperationalPage";
import { DEFAULT, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";
import { useActiveContext } from "@/shared/context/ActiveContext";
import { listCompanyUnits, type LocalUnit } from "../unit.service";

export default function UnitPage() {
  const { t } = useTranslation("commons", { keyPrefix: "unitsManagement" });
  const { t: tSaas } = useTranslation("saas");
  const { unitId, lang: parameter } = useParams<{ unitId: string; lang: string }>();
  const lang = isSupportedLanguage(parameter) ? parameter : DEFAULT;
  const { company } = useActiveContext();
  const [unit, setUnit] = useState<LocalUnit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    if (!company) return;
    listCompanyUnits(company.id)
      .then((items) => {
        const item = items.find((entry) => entry.id === unitId);
        if (!item) throw new Error("Unit not found");
        if (active) setUnit(item);
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
  }, [company, unitId]);
  return (
    <OperationalPage
      title={t("title")}
      loading={loading}
      compact
      actions={<Link to={routePaths.unitsManagement(lang)}>{tSaas("details.back")}</Link>}>
      {error ? (
        <p role="alert">{tSaas("details.error")}</p>
      ) : (
        unit && (
          <dl className="grid gap-4 rounded-small border border-operational-border p-4">
            <div>
              <dt className="text-sm text-operational-muted">{t("street")}</dt>
              <dd>{unit.address ? `${unit.address.street}, ${unit.address.number ?? "—"}` : t("noAddress")}</dd>
            </div>
            <div>
              <dt className="text-sm text-operational-muted">{t("city")}</dt>
              <dd>
                {unit.address?.city} / {unit.address?.state}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-operational-muted">{t("zipCode")}</dt>
              <dd>{unit.address?.zipCode ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-sm text-operational-muted">{t("complement")}</dt>
              <dd>{unit.complement ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-sm text-operational-muted">{t("locationType")}</dt>
              <dd>{t(`locationTypes.${unit.locationType}`)}</dd>
            </div>
          </dl>
        )
      )}
    </OperationalPage>
  );
}
