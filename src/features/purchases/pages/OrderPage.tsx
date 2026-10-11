import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { DEFAULT, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";
import OperationalPage from "@@/layout/operational-page/OperationalPage";
import OperationalTable from "@@/layout/operational-page/OperationalTable";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import ConfirmedAction from "@@/overlay/confirmation/ConfirmedAction";
import StatusField from "@@/ui/status-field/StatusField";

import { cancelOrder, formatDate, formatMoney, getOrder } from "../purchases.service";
import type { Order } from "../purchases";

export default function OrderPage() {
  const { t } = useTranslation("purchases", { keyPrefix: "order" });
  const { t: tMethods } = useTranslation("purchases", { keyPrefix: "methods" });
  const { lang: parameter, orderId } = useParams<{ lang: string; orderId: string }>();
  const lang = isSupportedLanguage(parameter) ? parameter : DEFAULT;
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    let active = true;
    getOrder(orderId)
      .then((data) => active && setOrder(data))
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, [orderId]);

  async function handleCancel() {
    if (!order) return;
    setOrder(await cancelOrder(order.id));
  }

  return (
    <OperationalPage
      title={t("title")}
      description={order ? formatDate(order.createdAt, lang) : undefined}
      loading={!order && !error}
      actions={<ToolbarAction to={routePaths.orders(lang)} icon="chevronLeft" label={t("back")} content={t("back")} />}>
      {error && <p className="px-4 sm:px-8 lg:px-10">{t("error")}</p>}
      {order && (
        <div className="flex flex-col gap-6 px-4 pb-10 sm:px-8 lg:px-10">
          <div className="flex flex-wrap items-center gap-4">
            <StatusField state={order.status === "PAID" ? "approved" : "cancelled"} label={t(`statuses.${order.status}`)} />
            {order.payment && (
              <span>
                {t("paymentVia", { method: tMethods(order.payment.method) })} · {t(`paymentStatuses.${order.payment.status}`)}
              </span>
            )}
            {order.canceledAt && <span className="text-operational-muted">{formatDate(order.canceledAt, lang)}</span>}
          </div>
          <OperationalTable
            label={t("items")}
            items={order.items}
            getKey={(line) => `${line.offerSlug}-${line.modelName}`}
            empty={t("empty")}
            columns={[
              { key: "model", label: t("model"), value: (line) => line.modelName, render: (line) => `${line.modelName} · ${line.companyName}` },
              { key: "unitPrice", label: t("unitPrice"), render: (line) => formatMoney(line.netUnitPrice, lang) },
              { key: "quantity", label: t("quantity"), render: (line) => line.quantity },
              { key: "total", label: t("lineTotal"), render: (line) => formatMoney(line.lineTotal, lang) },
            ]}
          />
          <dl className="flex max-w-md flex-col gap-1 self-end">
            <div className="flex justify-between gap-8">
              <dt>{t("subtotal")}</dt>
              <dd>{formatMoney(order.subtotal, lang)}</dd>
            </div>
            <div className="flex justify-between gap-8">
              <dt>{t("fee", { percentage: (order.feePercentage * 100).toLocaleString(lang) })}</dt>
              <dd>{formatMoney(order.feeAmount, lang)}</dd>
            </div>
            <div className="flex justify-between gap-8 font-semi-bold">
              <dt>{t("total")}</dt>
              <dd>{formatMoney(order.total, lang)}</dd>
            </div>
          </dl>
          <p className="text-operational-muted">{t("fictitious")}</p>
          {order.status === "PAID" && (
            <div>
              <ConfirmedAction icon="x" label={t("cancel")} name={formatDate(order.createdAt, lang)} onConfirm={handleCancel} />
            </div>
          )}
        </div>
      )}
    </OperationalPage>
  );
}
