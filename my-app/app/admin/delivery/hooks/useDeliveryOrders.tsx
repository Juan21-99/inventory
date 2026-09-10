import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Order } from "../../types/delivery.types";

export const useDeliveryOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("order_type", "delivery")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        toast.error("Gagal memuat data pesanan");
      } else {
        setOrders(data as Order[]);
      }
      setLoading(false);
    };

    fetchOrders();

    const channel = supabase
      .channel("delivery_orders")
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

  return {
    orders,
    loading,
  };
};
