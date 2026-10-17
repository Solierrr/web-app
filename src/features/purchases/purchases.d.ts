export type PaymentMethod = "PIX" | "CREDIT_CARD" | "BOLETO" | "TRANSFER";
export type OrderStatus = "PAID" | "CANCELED";
export type OrderPaymentStatus = "PAID" | "REFUNDED";
export type BillingStatus = "PENDING" | "PAID" | "CANCELED" | "REFUNDED";

export interface CartLine {
  offerId: string;
  offerSlug: string;
  companySlug: string;
  companyName: string;
  modelName: string;
  unitPrice: number;
  discountPercentage: number;
  netUnitPrice: number;
  quantity: number;
  lineTotal: number;
  availability: number;
  purchasable: boolean;
}

export interface Cart {
  items: CartLine[];
  subtotal: number;
  feePercentage: number;
  feeAmount: number;
  total: number;
}

export interface OrderLine {
  offerId: string | null;
  offerSlug: string;
  companyName: string;
  modelName: string;
  unitPrice: number;
  discountPercentage: number;
  netUnitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderPayment {
  method: PaymentMethod;
  amount: number;
  status: OrderPaymentStatus;
  paidAt: string;
  refundedAt: string | null;
}

export interface Order {
  id: string;
  status: OrderStatus;
  subtotal: number;
  feePercentage: number;
  feeAmount: number;
  total: number;
  createdAt: string;
  canceledAt: string | null;
  payment: OrderPayment | null;
  items: OrderLine[];
}

export interface Sale {
  orderId: string;
  itemId: string;
  status: OrderStatus;
  createdAt: string;
  buyerUsername: string;
  offerId: string | null;
  offerSlug: string;
  modelName: string;
  netUnitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface PlanCharge {
  id: string;
  subscriptionId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: BillingStatus;
  dueDate: string;
  paymentDate: string | null;
}

export interface Subscription {
  id: string;
  planName: string;
  planValue: number;
  planCycle: string;
  status: "PAID" | "IN_DEBT" | "SUSPENDED";
  autoRenewal: boolean;
  startDate: string;
  endDate: string | null;
  charges: PlanCharge[];
}
