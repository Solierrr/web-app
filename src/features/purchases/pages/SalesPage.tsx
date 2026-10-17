import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { DEFAULT, isSupportedLanguage } from "@/config/i18n/browser/languages";
import OperationalPage from "@@/layout/operational-page/OperationalPage";
import OperationalTable from "@@/layout/operational-page/OperationalTable";
import StatusField from "@@/ui/status-field/StatusField";

import { formatDate, formatMoney, listSales } from "../purchases.service";
import type { Sale } from "../purchases";

export default function SalesPage() {
  const { t } = useTranslation("purchases", { keyPrefix: "sales" });
  const { lang: parameter } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(parameter) ? parameter : DEFAULT;
  const [sales, setSales] = useState<Sale[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    listSales()
      .then((data) => active && setSales(data))
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, []);

  return (
    <OperationalPage title={t("title")} description={t("description")} loading={!sales && !error}>
      {error && <p className="px-4 sm:px-8 lg:px-10">{t("error")}</p>}
      {sales && (
        <div className="px-4 pb-10 sm:px-8 lg:px-10">
          <OperationalTable
            label={t("list")}
            items={sales}
            getKey={(sale) => sale.itemId}
            empty={t("empty")}
            columns={[
              { key: "date", label: t("date"), value: (sale) => sale.createdAt, render: (sale) => formatDate(sale.createdAt, lang) },
              { key: "model", label: t("model"), value: (sale) => sale.modelName, render: (sale) => sale.modelName },
              { key: "buyer", label: t("buyer"), value: (sale) => sale.buyerUsername, render: (sale) => sale.buyerUsername },
              { key: "quantity", label: t("quantity"), value: (sale) => sale.quantity, render: (sale) => sale.quantity },
              { key: "total", label: t("total"), value: (sale) => sale.lineTotal, render: (sale) => formatMoney(sale.lineTotal, lang) },
              {
                key: "status",
                label: t("status"),
                filterable: true,
                value: (sale) => t(`statuses.${sale.status}`),
                render: (sale) => (
                  <StatusField state={sale.status === "PAID" ? "approved" : "cancelled"} label={t(`statuses.${sale.status}`)} />
                ),
              },
            ]}
          />
        </div>
      )}
    </OperationalPage>
  );
}
