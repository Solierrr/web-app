import { isAlwaysMockMode } from "@/config/mocks/mockMode.utils";
import i18n from "@/config/i18n/internationalization";
import { API_CORE_URL } from "@/lib/shared/http/apiCore.utils";
import { httpJson } from "@/lib/shared/http/http.service";
import type { Cart, Order, PaymentMethod, PlanCharge, Sale, Subscription } from "./purchases";

const SERVICE_NAME = "purchases";

async function request<T>(path: string, operation: string, method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET", body?: unknown) {
  if (isAlwaysMockMode() && (path.startsWith("/cart") || path.startsWith("/orders"))) {
    const { mockPurchaseRequest } = await import("./purchases.mocks");
    return mockPurchaseRequest(path, method, body) as T;
  }
  return httpJson<T>(`${API_CORE_URL}${path}`, {
    service: SERVICE_NAME,
    operation,
    method,
    body,
    errorMessage: i18n.t(`services:purchases.${operation}`),
  });
}

export function getCart(): Promise<Cart> {
  return request("/cart", "getCart");
}

export function putCartItem(offerId: string, quantity: number): Promise<Cart> {
  return request(`/cart/items/${encodeURIComponent(offerId)}`, "putCartItem", "PUT", { quantity });
}

export function removeCartItem(offerId: string): Promise<Cart> {
  return request(`/cart/items/${encodeURIComponent(offerId)}`, "removeCartItem", "DELETE");
}

export function checkout(paymentMethod: PaymentMethod): Promise<Order> {
  return request("/orders", "checkout", "POST", { paymentMethod });
}

export function listOrders(): Promise<Order[]> {
  return request("/orders", "listOrders");
}

export function getOrder(id: string): Promise<Order> {
  return request(`/orders/${encodeURIComponent(id)}`, "getOrder");
}

export function cancelOrder(id: string): Promise<Order> {
  return request(`/orders/${encodeURIComponent(id)}/cancel`, "cancelOrder", "PATCH");
}

export function listSales(): Promise<Sale[]> {
  return request("/sales", "listSales");
}

export function getSubscription(): Promise<Subscription> {
  return request("/subscription", "getSubscription");
}

export function payCharge(id: string): Promise<PlanCharge> {
  return request(`/charges/${encodeURIComponent(id)}/payment`, "payCharge", "POST");
}

export function formatMoney(value: number, lang: string): string {
  return new Intl.NumberFormat(lang, { style: "currency", currency: "BRL" }).format(value);
}

export function formatDate(value: string | null, lang: string): string {
  return value ? new Intl.DateTimeFormat(lang, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "";
}
