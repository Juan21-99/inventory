"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Order, OrderItem } from "../../types";
import { getStatusInfo } from "../../utils/status";
import { Share2 } from "lucide-react";
import { toast } from "sonner";

interface OrdersTabProps {
  readonly myOrders: Order[];
  readonly setActiveTab: (tab: "menu" | "status" | "profile") => void;
}

// Helper: Get status badge class
function getStatusBadgeClass(status: string) {
  if (status === "completed") {
    return "bg-green-100 text-green-700";
  }
  if (status === "cancelled") {
    return "bg-red-100 text-red-700";
  }
  if (status === "processing") {
    return "bg-amber-100 text-amber-700";
  }
  return "bg-blue-100 text-blue-700";
}

// Helper for Legacy Copy
function fallbackCopyTextToClipboard(text: string) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand("copy");
    if (successful) {
      toast.success("Teks disalin!", {
        description: "Silakan tempel di WhatsApp/Instagram Anda.",
        duration: 3000,
      });
    } else {
      toast.error("Gagal membagikan", {
        description: "Silakan screenshot pesanan Anda!",
      });
    }
  } catch (err) {
    console.error("Fallback: Oops, unable to copy", err);
    toast.error("Gagal membagikan", {
      description: "Silakan screenshot pesanan Anda!",
    });
  }

  textArea.remove();
}

