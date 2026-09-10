"use client";

import { Edit, Trash2, Power, Sparkles } from "lucide-react";
import Image from "next/image";
import { Promo } from "../types/promo.types";

interface PromoCardProps {
  promo: Promo;
  onEdit: (promo: Promo) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
}

export const PromoCard = ({
  promo,
  onEdit,
  onDelete,
  onToggleStatus,
}: PromoCardProps) => {
  const isInactive = !promo.is_active;

  return (
    <div
      className={`relative group overflow-hidden rounded-[2.5rem] border transition-all duration-500 hover:-translate-y-1 ${
        isInactive
          ? "border-stone-800 opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
          : "border-white/5 hover:border-amber-500/20 hover:shadow-[0_20px_40px_-12px_rgba(245,158,11,0.1)]"
      }`}
    >
      {/* Visual Preview */}
      <div
        className={`aspect-[16/8] bg-gradient-to-br ${promo.color_gradient} p-7 relative overflow-hidden`}
      >
        {/* Background Image */}
        {promo.image_url && (
          <div className="absolute inset-0 z-0">
            <Image
              src={promo.image_url}
              alt={promo.title}
              fill
              className="object-cover opacity-40 mix-blend-overlay"
            />
          </div>
        )}

        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-[60px]" />

        {/* Connection Line */}
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent z-10" />

        <div className="relative z-10 h-full flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-3">
              <div className="w-11 h-11 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white shadow-lg border border-white/10">
                <Sparkles size={22} strokeWidth={2.5} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-black/20 backdrop-blur-xl px-3 py-1.5 rounded-xl text-white/90 border border-white/5 shadow-lg">
                {promo.badge}
              </span>
            </div>
            <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic leading-none mb-2 drop-shadow-sm">
              {promo.title}
            </h3>
            <p className="text-[11px] font-bold text-white/80 max-w-[240px] leading-relaxed line-clamp-2 uppercase tracking-wide">
              {promo.description}
            </p>
          </div>
        </div>

        {/* Status Overlay */}
        {isInactive && (
          <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-[2px] flex items-center justify-center z-20 transition-opacity duration-300">
            <span className="px-5 py-2 bg-stone-900/90 text-stone-500 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 backdrop-blur-md shadow-2xl">
              Nonaktif
            </span>
          </div>
        )}
      </div>

      {/* Admin Actions */}
      <div className="bg-stone-950/80 backdrop-blur-md p-5 flex items-center gap-3 border-t border-white/5">
        <button
          onClick={() => onToggleStatus(promo.id, promo.is_active)}
          className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all cursor-pointer border shadow-lg active:scale-95 group/btn ${
            promo.is_active
              ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10 hover:border-emerald-500/30"
              : "bg-stone-800/50 border-stone-700/50 text-stone-500 hover:text-white hover:bg-stone-800 hover:border-stone-600"
          }`}
        >
          <Power
            size={14}
            className={
              promo.is_active ? "shadow-emerald-500/50 drop-shadow-md" : ""
            }
            strokeWidth={3}
          />
          {promo.is_active ? "Aktif" : "Nonaktif"}
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(promo)}
            className="w-11 h-11 flex items-center justify-center bg-stone-900 text-stone-400 hover:text-amber-500 hover:bg-amber-500/10 rounded-2xl border border-white/5 transition-all cursor-pointer hover:border-amber-500/20 active:scale-95"
          >
            <Edit size={16} strokeWidth={2.5} />
          </button>

          <button
            onClick={() => onDelete(promo.id)}
            className="w-11 h-11 flex items-center justify-center bg-stone-900 text-stone-400 hover:text-red-500 hover:bg-red-500/10 rounded-2xl border border-white/5 transition-all cursor-pointer hover:border-red-500/20 active:scale-95"
          >
            <Trash2 size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};
