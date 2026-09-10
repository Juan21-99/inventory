"use client";

import React from "react";
import Image from "next/image";
import {
  Boxes,
  Building2,
  User,
  Calendar,
  Edit,
  Trash2,
  Eye,
  ShieldCheck,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { InventoryItem, ItemCondition } from "../../types/item.types";

interface ItemCardProps {
  item: InventoryItem;
  onEdit: (item: InventoryItem) => void;
  onDetail: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
}

export const getConditionBadge = (condition: ItemCondition) => {
  switch (condition) {
    case "Baik":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:border-emerald-500/30 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-sm">
          <ShieldCheck size={12} className="text-emerald-600 dark:text-emerald-400" />
          Kondisi Baik
        </span>
      );
    case "Rusak Ringan":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/15 dark:border-amber-500/30 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-sm">
          <AlertTriangle size={12} className="text-amber-600 dark:text-amber-400" />
          Rusak Ringan
        </span>
      );
    case "Rusak Berat":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 dark:bg-red-500/15 dark:border-red-500/30 dark:text-red-400 text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-sm">
          <XCircle size={12} className="text-rose-600 dark:text-red-400" />
          Rusak Berat
        </span>
      );
    default:
      return null;
  }
};

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onEdit,
  onDetail,
  onDelete,
}) => {
  const isLowStock = item.stock <= 2;

  return (
    <div className="group relative overflow-hidden rounded-[2rem] border border-stone-200/80 dark:border-white/5 bg-white dark:bg-stone-900/40 hover:bg-stone-50/50 dark:hover:bg-stone-900/80 hover:border-amber-500/40 shadow-sm dark:shadow-none hover:shadow-md dark:hover:shadow-[0_20px_40px_-12px_rgba(245,158,11,0.12)] transition-all duration-300 flex flex-col justify-between">
      {/* Top Media / Thumbnail Section */}
      <div className="aspect-[16/10] relative p-3">
        <div className="absolute inset-0 bg-gradient-to-br from-stone-500/[0.04] dark:from-white/[0.04] to-transparent pointer-events-none" />
        <div className="w-full h-full relative rounded-[1.5rem] overflow-hidden bg-stone-100 dark:bg-stone-950/60 border border-stone-200/60 dark:border-white/5 flex items-center justify-center">
          {item.image_url && item.image_url.trim() !== "" ? (
            <Image
              src={item.image_url}
              alt={item.name}
              fill
              unoptimized
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-stone-400 dark:text-stone-700 group-hover:text-amber-500/60 transition-colors">
              <Boxes size={42} strokeWidth={1.5} />
              <span className="text-[10px] font-black uppercase tracking-widest text-stone-500 dark:text-stone-600 mt-2">
                INVENTARIS INSPEKTORAT
              </span>
            </div>
          )}

          {/* Condition Badge (Top Left) */}
          <div className="absolute top-3 left-3 z-10">
            {getConditionBadge(item.condition)}
          </div>

          {/* Stock Badge (Top Right) */}
          <div className="absolute top-3 right-3 z-10">
            <span
              className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm border backdrop-blur-md ${
                isLowStock
                  ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30"
                  : "bg-white/95 text-stone-800 border-stone-200/80 dark:bg-black/60 dark:text-white/90 dark:border-white/10"
              }`}
            >
              Stok: {item.stock} {item.unit}
            </span>
          </div>

          {/* Code Badge (Bottom Left) */}
          <div className="absolute bottom-2.5 left-3 z-10">
            <span className="px-2.5 py-1 rounded-lg bg-white/95 dark:bg-stone-950/90 border border-stone-200 dark:border-white/10 text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400 shadow-sm">
              {item.code}
            </span>
          </div>
        </div>
      </div>

      {/* Body Info Section */}
      <div className="p-5 pt-2 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Category Tag */}
          <span className="text-[9px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-[0.2em] mb-1 block">
            {item.category}
          </span>

          {/* Item Name */}
          <h3
            onClick={() => onDetail(item)}
            className="text-base font-bold text-stone-900 dark:text-white tracking-tight leading-snug line-clamp-2 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
            title={item.name}
          >
            {item.name}
          </h3>

          {/* Location & PIC Details */}
          <div className="mt-3 space-y-1.5 text-xs text-stone-600 dark:text-stone-400">
            <div className="flex items-center gap-2 truncate" title={item.location}>
              <Building2 size={13} className="text-stone-400 dark:text-stone-500 shrink-0" />
              <span className="truncate">{item.location}</span>
            </div>
            <div className="flex items-center gap-2 truncate" title={item.person_in_charge}>
              <User size={13} className="text-stone-400 dark:text-stone-500 shrink-0" />
              <span className="truncate font-medium text-stone-800 dark:text-stone-300">
                PJ: {item.person_in_charge}
              </span>
            </div>
            {item.received_at && (
              <div className="flex items-center gap-2 text-[11px] text-stone-500">
                <Calendar size={12} className="shrink-0" />
                <span>Masuk: {item.received_at}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="pt-3 border-t border-stone-100 dark:border-white/5 flex items-center justify-between gap-2 mt-auto">
          {/* View Detail Action */}
          <button
            type="button"
            onClick={() => onDetail(item)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-stone-50 hover:bg-stone-100 dark:bg-stone-950/70 dark:hover:bg-stone-800 text-stone-700 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white border border-stone-200/80 dark:border-white/5 hover:border-stone-300 dark:hover:border-white/15 transition-all cursor-pointer shadow-sm"
          >
            <Eye size={14} className="text-amber-500" />
            <span>Detail Aset</span>
          </button>

          {/* Edit & Delete Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onEdit(item)}
              className="w-9 h-9 flex items-center justify-center bg-stone-50 dark:bg-stone-950/70 text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-xl border border-stone-200/80 dark:border-white/5 hover:border-amber-200 dark:hover:border-amber-500/20 transition-all cursor-pointer shadow-sm"
              title="Edit Data Barang"
            >
              <Edit size={14} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(item)}
              className="w-9 h-9 flex items-center justify-center bg-stone-50 dark:bg-stone-950/70 text-stone-600 dark:text-stone-400 hover:text-rose-600 dark:hover:text-red-400 hover:bg-rose-50 dark:hover:bg-red-500/10 rounded-xl border border-stone-200/80 dark:border-white/5 hover:border-rose-200 dark:hover:border-red-500/20 transition-all cursor-pointer shadow-sm"
              title="Hapus Barang"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
