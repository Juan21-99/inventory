import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { sendWhatsAppMessage, getPickupReadyMessage } from "@/lib/whatsapp";
import { Order, OrderStatus } from "../../types/order.types";
import { STATUS_SUCCESS_MESSAGES } from "../../constants/order.constants";

export const useOrderStatus = (orders: Order[]) => {
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const updateStatus = async (
    orderId: string,
    newStatus: OrderStatus,
  ): Promise<void> => {
    setUpdatingOrderId(orderId);

    try {
      const { error } = await supabase
        .from("orders")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      if (error) throw error;

      // Send WhatsApp notification
      if (newStatus === "ready") {
        const targetOrder = orders.find((o) => o.id === orderId);
        if (targetOrder?.customer_phone) {
          const message = getPickupReadyMessage(targetOrder.customer_name);
          const sent = await sendWhatsAppMessage(
            targetOrder.customer_phone,
            message,
          );

          if (sent) {
            toast.success("Notifikasi WhatsApp terkirim ke customer");
          }
        }
      }

      toast.success(STATUS_SUCCESS_MESSAGES[newStatus] || "Status diperbarui");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Gagal update status", {
        description:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan tidak diketahui",
      });
      throw error;
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return {
    updatingOrderId,
    updateStatus,
  };
};
