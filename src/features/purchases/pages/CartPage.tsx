import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";

import { DEFAULT, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";
import OperationalPage from "@@/layout/operational-page/OperationalPage";
import OperationalTable from "@@/layout/operational-page/OperationalTable";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import { PrimaryButton } from "@@/ui/button/Button.presets";
import Input from "@@/ui/input/Input";
import { NativeSelect as Select } from "@@/ui/select/Select";
import { notify } from "@@/feedback/toast/Toast.utils";

import { checkout, formatMoney, getCart, putCartItem, removeCartItem } from "../purchases.service";
import type { Cart, CartLine, PaymentMethod } from "../purchases";

const METHODS: PaymentMethod[] = ["PIX", "CREDIT_CARD", "BOLETO", "TRANSFER"];

export default function CartPage() {
  const { t } = useTranslation("purchases", { keyPrefix: "cart" });
  const { t: tMethods } = useTranslation("purchases", { keyPrefix: "methods" });
  const { lang: parameter } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(parameter) ? parameter : DEFAULT;
  const navigate = useNavigate();
  const [cart, setCart] = useState<Cart | null>(null);
  const [error, setError] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>("PIX");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    getCart()
      .then((data) => active && setCart(data))
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, []);

  async function run(action: () => Promise<Cart>) {
    if (busy) return false;
    setBusy(true);
    try {
      setCart(await action());
      return true;
    } catch (cause) {
      notify(cause instanceof Error ? cause.message : t("error"));
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function handleCheckout() {
    if (busy) return;
    setBusy(true);
    try {
      const order = await checkout(method);
      notify(t("paid"));
      navigate(routePaths.orderDetail(lang, order.id));
    } catch (cause) {
      notify(cause instanceof Error ? cause.message : t("error"));
      setBusy(false);
    }
  }

  const blocked = !cart || cart.items.length === 0 || cart.items.some((line) => !line.purchasable);

  return (
    <OperationalPage title={t("title")} description={t("description")} loading={!cart && !error}>
      {error && <p className="px-4 sm:px-8 lg:px-10">{t("error")}</p>}
      {cart && (
        <div className="flex flex-col gap-6 px-4 pb-10 sm:px-8 lg:px-10">
          <OperationalTable
            label={t("items")}
            items={cart.items}
            getKey={(line: CartLine) => line.offerId}
            empty={t("empty")}
            columns={[
              {
                key: "model",
                label: t("model"),
                value: (line) => line.modelName,
                render: (line) => (
                  <div className="flex flex-col">
                    <Link className="font-medium hover:underline" to={routePaths.productDetail(lang, line.companySlug, line.offerSlug)}>
                      {line.modelName}
                    </Link>
                    <span className="text-operational-muted">{line.companyName}</span>
                    {!line.purchasable && <span className="text-orange-copper">{t("unavailable")}</span>}
                  </div>
                ),
              },
              {
                key: "price",
                label: t("unitPrice"),
                render: (line) => (
                  <div className="flex flex-col">
                    <span>{formatMoney(line.netUnitPrice, lang)}</span>
                    {line.discountPercentage > 0 && <span className="text-operational-muted line-through">{formatMoney(line.unitPrice, lang)}</span>}
                  </div>
                ),
              },
              {
                key: "quantity",
                label: t("quantity"),
                render: (line) => (
                  <Input
                    key={`${line.offerId}:${line.quantity}`}
                    name="quantity"
                    type="number"
                    min={1}
                    max={line.availability}
                    defaultValue={line.quantity}
                    aria-label={t("quantity")}
                    disabled={busy}
                    className="w-24"
                    onBlur={(event) => {
                      const quantity = Number(event.target.value);
                      if (!Number.isInteger(quantity) || quantity < 1 || quantity > line.availability) {
                        event.target.value = String(line.quantity);
                        return;
                      }
                      if (quantity !== line.quantity) {
                        const input = event.currentTarget;
                        void run(() => putCartItem(line.offerId, quantity)).then((saved) => {
                          if (!saved) input.value = String(line.quantity);
                        });
                      }
                    }}
                  />
                ),
              },
              { key: "total", label: t("lineTotal"), value: (line) => line.lineTotal, render: (line) => formatMoney(line.lineTotal, lang) },
              {
                key: "actions",
                label: "",
                render: (line) => (
                  <ToolbarAction
                    icon="x"
                    label={t("remove")}
                    disabled={busy}
                    onClick={() => void run(() => removeCartItem(line.offerId))}
                    backgroundColor="var(--color-input-bg)"
                    className="h-8! w-10!"
                  />
                ),
              },
            ]}
          />
          <section aria-label={t("summary")} className="flex max-w-md flex-col gap-3 self-end">
            <dl className="flex flex-col gap-1">
              <div className="flex justify-between gap-8">
                <dt>{t("subtotal")}</dt>
                <dd>{formatMoney(cart.subtotal, lang)}</dd>
              </div>
              <div className="flex justify-between gap-8">
                <dt>{t("fee", { percentage: (cart.feePercentage * 100).toLocaleString(lang) })}</dt>
                <dd>{formatMoney(cart.feeAmount, lang)}</dd>
              </div>
              <div className="flex justify-between gap-8 font-semi-bold">
                <dt>{t("total")}</dt>
                <dd>{formatMoney(cart.total, lang)}</dd>
              </div>
            </dl>
            <label className="flex flex-col gap-1 text-body">
              {t("paymentMethod")}
              <Select
                name="paymentMethod"
                value={method}
                onChange={(event) => setMethod(event.target.value as PaymentMethod)}
                aria-label={t("paymentMethod")}>
                {METHODS.map((item) => (
                  <option key={item} value={item}>
                    {tMethods(item)}
                  </option>
                ))}
              </Select>
            </label>
            <p className="text-operational-muted">{t("fictitious")}</p>
            <PrimaryButton
              type="button"
              disabled={busy || blocked}
              onClick={() => void handleCheckout()}
              className="min-h-12 w-full"
              content={t("pay")}
              description={t("pay")}
            />
          </section>
        </div>
      )}
    </OperationalPage>
  );
}
