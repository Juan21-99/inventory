"use client";

import { Sparkles } from "lucide-react";
import { PromoCard } from "./PromoCard";
import { PromoSkeleton } from "./PromoSkeleton";
import { Promo } from "../types/promo.types";

interface PromoGridProps {
  promos: Promo[];
  loading: boolean;
  onEdit: (promo: Promo) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
}

export const PromoGrid = ({
  promos,
  loading,
  onEdit,
  onDelete,
  onToggleStatus,
}: PromoGridProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[1, 2, 3, 4].map((i) => (
          <PromoSkeleton key={`skeleton-${i}`} />
        ))}
      </div>
    );
  }

  if (promos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-stone-900/40 rounded-[2.5rem] border border-dashed border-white/5 mx-auto max-w-2xl w-full">
        <div className="w-16 h-16 bg-stone-900 rounded-[1.5rem] flex items-center justify-center mb-6 border border-white/5 shadow-[0_0_30px_-10px_rgba(245,158,11,0.3)]">
          <Sparkles className="text-amber-500" size={32} strokeWidth={1.5} />
        </div>
        <p className="text-white font-black uppercase tracking-widest text-sm mb-1">
          Belum Ada Promo
        </p>
        <p className="text-stone-500 text-xs font-bold text-center px-4 max-w-xs">
          Buat banner promo pertamamu untuk menarik pelanggan.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {promos.map((promo) => (
        <PromoCard
          key={promo.id}
          promo={promo}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
        />
      ))}
    </div>
  );
};
