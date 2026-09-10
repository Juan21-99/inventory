import { CheckCircle, Loader2, Store } from "lucide-react";
import { OrderStatus } from "../types/order.types";

interface OrderStatusActionsProps {
  orderId: string;
  status: OrderStatus;
  paymentMethod?: string;
  isUpdating: boolean;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
  onCancel: (orderId: string) => void;
}

export const OrderStatusActions = ({
  orderId,
  status,
  paymentMethod,
  isUpdating,
  onUpdateStatus,
  onCancel,
}: OrderStatusActionsProps) => {
  const handleClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  if (status === "new") {
    // Jika New + COD = Boleh Proses (Karena bayar nanti)
    // Jika New + QRIS = Tahan (Harus bayar dulu, nanti sistem otomatis ubah ke Process/Ready)
    if (paymentMethod === "cod") {
      return (
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={(e) =>
              handleClick(e, () => onUpdateStatus(orderId, "processing"))
            }
            disabled={isUpdating}
            className="w-full bg-stone-900 text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-stone-800 shadow-[0_8px_16px_-4px_rgba(0,0,0,0.3)] hover:shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
          >
            {isUpdating ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <CheckCircle size={16} strokeWidth={2.5} />
            )}
            Terima & Proses (COD)
          </button>
          <button
            type="button"
            onClick={(e) => handleClick(e, () => onCancel(orderId))}
            disabled={isUpdating}
            className="w-full bg-transparent border-2 border-red-500/30 text-red-500 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white hover:border-red-500 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            Tolak Pesanan
          </button>
        </div>
      );
    } else {
      // QRIS / Transfer -> Tahan tombol proses
      return (
        <div className="flex flex-col gap-3">
          <div className="w-full bg-amber-500/10 text-amber-500 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center border border-amber-500/20 cursor-not-allowed opacity-70">
            Menunggu Pembayaran Customer...
          </div>
          <button
            type="button"
            onClick={(e) => handleClick(e, () => onCancel(orderId))}
            disabled={isUpdating}
            className="w-full bg-transparent border-2 border-red-500/30 text-red-500 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white hover:border-red-500 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            Batalkan (Stok Balik)
          </button>
        </div>
      );
    }
  }

  if (status === "processing") {
    return (
      <button
        type="button"
        onClick={(e) => handleClick(e, () => onUpdateStatus(orderId, "ready"))}
        disabled={isUpdating}
        className="w-full bg-amber-500 text-stone-900 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-amber-400 shadow-[0_8px_16px_-4px_rgba(245,158,11,0.3)] hover:shadow-amber-500/20 hover:shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
      >
        {isUpdating ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <CheckCircle size={16} strokeWidth={2.5} />
        )}
        Pesanan Siap (Panggil)
      </button>
    );
  }

  if (status === "ready") {
    return (
      <button
        type="button"
        onClick={(e) =>
          handleClick(e, () => onUpdateStatus(orderId, "completed"))
        }
        disabled={isUpdating}
        className="w-full bg-emerald-500 text-emerald-950 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-400 shadow-[0_8px_16px_-4px_rgba(16,185,129,0.3)] hover:shadow-emerald-500/20 hover:shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
      >
        {isUpdating ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Store size={16} strokeWidth={2.5} />
        )}
        Selesai (Sudah Diambil)
      </button>
    );
  }

  return null;
};
