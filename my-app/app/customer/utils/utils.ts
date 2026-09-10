import {
  Order,
  ChartData,
  DateRangeType,
  DAYS_IN_RANGE,
  ORDER_STATUS,
} from "../components/constants";

/**
 * Format date to Indonesian locale
 */
export function formatDateToIndonesian(date: Date): string {
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}

/**
 * Get start of today (00:00:00)
 */
export function getStartOfToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * Calculate daily revenue for chart
 */
export function calculateDailyRevenue(
  orders: Order[],
  dateRange: DateRangeType,
): ChartData[] {
  const dailyRevenue: Record<string, number> = {};
  const daysToShow = DAYS_IN_RANGE[dateRange];

  // Initialize date buckets
  for (let i = daysToShow - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = formatDateToIndonesian(date);
    dailyRevenue[dateStr] = 0;
  }

  // Populate with order data
  orders.forEach((order) => {
    if (order.status !== ORDER_STATUS.COMPLETED) return;

    const orderDate = new Date(order.created_at);
    const dateStr = formatDateToIndonesian(orderDate);

    if (dailyRevenue[dateStr] !== undefined) {
      dailyRevenue[dateStr] += order.total_amount;
    }
  });

  // Convert to chart data format
  return Object.entries(dailyRevenue).map(([name, total]) => ({
    name,
    total,
  }));
}

/**
 * Calculate dashboard statistics
 */
export function calculateStats(orders: Order[], activeMenuCount: number) {
  const today = getStartOfToday();

  const stats = orders.reduce(
    (acc, order) => {
      const orderDate = new Date(order.created_at);
      const isToday = orderDate >= today;

      // Count completed orders today
      if (isToday && order.status === ORDER_STATUS.COMPLETED) {
        acc.ordersToday++;
        acc.totalRevenue += order.total_amount;
      }

      const isPending =
        order.status === ORDER_STATUS.NEW ||
        order.status === ORDER_STATUS.PROCESSING;

      if (isPending) {
        acc.pendingOrders++;
      }

      return acc;
    },
    {
      ordersToday: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      activeMenu: activeMenuCount,
    },
  );

  return stats;
}
