import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  sendWhatsAppMessage,
  getDeliveryInProgressMessage,
} from "@/lib/whatsapp";
import { Order, OrderStatus } from "../../types/delivery.types";
import { DELIVERY_STATUS_SUCCESS_MESSAGES } from "../../constants/delivery.constants";

export const useDeliveryStatus = (orders: Order[]) => {
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  const updateStatus = async (
    orderId: string,
    newStatus: OrderStatus,
  ): Promise<void> => {
    setUpdatingOrder(orderId);

    try {
      const { error } = await supabase
        .from("orders")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      if (error) throw error;

      // Send WhatsApp notification when delivery starts
      if (newStatus === "ready") {
        const targetOrder = orders.find((o) => o.id === orderId);
        if (targetOrder?.customer_phone) {
          const message = getDeliveryInProgressMessage(
            targetOrder.customer_name,
          );
          const sent = await sendWhatsAppMessage(
            targetOrder.customer_phone,
            message,
          );

          if (sent) {
            toast.success("Notifikasi WhatsApp terkirim");
          }
        }
      }

      toast.success(
        DELIVERY_STATUS_SUCCESS_MESSAGES[newStatus] || "Status diperbarui",
      );
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Gagal update status", {
        description:
          error instanceof Error ? error.message : "Terjadi kesalahan",
      });
      throw error;
    } finally {
      setUpdatingOrder(null);
    }
  };

  return {
    updatingOrder,
    updateStatus,
  };
};
