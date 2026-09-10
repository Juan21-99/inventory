"use client";

import React from "react";
import {
  Edit,
  Trash2,
  Eye,
  Building2,
  User,
  ShieldCheck,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { InventoryItem } from "../../types/item.types";

interface ItemTableProps {
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onDetail: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
}

export const ItemTable: React.FC<ItemTableProps> = ({
  items,
  onEdit,
  onDetail,
  onDelete,
}) => {
  return (
    <div className="bg-white dark:bg-stone-900/60 backdrop-blur-md rounded-[2rem] border border-stone-200/80 dark:border-white/5 shadow-sm dark:shadow-2xl overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-stone-300 dark:scrollbar-thumb-stone-800">
        <table className="w-full text-left text-xs sm:text-sm text-stone-700 dark:text-stone-300">
          <thead className="bg-stone-50/90 dark:bg-stone-950/80 text-[10px] sm:text-xs font-black uppercase tracking-widest text-stone-500 border-b border-stone-200/80 dark:border-white/5">
            <tr>
              <th className="px-5 py-4">Kode Barang</th>
              <th className="px-5 py-4">Nama Barang & Aset</th>
              <th className="px-5 py-4">Kategori</th>
              <th className="px-5 py-4">Stok</th>
              <th className="px-5 py-4">Kondisi</th>
              <th className="px-5 py-4">Lokasi Ruangan</th>
              <th className="px-5 py-4">Penanggung Jawab</th>
              <th className="px-5 py-4">Tgl Masuk</th>
              <th className="px-5 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-white/5">
            {items.map((item) => {
              const isLow = item.stock <= 2;
              return (
                <tr
                  key={item.id}
                  className="hover:bg-stone-50/70 dark:hover:bg-white/[0.02] transition-colors group"
                >
                  {/* Code */}
                  <td className="px-5 py-4 font-mono font-bold text-amber-700 dark:text-amber-400 whitespace-nowrap">
                    {item.code}
                  </td>

                  {/* Name */}
                  <td className="px-5 py-4 font-bold text-stone-900 dark:text-white min-w-[200px]">
                    <span
                      onClick={() => onDetail(item)}
                      className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer block line-clamp-1"
                      title={item.name}
                    >
                      {item.name}
                    </span>
                  </td>

                  {/* Category */}
                  <td className="px-5 py-4 text-stone-600 dark:text-stone-400 whitespace-nowrap font-medium">
                    <span className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-950/60 border border-stone-200/60 dark:border-white/5 text-[11px] font-semibold text-stone-700 dark:text-stone-300">
                      {item.category}
                    </span>
                  </td>

                  {/* Stock */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span
                      className={`font-black ${
                        isLow ? "text-rose-600 dark:text-red-400 font-bold" : "text-stone-900 dark:text-white"
                      }`}
                    >
                      {item.stock}
                    </span>{" "}
                    <span className="text-stone-400 dark:text-stone-500 text-xs font-medium">
                      {item.unit}
                    </span>
                  </td>

                  {/* Condition */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    {item.condition === "Baik" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 text-[11px] font-bold">
                        <ShieldCheck size={13} />
                        Baik
                      </span>
                    )}
                    {item.condition === "Rusak Ringan" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 text-[11px] font-bold">
                        <AlertTriangle size={13} />
                        Rusak Ringan
                      </span>
                    )}
                    {item.condition === "Rusak Berat" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 text-[11px] font-bold">
                        <XCircle size={13} />
                        Rusak Berat
                      </span>
                    )}
                  </td>

                  {/* Location */}
                  <td className="px-5 py-4 text-stone-600 dark:text-stone-400 max-w-[180px] truncate" title={item.location}>
                    <span className="inline-flex items-center gap-1.5 truncate">
                      <Building2 size={13} className="text-stone-400 dark:text-stone-500 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </span>
                  </td>

                  {/* PIC */}
                  <td className="px-5 py-4 text-stone-800 dark:text-stone-300 max-w-[180px] truncate font-medium" title={item.person_in_charge}>
                    <span className="inline-flex items-center gap-1.5 truncate">
                      <User size={13} className="text-stone-400 dark:text-stone-500 shrink-0" />
                      <span className="truncate">{item.person_in_charge}</span>
                    </span>
                  </td>

                  {/* Received Date */}
                  <td className="px-5 py-4 text-stone-400 dark:text-stone-500 font-mono text-xs whitespace-nowrap">
                    {item.received_at || "-"}
                  </td>

                  {/* Action Buttons */}
                  <td className="px-5 py-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onDetail(item)}
                        className="p-2 bg-stone-50 dark:bg-stone-950/60 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg border border-stone-200/80 dark:border-white/5 transition-all cursor-pointer shadow-sm"
                        title="Lihat Detail"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="p-2 bg-stone-50 dark:bg-stone-950/60 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg border border-stone-200/80 dark:border-white/5 transition-all cursor-pointer shadow-sm"
                        title="Edit Barang"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(item)}
                        className="p-2 bg-stone-50 dark:bg-stone-950/60 hover:bg-rose-50 dark:hover:bg-red-500/20 text-stone-600 dark:text-stone-400 hover:text-rose-600 dark:hover:text-red-400 rounded-lg border border-stone-200/80 dark:border-white/5 transition-all cursor-pointer shadow-sm"
                        title="Hapus Barang"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
