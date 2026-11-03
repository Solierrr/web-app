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
import Select from "@@/ui/select/Select";
import SurfaceGroup from "@@/ui/surface/SurfaceGroup";
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
    <OperationalPage title={t("title")} description={t("description")} loading={!cart && !error} centered sideBackground>
      {error && <p>{t("error")}</p>}
      {cart && (
        <div className="flex flex-col gap-6">
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
          <section aria-label={t("summary")} className="mx-auto flex w-full min-w-0 flex-col gap-4 lg:w-[85%]">
            <SurfaceGroup contentClassName="[&>div]:flex [&>div]:items-center [&>div]:justify-between [&>div]:gap-8 [&>div]:px-4 [&>div]:py-3">
              <div>
                <span>{t("subtotal")}</span>
                <span>{formatMoney(cart.subtotal, lang)}</span>
              </div>
              <div>
                <span>{t("fee", { percentage: (cart.feePercentage * 100).toLocaleString(lang) })}</span>
                <span>{formatMoney(cart.feeAmount, lang)}</span>
              </div>
              <div className="font-semi-bold">
                <span>{t("total")}</span>
                <span>{formatMoney(cart.total, lang)}</span>
              </div>
              <div>
                <span>{t("paymentMethod")}</span>
                <Select<PaymentMethod>
                  name={t("paymentMethod")}
                  value={method}
                  clearable={false}
                  rounded
                  options={METHODS.map((item) => [tMethods(item), item] as const)}
                  onChange={(value) => value && setMethod(value)}
                />
              </div>
            </SurfaceGroup>
            <PrimaryButton
              type="button"
              variant="soft"
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
