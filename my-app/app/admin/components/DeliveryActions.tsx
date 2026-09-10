import { CheckCircle, Truck, Loader2 } from "lucide-react";
import { OrderStatus } from "../types/delivery.types";

interface DeliveryActionsProps {
  orderId: string;
  status: OrderStatus;
  paymentMethod?: string;
  total_amount: number;
  isUpdating: boolean;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onCancel: (orderId: string) => void;
}

export const DeliveryActions = ({
  orderId,
  status,
  paymentMethod,
  total_amount,
  isUpdating,
  onUpdateStatus,
  onCancel,
}: DeliveryActionsProps) => {
  return (
    <div className="flex flex-col md:flex-row items-end md:items-center justify-between pt-4 border-t border-white/5 mt-4 gap-4">
      <div className="flex flex-col items-end md:items-start">
        <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest">
          Total Pesanan
        </span>
        <div className="text-amber-500 font-black text-lg tracking-tight">
          Rp {total_amount.toLocaleString("id-ID")}
        </div>
      </div>

      {status === "new" && (
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          {paymentMethod === "cod" ? (
            <button
              type="button"
              onClick={() => onUpdateStatus(orderId, "processing")}
              disabled={isUpdating}
              className="flex-1 md:flex-none bg-stone-900 text-white px-5 py-2.5 rounded-xl text-[10px] uppercase tracking-widest font-black hover:bg-stone-800 transition-all border border-white/10 shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              aria-label="Proses pesanan"
            >
              {isUpdating && <Loader2 size={14} className="animate-spin" />}
              Terima & Proses (COD)
            </button>
          ) : (
            <div className="bg-amber-500/10 text-amber-500 px-5 py-2.5 rounded-xl text-[10px] uppercase tracking-widest font-black border border-amber-500/20 cursor-not-allowed opacity-70 flex items-center justify-center">
              Menunggu Pembayaran...
            </div>
          )}

          <button
            type="button"
            onClick={() => onCancel(orderId)}
            disabled={isUpdating}
            className="flex-1 md:flex-none bg-transparent border-2 border-red-500/30 text-red-500 px-5 py-2.5 rounded-xl text-[10px] uppercase tracking-widest font-black hover:bg-red-500 hover:text-white hover:border-red-500 transition-all cursor-pointer disabled:opacity-50"
            aria-label="Batalkan pesanan"
          >
            Tolak
          </button>
        </div>
      )}

      {status === "processing" && (
        <button
          type="button"
          onClick={() => onUpdateStatus(orderId, "ready")}
          disabled={isUpdating}
          className="w-full md:w-auto flex items-center justify-center gap-3 bg-amber-500 text-stone-900 px-6 py-3 rounded-xl text-[10px] uppercase tracking-widest font-black hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer disabled:opacity-50"
          aria-label="Mulai antar pesanan"
        >
          {isUpdating ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Truck size={16} strokeWidth={2.5} />
          )}
          Mulai Antar
        </button>
      )}

      {status === "ready" && (
        <button
          type="button"
          onClick={() => onUpdateStatus(orderId, "completed")}
          disabled={isUpdating}
          className="w-full md:w-auto flex items-center justify-center gap-3 bg-emerald-500 text-emerald-950 px-6 py-3 rounded-xl text-[10px] uppercase tracking-widest font-black hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer disabled:opacity-50"
          aria-label="Tandai pesanan selesai"
        >
          {isUpdating ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <CheckCircle size={16} strokeWidth={2.5} />
          )}
          Selesai
        </button>
      )}
    </div>
  );
};
