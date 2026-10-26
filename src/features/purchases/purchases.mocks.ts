import { solarPanelAnnouncementMocks } from "@/config/mocks/registry";
import { getAuthSession } from "@/lib/shared/auth/authToken.utils";
import i18n from "@/config/i18n/internationalization";
import type { Cart, CartLine, Order, PaymentMethod } from "./purchases";

interface PurchaseState {
  quantities: Record<string, number>;
  orders: Order[];
}
const money = (value: number) => Math.round(value * 100) / 100;

export function mockPurchaseRequest(path: string, method: string, body?: unknown): unknown {
  const session = getAuthSession();
  if (!session?.isMock) throw new Error(i18n.t("purchases:cart.error"));
  const key = `marketplace.mock.purchases.${session.userId}`;
  const state: PurchaseState = JSON.parse(sessionStorage.getItem(key) ?? '{"quantities":{},"orders":[]}');
  const save = () => sessionStorage.setItem(key, JSON.stringify(state));
  const fail = () => {
    throw new Error(i18n.t("purchases:cart.unavailable"));
  };
  const availability = (id: string, stock: number) =>
    stock -
    state.orders
      .filter((order) => order.status === "PAID")
      .flatMap((order) => order.items)
      .filter((item) => item.offerId === id)
      .reduce((sum, item) => sum + item.quantity, 0);
  const cart = (): Cart => {
    const items: CartLine[] = Object.entries(state.quantities).map(([id, quantity]) => {
      const offer = solarPanelAnnouncementMocks.find((item) => item.id === id);
      if (!offer) return fail();
      const discountPercentage = offer.discountPercentage ?? 0;
      const netUnitPrice = money(offer.unitPrice * (1 - discountPercentage / 100));
      const stock = availability(id, offer.availableUnits);
      return {
        offerId: id,
        offerSlug: offer.slug,
        companySlug: offer.companySlug,
        companyName: offer.company.tradeName,
        modelName: offer.title,
        unitPrice: offer.unitPrice,
        discountPercentage,
        netUnitPrice,
        quantity,
        lineTotal: money(netUnitPrice * quantity),
        availability: stock,
        purchasable: quantity <= stock,
      };
    });
    const subtotal = money(items.reduce((sum, line) => sum + line.lineTotal, 0));
    const feeAmount = money(subtotal * 0.005);
    return { items, subtotal, feePercentage: 0.005, feeAmount, total: money(subtotal + feeAmount) };
  };
  if (path === "/cart" && method === "GET") return cart();
  if (path.startsWith("/cart/items/")) {
    const id = decodeURIComponent(path.slice("/cart/items/".length));
    if (method === "DELETE") delete state.quantities[id];
    else if (method === "PUT") {
      const quantity = (body as { quantity: number }).quantity;
      const offer = solarPanelAnnouncementMocks.find((item) => item.id === id);
      if (!offer || !Number.isInteger(quantity) || quantity < 1 || quantity > availability(id, offer.availableUnits)) return fail();
      state.quantities[id] = quantity;
    } else return fail();
    save();
    return cart();
  }
  if (path === "/orders" && method === "GET") return state.orders;
  if (path === "/orders" && method === "POST") {
    const current = cart();
    const paymentMethod = (body as { paymentMethod: PaymentMethod }).paymentMethod;
    if (
      !current.items.length ||
      current.items.some((item) => !item.purchasable) ||
      !["PIX", "CREDIT_CARD", "BOLETO", "TRANSFER"].includes(paymentMethod)
    )
      return fail();
    const now = new Date().toISOString();
    const order: Order = {
      ...current,
      id: crypto.randomUUID(),
      status: "PAID",
      createdAt: now,
      canceledAt: null,
      payment: { method: paymentMethod, amount: current.total, status: "PAID", paidAt: now, refundedAt: null },
    };
    state.orders.unshift(order);
    state.quantities = {};
    save();
    return order;
  }
  const match = path.match(/^\/orders\/([^/]+)(\/cancel)?$/);
  if (match) {
    const order = state.orders.find((item) => item.id === decodeURIComponent(match[1]));
    if (!order) return fail();
    if (match[2] && method === "PATCH") {
      if (order.status !== "PAID") return fail();
      order.status = "CANCELED";
      order.canceledAt = new Date().toISOString();
      if (order.payment) {
        order.payment.status = "REFUNDED";
        order.payment.refundedAt = order.canceledAt;
      }
      save();
    }
    return order;
  }
  return fail();
}
