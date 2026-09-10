"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

import type { PaymentState, PendingOrder } from "./types/types";
import {
  PaymentMethodList,
  type PaymentMethodId,
} from "./component/PaymentMethodList";
import { OrderSummaryCard } from "./component/OrderSummaryCard";
import { PaymentSuccess } from "./component/PaymentSuccess";
import { QrisScreen } from "./component/QrisScreen";
import { PaymentHeader } from "./component/PaymentHeader";
import { PaymentFooter } from "./component/PaymentFooter";

// Type untuk Supabase realtime payload
interface OrderUpdatePayload {
  new: {
    status: string;
    [key: string]: unknown;
  };
}

export default function PaymentPage() {
  const router = useRouter();
  const [paymentState, setPaymentState] = useState<PaymentState>("selection");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodId>("qris");
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<PendingOrder | null>(null);
  const [qrisData, setQrisData] = useState<{
    qris_url: string;
    transaction_id: string;
    expires_at: string;
  } | null>(null);

  // ========== useEffect 1: Load pendingOrder + Supabase Realtime ==========
  useEffect(() => {
    const stored = localStorage.getItem("pendingOrder");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as PendingOrder;
        setPendingOrder(parsed);

        const checkExistingSession = async () => {
          const { data, error } = await supabase
            .from("orders")
            .select("payment_data, payment_method, status")
            .eq("id", parsed.orderId)
            .single();

          if (!error && data) {
            if (data.status === "cancelled") {
              toast.error("Pesanan Dibatalkan", {
                description: "Maaf, pesanan ini sudah tidak berlaku.",
              });
              localStorage.removeItem("pendingOrder");
              router.push("/");
              return;
            }

            if (data.payment_data) {
              console.log("Found existing payment session:", data.payment_data);
              setQrisData(data.payment_data);
              setPaymentState("qris_waiting");
            }
          }
        };

        checkExistingSession();

        const channel = supabase
          .channel(`order_status_${parsed.orderId}`)
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "orders",
              filter: `id=eq.${parsed.orderId}`,
            },
            (payload: OrderUpdatePayload) => {
              const updatedOrder = payload.new;
              console.log("Realtime order update:", updatedOrder);

              if (updatedOrder.status === "processing") {
                setPaymentState("success");
                localStorage.removeItem("pendingOrder");
                toast.success("Pembayaran Terdeteksi!", {
                  description: "Pesanan Anda sedang diproses oleh kru kami.",
                });
              } else if (updatedOrder.status === "cancelled") {
                toast.error("Pesanan Dibatalkan", {
                  description: "Admin telah membatalkan pesanan ini.",
                });
                localStorage.removeItem("pendingOrder");
                router.push("/");
              }
            },
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      } catch (err) {
        console.error("Error parsing pending order:", err);
        router.push("/");
      }
    } else {
      router.push("/");
    }
  }, [router]);

  // ========== Loading State ==========
  if (!pendingOrder) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <p className="text-stone-500 text-xs font-black uppercase tracking-widest">
          Memuat Pesanan...
        </p>
      </div>
    );
  }

  const orderTotal = pendingOrder.total;
  const finalTotal = orderTotal;

  // ========== Helper: Validate Order Status ==========
  const validateOrderStatus = async (orderId: string): Promise<boolean> => {
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("status")
      .eq("id", orderId)
      .single();

    if (orderError) throw orderError;

    if (orderData.status === "cancelled") {
      toast.error("Gagal Memproses", {
        description: "Pesanan ini sudah dibatalkan.",
      });
      localStorage.removeItem("pendingOrder");
      router.push("/");
      return false;
    }

    return true;
  };

  // ========== Helper: Create QRIS via API ==========
  const createQrisPayment = async (
    customerName: string,
    customerPhone: string,
  ) => {
    const response = await fetch("/api/qris/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: finalTotal,
        order_id: pendingOrder.orderId,
        customer_name: customerName,
        customer_phone: customerPhone,
      }),
    });

    return response.json();
  };

  // ========== Helper: Update Order with  QRIS Data ==========
  const updateOrderWithQris = async (qrisData: {
    qris_url: string;
    transaction_id: string;
    expires_at: string;
  }) => {
    await supabase
      .from("orders")
      .update({
        payment_data: qrisData,
        payment_method: "qris",
      })
      .eq("id", pendingOrder.orderId);

    setQrisData(qrisData);
    setPaymentState("qris_waiting");
  };

  // ========== Helper: Process QRIS Payment ==========
  const processQrisPayment = async () => {
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .select("customer_name, customer_phone, status")
      .eq("id", pendingOrder.orderId)
      .single();

    if (orderError) throw new Error("Gagal mengambil data pesanan");

    const isValid = await validateOrderStatus(pendingOrder.orderId);
    if (!isValid) return;

    const customerName = orderData?.customer_name || "Guest Customer";
    const customerPhone = orderData?.customer_phone || "08123456789";

    const data = await createQrisPayment(customerName, customerPhone);

    if (!data.success) {
      toast.error("Gagal membuat QRIS: " + data.error);
      return;
    }

    await updateOrderWithQris(data);
  };

  // ========== Helper: Process COD Payment ==========
  const processCodPayment = async () => {
    const isValid = await validateOrderStatus(pendingOrder.orderId);
    if (!isValid) return;

    const { error } = await supabase
      .from("orders")
      .update({
        status: "processing",
        payment_method: "cod",
      })
      .eq("id", pendingOrder.orderId);

    if (error) throw error;

    setPaymentState("success");
    localStorage.removeItem("pendingOrder");
  };

  // ========== Handler: Payment ==========
  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      if (selectedMethod === "qris") {
        await processQrisPayment();
      } else if (selectedMethod === "cod") {
        await processCodPayment();
      }
    } catch (error) {
      console.error("Payment Error:", error);
      toast.error(
        selectedMethod === "qris"
          ? "Terjadi kesalahan sistem"
          : "Gagal memproses pesanan. Silakan coba lagi.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // ========== Handler: Check Status ==========
  const handleCheckStatus = async () => {
    if (!qrisData?.transaction_id || !pendingOrder.orderId) return;
    setIsProcessing(true);

    try {
      const { data: currentOrder, error: fetchError } = await supabase
        .from("orders")
        .select("status")
        .eq("id", pendingOrder.orderId)
        .single();

      if (fetchError) throw fetchError;

      if (currentOrder.status === "cancelled") {
        toast.error("Pesanan Dibatalkan", {
          description:
            "Pesanan ini sudah dibatalkan oleh Admin. Silakan hubungi kasir jika sudah terlanjur bayar.",
          duration: 5000,
        });
        setIsProcessing(false);
        return;
      }

      if (currentOrder.status === "completed") {
        toast.info("Pesanan Selesai", {
          description: "Pesanan ini sudah selesai diproses.",
        });
        setPaymentState("success");
        localStorage.removeItem("pendingOrder");
        setIsProcessing(false);
        return;
      }

      const response = await fetch(
        `/api/qris/status?transaction_id=${qrisData.transaction_id}`,
      );
      const data = await response.json();

      if (data.success && data.status === "paid") {
        const { error } = await supabase
          .from("orders")
          .update({
            status: "processing",
            payment_method: "qris",
          })
          .eq("id", pendingOrder.orderId);

        if (error) throw error;

        setPaymentState("success");
        localStorage.removeItem("pendingOrder");
        toast.success("Pembayaran Berhasil!");
      } else if (data.status === "pending") {
        toast.info("Pembayaran belum terdeteksi. Silakan coba sesaat lagi.");
      } else {
        toast.error("Status: " + (data.status || "Unknown"));
      }
    } catch (err) {
      console.error("Error check status:", err);
      toast.error("Gagal cek status.");
    } finally {
      setIsProcessing(false);
    }
  };

  // ========== Handler: Download QR ==========
  const handleDownloadQR = async () => {
    if (!qrisData?.qris_url) return;

    try {
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(qrisData.qris_url)}`;
      const response = await fetch(proxyUrl);

      if (!response.ok) throw new Error("Proxy fetch failed");

      const blob = await response.blob();
      const file = new File([blob], `qris-${pendingOrder.orderId}.png`, {
        type: blob.type,
      });

      // Fix: gunakan optional chain
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: "Simpan QRIS",
            text: "QR Code Pembayaran",
          });
          return;
        } catch (shareError) {
          // Fix: positive condition first
          if ((shareError as Error).name === "AbortError") {
            return;
          }
          console.error("Share failed", shareError);
        }
      }

      // Fix: gunakan globalThis
      const url = globalThis.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `qris-${pendingOrder.orderId || "payment"}.png`;
      document.body.appendChild(a);
      a.click();
      globalThis.URL.revokeObjectURL(url);
      a.remove(); // Fix: gunakan .remove() instead of removeChild
      toast.success("QR Code tersimpan!");
    } catch (error) {
      console.error("Download failed:", error);
      globalThis.open(qrisData.qris_url, "_blank");
      toast.info("Membuka QR Code di tab baru... (Silakan simpan manual)");
    }
  };

  // ========== Render Functions (fix nested ternary) ==========
  const renderContent = () => {
    if (paymentState === "success") {
      return <PaymentSuccess key="success" />;
    }

    if (paymentState === "qris_waiting") {
      return (
        <QrisScreen
          key="qris"
          qrisData={qrisData}
          isProcessing={isProcessing}
          onBack={() => setPaymentState("selection")}
          onDownload={handleDownloadQR}
          onCheckStatus={handleCheckStatus}
        />
      );
    }

    return (
      <motion.div
        key="selection"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-600/5 rounded-full blur-[140px] -z-10" />

        <main className="max-w-xl mx-auto px-6 pt-8">
          <PaymentHeader orderId={pendingOrder.orderId} />

          <div className="space-y-10">
            <section>
              <OrderSummaryCard pendingOrder={pendingOrder} />
            </section>

            <section className="space-y-6">
              <div className="px-2">
                <h2 className="text-xl font-black tracking-tighter uppercase italic text-white leading-none">
                  Payment <span className="text-amber-500">Method</span>
                </h2>
                <p className="text-stone-600 text-[10px] font-bold uppercase tracking-widest mt-2">
                  Choose your preferred payment method.
                </p>
              </div>
              <PaymentMethodList
                selected={selectedMethod}
                onSelect={setSelectedMethod}
              />
            </section>

            <div className="pt-6 px-1">
              <button
                onClick={handlePayment}
                disabled={isProcessing || !selectedMethod}
                className="w-full bg-amber-500 text-stone-950 py-5 rounded-[1.5rem] shadow-[0_16px_32px_-8px_rgba(245,158,11,0.4)] hover:bg-amber-400 active:scale-[0.98] active:shadow-none transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed font-black text-xs uppercase tracking-[0.3em] cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" strokeWidth={3} />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {selectedMethod === "cod"
                        ? "Confirm Order"
                        : "Pay Securely Now"}
                    </span>
                    <ChevronRight size={20} strokeWidth={3} />
                  </>
                )}
              </button>
            </div>

            <PaymentFooter />
          </div>
        </main>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-stone-950 relative overflow-x-hidden font-sans text-white pb-32">
      <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
    </div>
  );
}
