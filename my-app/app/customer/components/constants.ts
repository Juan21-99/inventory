// Types
export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  customer_name: string;
  order_type: string;
  items: OrderItem[];
}

export interface DashboardStats {
  ordersToday: number;
  activeMenu: number;
  totalRevenue: number;
  pendingOrders: number;
}

export interface ChartData {
  name: string;
  total: number;
}

export type DateRangeType = "7d" | "30d";

// Animation Constants
export const ANIMATION = {
  CARD_STAGGER_DELAY: 150,
  SMOOTH_DURATION: 2500,
  STEP_DURATION: 3000,
} as const;

// Date Range Constants
export const DATE_RANGE = {
  WEEK: "7d" as const,
  MONTH: "30d" as const,
};

export const DAYS_IN_RANGE: Record<DateRangeType, number> = {
  "7d": 7,
  "30d": 30,
};

// Order Status
export const ORDER_STATUS = {
  NEW: "new",
  PROCESSING: "processing",
  COMPLETED: "completed",
} as const;
