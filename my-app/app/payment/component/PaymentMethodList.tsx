"use client";

import { CheckCircle2, QrCode, Banknote } from "lucide-react";
import { motion } from "framer-motion";

export type PaymentMethodId = "qris" | "cod";

interface PaymentMethodListProps {
  readonly selected: PaymentMethodId;
  readonly onSelect: (id: PaymentMethodId) => void;
}

const PAYMENT_METHODS = [
  {
    id: "qris" as const,
    name: "QRIS Official",
    icon: QrCode,
    subtitle: "e-Wallet & Banking Apps",
  },
  {
    id: "cod" as const,
    name: "Cash Official",
    icon: Banknote,
    subtitle: "Pay at counter / COD",
  },
] as const;

export function PaymentMethodList({
  selected,
  onSelect,
}: PaymentMethodListProps) {
  return (
    <div className="space-y-4">
      {PAYMENT_METHODS.map((method) => {
        const isSelected = selected === method.id;
        const Icon = method.icon;

        return (
          <button
            key={method.id}
            onClick={() => onSelect(method.id)}
            className={`
              relative p-6 rounded-[2rem] border transition-all duration-500 outline-none flex items-center justify-between cursor-pointer group overflow-hidden
              ${
                isSelected
                  ? "border-amber-500 bg-amber-500/5 shadow-2xl shadow-amber-500/10"
                  : "border-white/5 bg-stone-900/40 hover:bg-stone-900/60 hover:border-white/20"
              }
            `}
          >
            {isSelected && (
              <motion.div
                layoutId="selection-glow"
                className="absolute inset-0 bg-gradient-to-r from-amber-500/[0.05] via-transparent to-transparent pointer-events-none"
              />
            )}

            <div className="flex items-center gap-6 relative z-10">
              <div
                className={`
                  w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl
                  ${
                    isSelected
                      ? "bg-amber-500 text-stone-950 scale-110 rotate-6"
                      : "bg-stone-800 text-stone-600 group-hover:bg-stone-700 group-hover:text-stone-400"
                  }
                `}
              >
                <Icon size={32} strokeWidth={2.5} />
              </div>

              <div className="text-left">
                <div
                  className={`font-black tracking-tight text-xl uppercase italic ${
                    isSelected ? "text-white" : "text-stone-400"
                  }`}
                >
                  {method.name}
                </div>
                <div className="text-[10px] text-stone-600 mt-1 font-bold uppercase tracking-[0.15em] group-hover:text-stone-500 transition-colors">
                  {method.subtitle}
                </div>
              </div>
            </div>

            <div
              className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-500 relative z-10 ${
                isSelected
                  ? "border-amber-500 bg-amber-500 shadow-lg shadow-amber-500/30 scale-110"
                  : "border-stone-800 group-hover:border-stone-700"
              }`}
            >
              {isSelected && (
                <CheckCircle2
                  size={16}
                  className="text-stone-950"
                  strokeWidth={4}
                />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