export default function OrdersTab({ myOrders, setActiveTab }: OrdersTabProps) {
  const router = useRouter();

  const handleResumePayment = async (order: Order) => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("status")
        .eq("id", order.id)
        .single();

      if (error) throw error;

      if (data.status === "cancelled") {
        toast.error("Pesanan Terlanjur Dibatalkan", {
          description: "Maaf, admin sudah membatalkan pesanan ini.",
        });
        return;
      }

      const pendingOrder = {
        orderId: order.id,
        items: order.items,
        total: order.total_amount,
        orderType: order.order_type,
        address: order.address || "",
      };

      localStorage.setItem("pendingOrder", JSON.stringify(pendingOrder));
      router.push("/payment");
    } catch (err) {
      console.error("Error resuming payment:", err);
      toast.error("Gagal melanjutkan pembayaran.");
    }
  };

  const handleShare = (order: Order) => {
    const itemsList = order.items
      .map((i) => `${i.quantity}x ${i.name}`)
      .join(", ");
    const text = `Halo! Saya baru saja pesan ${itemsList} di ALIN COFFEE! Enak banget lho! ☕✨`;

    if (navigator.share) {
      navigator
        .share({
          title: "Pesanan ALIN COFFEE",
          text: text,
          url: globalThis.location.origin,
        })
        .catch((err) => {
          console.error("Share failed:", err);
        });
    } else if (navigator.clipboard) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          toast.success("Teks disalin!", {
            description: "Silakan tempel di WhatsApp/Instagram Anda.",
            duration: 3000,
          });
        })
        .catch((err) => {
          console.error("Clipboard failed", err);
          fallbackCopyTextToClipboard(text);
        });
    } else {
      fallbackCopyTextToClipboard(text);
    }
  };

  return (
    <div className="pt-24 px-4 animate-in fade-in duration-300 pb-32">
      <h2 className="text-2xl font-black mb-6 px-1 tracking-tighter uppercase">
        Pesanan Saya
      </h2>

      {myOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="w-20 h-20 bg-stone-900/50 rounded-full flex items-center justify-center mb-6 text-stone-700 border border-white/5 shadow-2xl shadow-black/20">
            <span className="text-xl font-black tracking-tighter select-none">
              ALIN.<span className="text-amber-800/60">CO</span>
            </span>
          </div>
          <h3 className="text-stone-300 font-bold text-lg mb-2">
            Belum Ada Pesanan
          </h3>
          <p className="text-stone-500 text-sm max-w-[280px] leading-relaxed mb-8">
            Yuk pesan kopi favoritmu sekarang dan rasakan kenikmatannya!
          </p>
          <button
            onClick={() => setActiveTab("menu")}
            className="bg-amber-500 text-stone-950 px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-amber-500/10 active:scale-95 transition-all"
          >
            Pesan Sekarang
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {myOrders.map((order) => {
            const statusInfo = getStatusInfo(order.status, order.order_type);
            const StatusIcon = statusInfo.icon;
            const statusBadgeClass = getStatusBadgeClass(order.status);

            return (
              <div
                key={order.id}
                className="relative bg-stone-900 border border-white/5 shadow-2xl shadow-black/50 active:-translate-y-1 transition-all duration-300 rounded-px"
              >
                {/* Zigzag top edge */}
                <div className="absolute top-0 left-0 right-0 h-3 bg-[linear-gradient(135deg,transparent_33.33%,#1c1917_33.33%,#1c1917_66.66%,transparent_66.66%),linear-gradient(225deg,transparent_33.33%,#1c1917_33.33%,#1c1917_66.66%,transparent_66.66%)] bg-[length:12px_100%] -translate-y-full" />

                <div className="p-6">
                  {/* Header: Store name */}
                  <div className="text-center mb-4 pb-3 border-b-2 border-dashed border-stone-800">
                    <h3 className="font-black text-xl tracking-tighter text-white">
                      ALIN.<span className="text-amber-400">CO</span>
                    </h3>
                    <p className="text-[10px] text-stone-400 mt-1">
                      Jl. Jamin Ginting, Medan
                    </p>
                  </div>

                  {/* Order info */}
                  <div className="flex justify-between items-center mb-3 text-xs">
                    <span className="font-mono text-stone-500">
                      #{order.id.slice(0, 6)}
                    </span>
                    {order.created_at && (
                      <span className="text-stone-400">
                        {new Date(order.created_at).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </span>
                    )}
                  </div>

                  <div className="border-t border-dashed border-stone-300 my-3" />

                  {/* Items */}
                  <div className="space-y-2 mb-3">
                    {order.items.map((item: OrderItem) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-sm font-mono"
                      >
                        <span className="text-stone-700">
                          {item.quantity}x {item.name}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-dashed border-stone-300 my-3" />

                  {/* Total */}
                  <div className="flex justify-between items-center font-mono">
                    <span className="text-stone-500 text-sm">TOTAL</span>
                    <span className="text-white text-sm font-black">
                      Rp {order.total_amount.toLocaleString("id-ID")}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="mt-4 pt-3 border-t border-dashed border-stone-300 text-center">
                    <div
                      className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold ${statusBadgeClass}`}
                    >
                      <StatusIcon size={14} />
                      {statusInfo.label}
                    </div>

                    {/* Payment Method Badge */}
                    {order.payment_method &&
                      ["processing", "ready", "completed"].includes(
                        order.status,
                      ) && (
                        <div className="flex items-center justify-center gap-2 mt-3">
                          <span className="text-[10px] text-stone-600 font-bold uppercase tracking-widest">
                            Metode:
                          </span>
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded border ${
                              order.payment_method === "qris"
                                ? "bg-purple-500/10 text-purple-600 border-purple-500/20"
                                : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            }`}
                          >
                            {order.payment_method === "qris" ? "QRIS" : "TUNAI"}
                          </span>
                        </div>
                      )}
                  </div>

                  {/* Resume Payment Action */}
                  {order.status === "new" && (
                    <div className="mt-4 px-2 pb-2">
                      <button
                        onClick={() => handleResumePayment(order)}
                        className="w-full bg-amber-500 text-stone-950 py-3 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        Lanjut Bayar &rarr;
                      </button>
                    </div>
                  )}

                  {/* Share Action for Completed Orders */}
                  {order.status === "completed" && (
                    <div className="mt-4 px-2 pb-2">
                      <button
                        onClick={() => handleShare(order)}
                        className="w-full bg-stone-800 text-stone-300 py-3 rounded-xl font-black text-xs uppercase tracking-[0.2em] border border-white/5 active:bg-stone-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <Share2 size={14} />
                        Bagikan
                      </button>
                    </div>
                  )}
                </div>

                {/* Zigzag bottom edge */}
                <div className="absolute bottom-0 left-0 right-0 h-3 bg-[linear-gradient(45deg,transparent_33.33%,#1c1917_33.33%,#1c1917_66.66%,transparent_66.66%),linear-gradient(-45deg,transparent_33.33%,#1c1917_33.33%,#1c1917_66.66%,transparent_66.66%)] bg-[length:12px_100%] translate-y-full" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
