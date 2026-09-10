import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Order } from "../../types/order.types";

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("order_type", "pickup")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        console.error("Supabase error:", error);
        setError("Gagal memuat pesanan. Periksa koneksi Anda.");
      } else {
        setOrders(data as Order[]);
        setError(null);
      }
      setLoading(false);
    };

    fetchOrders();

    const channel = supabase
      .channel("pickup_orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          fetchOrders();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const formatOrderDate = (
    dateString: string | number | Date | undefined,
  ): string => {
    if (!dateString) return "Baru saja";

    try {
      return new Date(dateString).toLocaleString("id-ID", {
        dateStyle: "full",
        timeStyle: "short",
      });
    } catch (err) {
      console.error("Error formatting date:", err);
      return "Tanggal tidak valid";
    }
  };

  return {
    orders,
    loading,
    error,
    formatOrderDate,
  };
};
