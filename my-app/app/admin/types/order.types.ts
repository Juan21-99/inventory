export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  note?: string;
}

export type OrderStatus =
  | "new"
  | "processing"
  | "ready"
  | "completed"
  | "cancelled";

export type OrderType = "pickup" | "delivery";

export interface Order {
  id: string;
  customer_name: string;
  order_type: OrderType;
  address?: string;
  payment_method?: string;
  items: OrderItem[];
  total_amount: number;
  status: OrderStatus;
  created_at: string;
  customer_phone?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  updated_at?: string;
}

export interface OrderFilters {
  searchTerm: string;
  statusFilter: string;
}
