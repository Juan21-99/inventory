import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { sendWhatsAppMessage, getCancellationMessage } from "@/lib/whatsapp";
import { Order } from "../../types/order.types";

export const useOrderCancellation = (orders: Order[]) => {
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  const openCancellationModal = (orderId: string) => {
    setOrderToCancel(orderId);
    setCancelModalOpen(true);
  };

  const closeCancellationModal = () => {
    if (!isCancelling) {
      setCancelModalOpen(false);
      setOrderToCancel(null);
      setCancellationReason("");
    }
  };

  const validateReason = (): { valid: boolean; error?: string } => {
    if (!cancellationReason.trim()) {
      return { valid: false, error: "Alasan pembatalan wajib diisi" };
    }

    if (cancellationReason.trim().length < 10) {
      return {
        valid: false,
        error: "Alasan terlalu singkat (minimal 10 karakter)",
      };
    }

    return { valid: true };
  };

  const cancelOrder = async (): Promise<void> => {
    if (!orderToCancel) {
      toast.error("Order ID tidak valid");
      return;
    }

    const validation = validateReason();
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setIsCancelling(true);

    try {
      const targetOrder = orders.find((o) => o.id === orderToCancel);
      if (!targetOrder) throw new Error("Order tidak ditemukan");

      // Cancel order in Supabase
      const { error: cancelError } = await supabase
        .from("orders")
        .update({
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
          cancellation_reason: cancellationReason.trim(),
        })
        .eq("id", orderToCancel);

      if (cancelError) throw cancelError;

      // Restore stock for each item
      for (const item of targetOrder.items) {
        if (!item.id) continue;

        const { data: product } = await supabase
          .from("products")
          .select("stock")
          .eq("id", item.id)
          .single();

        if (product) {
          const currentStock = Number(product.stock) || 0;
          const quantityToRestore = Number(item.quantity) || 0;

          await supabase
            .from("products")
            .update({ stock: currentStock + quantityToRestore })
            .eq("id", item.id);
        }
      }

      toast.success("Pesanan dibatalkan & stok dikembalikan", {
        description: "Inventori telah diperbarui secara otomatis",
      });

      // Send WhatsApp notification
      if (targetOrder?.customer_phone) {
        const message = getCancellationMessage(
          targetOrder.customer_name,
          orderToCancel,
          cancellationReason,
          "pickup",
        );

        const sent = await sendWhatsAppMessage(
          targetOrder.customer_phone,
          message,
        );

        if (sent) {
          toast.success("Notifikasi pembatalan terkirim ke customer");
        }
      }

      closeCancellationModal();
    } catch (error) {
      console.error("Error during cancellation:", error);
      toast.error("Gagal membatalkan pesanan");
      throw error;
    } finally {
      setIsCancelling(false);
    }
  };

  return {
    cancelModalOpen,
    orderToCancel,
    cancellationReason,
    isCancelling,
    openCancellationModal,
    closeCancellationModal,
    setCancellationReason,
    cancelOrder,
    validateReason,
  };
};
