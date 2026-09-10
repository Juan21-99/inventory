import { Store } from "lucide-react";

export const OrderEmptyState = () => (
  <div className="flex flex-col items-center justify-center py-20 bg-stone-900/40 rounded-[2.5rem] border border-dashed border-white/5 mx-auto max-w-2xl w-full">
    <div className="w-16 h-16 bg-stone-900 rounded-[1.5rem] flex items-center justify-center mb-6 border border-white/5 shadow-[0_0_30px_-10px_rgba(245,158,11,0.3)]">
      <Store className="text-amber-500" size={32} strokeWidth={1.5} />
    </div>
    <p className="text-white font-black uppercase tracking-widest text-sm mb-1">
      Belum ada pesanan
    </p>
    <p className="text-stone-500 text-xs font-bold">
      Pesanan pickup akan muncul di sini
    </p>
  </div>
);
