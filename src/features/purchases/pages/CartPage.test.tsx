import type { ReactNode } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCart, putCartItem } from "../purchases.service";
import CartPage from "./CartPage";
vi.mock("@@/layout/operational-page/OperationalPage", () => ({ default: ({ children }: { children: ReactNode }) => <div>{children}</div> }));
vi.mock("../purchases.service", () => ({
  getCart: vi.fn(),
  putCartItem: vi.fn(),
  checkout: vi.fn(),
  removeCartItem: vi.fn(),
  formatMoney: (value: number) => String(value),
}));
const cart = {
  items: [
    {
      offerId: "offer",
      offerSlug: "panel",
      companySlug: "supplier",
      companyName: "Supplier",
      modelName: "Panel",
      unitPrice: 100,
      discountPercentage: 0,
      netUnitPrice: 100,
      quantity: 1,
      lineTotal: 100,
      availability: 3,
      purchasable: true,
    },
  ],
  subtotal: 100,
  feePercentage: 0.005,
  feeAmount: 0.5,
  total: 100.5,
};
beforeEach(() => {
  vi.mocked(getCart).mockResolvedValue(cart);
  vi.mocked(putCartItem).mockReset();
});
describe("cart quantity", () => {
  it("restores the persisted quantity when the API refuses an update", async () => {
    vi.mocked(putCartItem).mockRejectedValue(new Error("out of stock"));
    render(
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>,
    );
    const input = await screen.findByRole("spinbutton");
    fireEvent.change(input, { target: { value: "2" } });
    fireEvent.blur(input);
    await waitFor(() => expect(input).toHaveValue(1));
    expect(putCartItem).toHaveBeenCalledWith("offer", 2);
  });
  it("rejects values outside availability without changing the cart", async () => {
    render(
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>,
    );
    const input = await screen.findByRole("spinbutton");
    fireEvent.change(input, { target: { value: "4" } });
    fireEvent.blur(input);
    expect(input).toHaveValue(1);
    expect(putCartItem).not.toHaveBeenCalled();
  });
});
