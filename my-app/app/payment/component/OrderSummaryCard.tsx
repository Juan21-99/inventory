"use client";

import { MapPin, Map } from "lucide-react";
import { OrderItem } from "./OrderItem";
import type { PendingOrder } from "../types/types";

interface OrderSummaryCardProps {
  readonly pendingOrder: PendingOrder; 
}

export function OrderSummaryCard({ pendingOrder }: OrderSummaryCardProps) {
  const orderTotal = pendingOrder.total;
  const finalTotal = orderTotal;

  return (
    <div className="bg-stone-900/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/5 overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)]">
      {/* Header */}
      <div className="p-8 border-b border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
        <div className="flex justify-between items-center mb-1.5">
          <h3 className="text-sm font-black text-stone-300 tracking-[0.2em] uppercase italic">
            Order Summary
          </h3>
          <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest px-2 py-0.5 bg-amber-500/10 rounded-lg">
            #{pendingOrder.orderId.slice(-5).toUpperCase()}
          </span>
        </div>
        <p className="text-stone-500 text-[10px] font-bold uppercase tracking-widest">
          Check your items carefully.
        </p>
      </div>

      {/* Items List */}
      <div className="p-8 space-y-6">
        <div className="space-y-5">
          {pendingOrder.items.map((item) => {
            const itemKey = `${item.name}-${item.quantity}-${item.price}`;
            const noteText = item.note ? `• ${item.note}` : "";
            const detailText = `${item.quantity}x ${noteText}`;

            return (
              <OrderItem
                key={itemKey}
                name={item.name}
                detail={detailText}
                price={item.price * item.quantity}
              />
            );
          })}
        </div>

        {/* Location & Method Badge */}
        <div className="mt-10 p-6 bg-stone-950/60 rounded-[2rem] border border-white/5 relative group hover:border-amber-500/20 transition-all overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-15 transition-all">
            <MapPin size={64} className="text-amber-500" />
          </div>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-stone-950 shrink-0 shadow-lg shadow-amber-500/20">
              <Map size={24} strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black text-amber-500 uppercase tracking-[0.3em]">
                  Shipping Details
                </span>
                <div className="px-2.5 py-1 rounded-lg bg-stone-900 text-stone-400 text-[8px] font-black uppercase tracking-widest border border-white/5">
                  {pendingOrder.orderType}
                </div>
              </div>
              <h4 className="text-base font-black text-white italic tracking-tight mb-1 uppercase">
                {pendingOrder.orderType === "delivery"
                  ? "Shipping Address"
                  : "Pickup Point"}
              </h4>
              <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest leading-relaxed line-clamp-2">
                {pendingOrder.address}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-dashed border-stone-800 my-8" />

        {/* Subtotal */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em]">
              Subtotal
            </span>
            <span className="text-sm font-black text-white tracking-tight">
              Rp {orderTotal.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between items-end pt-6 border-t border-white/10 mt-4">
          <div>
            <span className="text-stone-500 font-black text-[10px] uppercase tracking-[0.3em] block mb-2">
              Total Payment
            </span>
            <span className="text-3xl font-black text-amber-500 tracking-tighter italic">
              Rp {finalTotal.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-stone-900 border border-white/5 text-[10px] font-black uppercase tracking-widest text-stone-400">
            {pendingOrder.items.length} Items
          </div>
        </div>
      </div>
    </div>
  );
}
