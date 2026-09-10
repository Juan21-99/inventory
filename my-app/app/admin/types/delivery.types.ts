// Reuse from orders but with delivery-specific extensions
export type {
  Order,
  OrderItem,
  OrderStatus,
  OrderType,
} from "./order.types";

export interface DeliveryFilters {
  searchTerm: string;
  statusFilter: string;
}
