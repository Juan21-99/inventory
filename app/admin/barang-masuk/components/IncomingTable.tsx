"use client";

import React from "react";
import {
  FileText,
  Eye,
  Trash2,
  Building2,
  User,
  Truck,
  ArrowDownToLine,
  Calendar,
} from "lucide-react";
import { IncomingTransaction } from "../../types/incoming.types";

interface IncomingTableProps {
  transactions: IncomingTransaction[];
  onDetail: (tx: IncomingTransaction) => void;
  onDelete: (tx: IncomingTransaction) => void;
}

export const IncomingTable: React.FC<IncomingTableProps> = ({
  transactions,
  onDetail,
  onDelete,
}) => {
  return (
    <div className="bg-white dark:bg-stone-900/60 backdrop-blur-md rounded-[2rem] border border-stone-200/80 dark:border-white/5 shadow-sm dark:shadow-2xl overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-stone-300 dark:scrollbar-thumb-stone-800">
        <table className="w-full text-left text-xs sm:text-sm text-stone-700 dark:text-stone-300">
          <thead className="bg-stone-50/90 dark:bg-stone-950/80 text-[10px] sm:text-xs font-black uppercase tracking-widest text-stone-500 border-b border-stone-200/80 dark:border-white/5">
            <tr>
              <th className="px-5 py-4">No. Transaksi / BAST</th>
              <th className="px-5 py-4">Tgl Terima</th>
              <th className="px-5 py-4">Barang & Kode</th>
              <th className="px-5 py-4">Kuantitas</th>
              <th className="px-5 py-4">Sumber & Rekanan</th>
              <th className="px-5 py-4">Ruangan Tujuan</th>
              <th className="px-5 py-4">Penerima (PJ)</th>
              <th className="px-5 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-white/5">
            {transactions.map((tx) => (
              <tr
                key={tx.id}
                className="hover:bg-stone-50/70 dark:hover:bg-white/[0.02] transition-colors group"
              >
                {/* No Transaksi */}
                <td className="px-5 py-4 font-mono font-bold whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs">
                      {tx.transaction_number}
                    </span>
                  </div>
                </td>

                {/* Tanggal Terima */}
                <td className="px-5 py-4 text-stone-600 dark:text-stone-400 whitespace-nowrap font-medium">
                  <div className="flex items-center gap-1.5 text-xs text-stone-800 dark:text-stone-300">
                    <Calendar size={13} className="text-stone-400 dark:text-stone-500 shrink-0" />
                    <span>{tx.date}</span>
                  </div>
                </td>

                {/* Nama Barang & Kode */}
                <td className="px-5 py-4 min-w-[200px]">
                  <div className="space-y-0.5">
                    <p
                      onClick={() => onDetail(tx)}
                      className="font-bold text-stone-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer line-clamp-1"
                      title={tx.item_name}
                    >
                      {tx.item_name}
                    </p>
                    <span className="inline-block text-[10px] font-mono text-stone-500">
                      {tx.item_code} · <span className="text-stone-700 dark:text-stone-400">{tx.category}</span>
                    </span>
                  </div>
                </td>

                {/* Kuantitas */}
                <td className="px-5 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-black text-xs">
                    <ArrowDownToLine size={13} />
                    +{tx.quantity} {tx.unit}
                  </span>
                </td>

                {/* Sumber & Rekanan */}
                <td className="px-5 py-4 max-w-[200px] truncate" title={`${tx.source} - ${tx.supplier}`}>
                  <div className="space-y-0.5">
                    <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-950/60 border border-stone-200/60 dark:border-white/5 text-[10px] font-semibold text-stone-700 dark:text-stone-300">
                      {tx.source}
                    </span>
                    <p className="text-xs text-stone-500 dark:text-stone-400 truncate">{tx.supplier}</p>
                  </div>
                </td>

                {/* Ruangan Tujuan */}
                <td className="px-5 py-4 text-stone-600 dark:text-stone-400 max-w-[160px] truncate" title={tx.target_location}>
                  <div className="flex items-center gap-1.5 truncate">
                    <Building2 size={13} className="text-stone-400 dark:text-stone-500 shrink-0" />
                    <span className="truncate">{tx.target_location}</span>
                  </div>
                </td>

                {/* Penerima */}
                <td className="px-5 py-4 text-stone-800 dark:text-stone-300 max-w-[160px] truncate font-medium" title={tx.received_by}>
                  <div className="flex items-center gap-1.5 truncate">
                    <User size={13} className="text-stone-400 dark:text-stone-500 shrink-0" />
                    <span className="truncate">{tx.received_by}</span>
                  </div>
                </td>

                {/* Aksi */}
                <td className="px-5 py-4 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onDetail(tx)}
                      className="p-2 bg-stone-50 dark:bg-stone-950/60 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg border border-stone-200/80 dark:border-white/5 transition-all cursor-pointer shadow-sm"
                      title="Lihat Berita Acara / Bukti Serah Terima"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(tx)}
                      className="p-2 bg-stone-50 dark:bg-stone-950/60 hover:bg-rose-50 dark:hover:bg-red-500/20 text-stone-600 dark:text-stone-400 hover:text-rose-600 dark:hover:text-red-400 rounded-lg border border-stone-200/80 dark:border-white/5 transition-all cursor-pointer shadow-sm"
                      title="Hapus Transaksi"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
