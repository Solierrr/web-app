import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

import { DEFAULT, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";
import OperationalPage from "@@/layout/operational-page/OperationalPage";
import OperationalTable from "@@/layout/operational-page/OperationalTable";
import StatusField from "@@/ui/status-field/StatusField";

import { formatDate, formatMoney, listOrders } from "../purchases.service";
import type { Order } from "../purchases";

export default function OrdersPage() {
  const { t } = useTranslation("purchases", { keyPrefix: "orders" });
  const { lang: parameter } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(parameter) ? parameter : DEFAULT;
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    listOrders()
      .then((data) => active && setOrders(data))
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, []);

  return (
    <OperationalPage title={t("title")} description={t("description")} loading={!orders && !error}>
      {error && <p className="px-4 sm:px-8 lg:px-10">{t("error")}</p>}
      {orders && (
        <div className="px-4 pb-10 sm:px-8 lg:px-10">
          <OperationalTable
            label={t("list")}
            items={orders}
            getKey={(order) => order.id}
            empty={t("empty")}
            columns={[
              {
                key: "date",
                label: t("date"),
                value: (order) => order.createdAt,
                render: (order) => (
                  <Link className="font-medium hover:underline" to={routePaths.orderDetail(lang, order.id)}>
                    {formatDate(order.createdAt, lang)}
                  </Link>
                ),
              },
              {
                key: "items",
                label: t("items"),
                render: (order) => order.items.reduce((sum, item) => sum + item.quantity, 0),
              },
              { key: "total", label: t("total"), value: (order) => order.total, render: (order) => formatMoney(order.total, lang) },
              {
                key: "status",
                label: t("status"),
                filterable: true,
                value: (order) => t(`statuses.${order.status}`),
                render: (order) => (
                  <StatusField state={order.status === "PAID" ? "approved" : "cancelled"} label={t(`statuses.${order.status}`)} />
                ),
              },
            ]}
          />
        </div>
      )}
    </OperationalPage>
  );
}
