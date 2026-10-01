import OperationalPage from "@@/layout/operational-page/OperationalPage";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import type { Company } from "@/features/companies/company";
import { getMyCompany } from "@/features/companies/company.service";
import { getRegistrationStage } from "@/features/companies/company.utils";

export default function RegistrationStatusPage() {
  const { t } = useTranslation("commons", { keyPrefix: "registrationStatusPage" });
  const [company, setCompany] = useState<Company | null | undefined>(undefined);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    getMyCompany()
      .then((result) => {
        if (active) setCompany(result);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const stage = company ? getRegistrationStage(company.status) : null;
  const steps = [t("submitted"), t("manualReview"), t("result")];
  const current = stage === "MANUAL_REVIEW" ? 1 : 2;

  return (
    <OperationalPage title={t("title")} loading={company === undefined && !error} compact>
      <p role="status" className={stage ? "" : "sr-only"}>
        {stage ? t(`stage.${stage}`) : ""}
      </p>
      {error ? <p role="alert">{t("loadError")}</p> : null}
      {company === null ? <p>{t("none")}</p> : null}
      {company && stage ? (
        <>
          <ol className="flex flex-col gap-3">
            {steps.map((label, index) => (
              <li
                key={label}
                aria-current={index === current ? "step" : undefined}
                className={`rounded-small border p-3 ${index === current ? "border-orange font-medium" : "border-operational-border text-operational-muted"}`}>
                {label}
              </li>
            ))}
          </ol>
        </>
      ) : null}
    </OperationalPage>
  );
}
