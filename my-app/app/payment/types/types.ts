export type PaymentState = "selection" | "qris_waiting" | "success";

export interface OrderItemData {
  name: string;
  quantity: number;
  price: number;
  note?: string;
}

export interface PendingOrder {
  orderId: string;
  items: OrderItemData[];
  total: number;
  orderType: "pickup" | "delivery";
  address: string;
}
