"use client";

import { ShoppingBag, ShieldCheck } from "lucide-react";

interface PaymentHeaderProps {
  readonly orderId: string;
}

export function PaymentHeader({ orderId }: PaymentHeaderProps) {
  return (
    <header className="flex items-center justify-between mb-10">
      <div className="flex items-center gap-3.5 group">
        <div className="w-12 h-12 bg-amber-500 rounded-[1.2rem] flex items-center justify-center text-stone-950 shadow-2xl shadow-amber-500/30 group-hover:rotate-12 transition-all duration-500">
          <ShoppingBag size={24} strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tighter leading-none italic uppercase">
            Finish <span className="text-amber-500">Order</span>
          </h1>
          <span className="text-[10px] font-black text-stone-600 uppercase tracking-[0.3em] block mt-1">
            Checkout Securely
          </span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1">
        <div className="w-10 h-10 rounded-2xl bg-stone-900/50 backdrop-blur-md border border-white/5 flex items-center justify-center text-stone-500 animate-pulse">
          <ShieldCheck size={20} />
        </div>
        {orderId && (
          <span className="text-[8px] font-black text-stone-700 uppercase tracking-widest">
            #{orderId.slice(-5).toUpperCase()}
          </span>
        )}
      </div>
    </header>
  );
}
