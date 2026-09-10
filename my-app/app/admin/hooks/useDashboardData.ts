import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Order, DashboardStats } from "../../customer/components/constants";
import { calculateStats } from "../../customer/utils/utils";

export function useDashboardData() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    ordersToday: 0,
    activeMenu: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });
  const [allOrders, setAllOrders] = useState<Order[]>([]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch orders from last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [ordersResult, productsResult] = await Promise.all([
        supabase
          .from("orders")
          .select("*")
          .gte("created_at", thirtyDaysAgo.toISOString())
          .order("created_at", { ascending: false }),
        supabase.from("products").select("*", { count: "exact" }),
      ]);

      if (ordersResult.error) throw ordersResult.error;
      if (productsResult.error) throw productsResult.error;

      const orders = ordersResult.data.map((order) => ({
        ...order,
        createdAt: {
          toDate: () => new Date(order.created_at),
        },
      })) as unknown as Order[];

      const activeMenuCount = productsResult.count || 0;

      // Calculate statistics
      const calculatedStats = calculateStats(orders, activeMenuCount);

      setStats(calculatedStats);
      setAllOrders(orders);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error("Gagal memuat data dashboard", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { loading, stats, allOrders, refetch: fetchData };
}
