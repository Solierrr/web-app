import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { DEFAULT, isSupportedLanguage } from "@/config/i18n/browser/languages";
import OperationalPage from "@@/layout/operational-page/OperationalPage";
import OperationalTable from "@@/layout/operational-page/OperationalTable";
import StatusField from "@@/ui/status-field/StatusField";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import { notify } from "@@/feedback/toast/Toast.utils";

import { formatDate, formatMoney, getSubscription, payCharge } from "../purchases.service";
import type { PlanCharge, Subscription } from "../purchases";

export default function PlanPage() {
  const { t } = useTranslation("purchases", { keyPrefix: "plan" });
  const { t: tMethods } = useTranslation("purchases", { keyPrefix: "methods" });
  const { lang: parameter } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(parameter) ? parameter : DEFAULT;
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [error, setError] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setSubscription(await getSubscription());
  }

  useEffect(() => {
    let active = true;
    getSubscription()
      .then((data) => active && setSubscription(data))
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, []);

  async function handlePay(charge: PlanCharge) {
    setBusyId(charge.id);
    try {
      await payCharge(charge.id);
      notify(t("paid"));
      await load();
    } catch (cause) {
      notify(cause instanceof Error ? cause.message : t("error"));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <OperationalPage title={t("title")} description={t("description")} loading={!subscription && !error}>
      {error && <p className="px-4 sm:px-8 lg:px-10">{t("error")}</p>}
      {subscription && (
        <div className="flex flex-col gap-6 px-4 pb-10 sm:px-8 lg:px-10">
          <section aria-label={t("current")} className="flex flex-col gap-1">
            <h2>{subscription.planName}</h2>
            <p>
              {formatMoney(subscription.planValue, lang)} · {t(`cycles.${subscription.planCycle}`, { defaultValue: subscription.planCycle })}
            </p>
            <StatusField
              state={subscription.status === "PAID" ? "approved" : subscription.status === "IN_DEBT" ? "rejected" : "pending"}
              label={t(`statuses.${subscription.status}`)}
            />
            <p className="text-operational-muted">{t("since", { date: formatDate(subscription.startDate, lang) })}</p>
          </section>
          <OperationalTable
            label={t("charges")}
            items={subscription.charges}
            getKey={(charge) => charge.id}
            empty={t("empty")}
            columns={[
              { key: "due", label: t("dueDate"), value: (charge) => charge.dueDate, render: (charge) => charge.dueDate },
              { key: "amount", label: t("amount"), value: (charge) => charge.amount, render: (charge) => formatMoney(charge.amount, lang) },
              { key: "method", label: t("method"), render: (charge) => tMethods(charge.paymentMethod) },
              {
                key: "status",
                label: t("status"),
                filterable: true,
                value: (charge) => t(`chargeStatuses.${charge.status}`),
                render: (charge) => (
                  <StatusField
                    state={charge.status === "PAID" ? "approved" : charge.status === "PENDING" ? "pending" : "cancelled"}
                    label={t(`chargeStatuses.${charge.status}`)}
                  />
                ),
              },
              {
                key: "actions",
                label: "",
                render: (charge) =>
                  charge.status === "PENDING" ? (
                    <ToolbarAction
                      icon="check"
                      label={t("pay")}
                      disabled={busyId !== null}
                      onClick={() => void handlePay(charge)}
                      backgroundColor="var(--color-input-bg)"
                      className="h-8! w-10!"
                    />
                  ) : null,
              },
            ]}
          />
          <p className="text-operational-muted">{t("fictitious")}</p>
        </div>
      )}
    </OperationalPage>
  );
}
