import { XCircle, RefreshCw } from "lucide-react";

interface OrderErrorStateProps {
  error: string;
  onRetry: () => void;
}

export const OrderErrorState = ({ error, onRetry }: OrderErrorStateProps) => (
  <div className="bg-red-500/5 border border-red-500/10 rounded-[2rem] p-12 text-center flex flex-col items-center">
    <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20 shadow-[0_0_30px_-10px_rgba(239,68,68,0.3)]">
      <XCircle className="text-red-500" size={32} />
    </div>
    <h2 className="text-xl font-black text-white uppercase tracking-widest mb-3">
      Gagal Memuat Data
    </h2>
    <p className="text-stone-400 mb-8 max-w-md mx-auto font-medium leading-relaxed">
      {error || "Terjadi kesalahan saat menghubungi server."}
    </p>
    <button
      type="button"
      onClick={onRetry}
      className="bg-stone-900 hover:bg-stone-800 text-white px-8 py-3 rounded-xl transition-all cursor-pointer font-bold border border-white/5 flex items-center gap-2 group active:scale-95"
    >
      <RefreshCw
        size={18}
        className="group-hover:rotate-180 transition-transform duration-500"
      />
      Coba Lagi
    </button>
  </div>
);
