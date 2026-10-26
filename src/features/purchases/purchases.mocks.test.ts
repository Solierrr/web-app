import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Cart, Order } from "./purchases";
import { mockPurchaseRequest } from "./purchases.mocks";
let userId = "buyer";
vi.mock("@/lib/shared/auth/authToken.utils", () => ({ getAuthSession: () => ({ userId, isMock: true }) }));
vi.mock("@/config/mocks/registry", () => ({
  solarPanelAnnouncementMocks: [
    {
      id: "panel",
      slug: "panel",
      companySlug: "supplier",
      company: { tradeName: "Supplier" },
      title: "Panel",
      unitPrice: 100,
      discountPercentage: 10,
      availableUnits: 3,
    },
  ],
}));
vi.mock("@/config/i18n/internationalization", () => ({ default: { t: (key: string) => key } }));
beforeEach(() => {
  sessionStorage.clear();
  userId = "buyer";
});
describe("purchase simulation", () => {
  it("checks stock, freezes totals, clears cart and restores stock when canceled", () => {
    const cart = mockPurchaseRequest("/cart/items/panel", "PUT", { quantity: 2 }) as Cart;
    expect(cart.total).toBe(180.9);
    expect(cart.feePercentage).toBe(0.005);
    expect(() => mockPurchaseRequest("/cart/items/panel", "PUT", { quantity: 4 })).toThrow();
    const order = mockPurchaseRequest("/orders", "POST", { paymentMethod: "PIX" }) as Order;
    expect(order.items[0].quantity).toBe(2);
    expect((mockPurchaseRequest("/cart", "GET") as Cart).items).toHaveLength(0);
    expect(() => mockPurchaseRequest("/orders", "POST", { paymentMethod: "PIX" })).toThrow();
    expect(() => mockPurchaseRequest("/cart/items/panel", "PUT", { quantity: 2 })).toThrow();
    const canceled = mockPurchaseRequest(`/orders/${order.id}/cancel`, "PATCH") as Order;
    expect(canceled.payment?.status).toBe("REFUNDED");
    expect(() => mockPurchaseRequest("/cart/items/panel", "PUT", { quantity: 3 })).not.toThrow();
  });
  it("isolates carts and orders by account", () => {
    mockPurchaseRequest("/cart/items/panel", "PUT", { quantity: 1 });
    userId = "another";
    expect((mockPurchaseRequest("/cart", "GET") as Cart).items).toHaveLength(0);
    expect(mockPurchaseRequest("/orders", "GET")).toEqual([]);
  });
});
