"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Eye,
  Trash2,
  Building2,
  User,
  Calendar,
  ArrowUpFromLine,
  CheckCircle2,
  Clock,
  Briefcase,
  Layers,
} from "lucide-react";
import { OutgoingTransaction, OutgoingStatus } from "../../types/outgoing.types";

interface OutgoingCardProps {
  transaction: OutgoingTransaction;
  onDetail: (tx: OutgoingTransaction) => void;
  onDelete: (tx: OutgoingTransaction) => void;
}

export const OutgoingCard: React.FC<OutgoingCardProps> = ({
  transaction,
  onDetail,
  onDelete,
}) => {
  const renderStatusBadge = (status: OutgoingStatus) => {
    switch (status) {
      case "Didistribusikan":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
            <CheckCircle2 size={11} /> Terdistribusi
          </span>
        );
      case "Dipinjam":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-400 text-[10px] font-black uppercase tracking-wider">
            <Clock size={11} /> Dipinjam
          </span>
        );
      case "Dalam Servis":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-500/15 text-rose-400 text-[10px] font-black uppercase tracking-wider">
            Servis
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-stone-800 text-stone-300 text-[10px] font-black uppercase tracking-wider">
            {status}
          </span>
        );
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-white dark:bg-stone-900/60 backdrop-blur-xl border border-stone-200/80 dark:border-white/5 hover:border-amber-500/40 rounded-[1.8rem] p-5 shadow-sm dark:shadow-xl hover:shadow-md dark:hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
    >
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-stone-100 dark:border-white/5">
        <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-mono font-bold text-xs tracking-wider">
          {transaction.transaction_number}
        </span>
        {renderStatusBadge(transaction.status)}
      </div>

      {/* Item Title & Purpose */}
      <div className="py-3.5 space-y-2">
        <div className="space-y-1">
          <h3
            onClick={() => onDetail(transaction)}
            className="text-sm font-bold text-stone-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1 cursor-pointer"
            title={transaction.item_name}
          >
            {transaction.item_name}
          </h3>
          <p className="text-[11px] font-mono text-stone-400 dark:text-stone-500">
            {transaction.item_code} · <span className="text-stone-600 dark:text-stone-400">{transaction.category}</span>
          </p>
        </div>

        {/* Quantity & Purpose Pill */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-black text-xs">
            <ArrowUpFromLine size={13} />
            -{transaction.quantity} {transaction.unit}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-stone-100 dark:bg-stone-950/70 border border-stone-200 dark:border-white/5 text-[10px] font-bold text-stone-700 dark:text-stone-300 truncate max-w-[160px]" title={transaction.purpose}>
            <Briefcase size={11} className="text-amber-500 shrink-0" />
            <span className="truncate">{transaction.purpose}</span>
          </span>
        </div>
      </div>

      {/* Location, Receiver, & Date Details */}
      <div className="space-y-2 pt-3 border-t border-stone-100 dark:border-white/5 text-xs text-stone-500 dark:text-stone-400">
        {/* Ruangan Tujuan */}
        <div className="flex items-center gap-2 truncate" title={transaction.target_location}>
          <Building2 size={13} className="text-stone-400 dark:text-stone-500 shrink-0" />
          <span className="truncate">{transaction.target_location}</span>
        </div>

        {/* Pegawai Penerima */}
        <div className="flex items-center gap-2 truncate" title={`${transaction.recipient_name} ${transaction.recipient_nip ? `(NIP. ${transaction.recipient_nip})` : ""}`}>
          <User size={13} className="text-stone-400 dark:text-stone-500 shrink-0" />
          <span className="truncate text-stone-800 dark:text-stone-300 font-medium">{transaction.recipient_name}</span>
        </div>

        {/* Tanggal Distribusi */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 text-stone-400 dark:text-stone-500 text-[11px]">
            <Calendar size={12} className="shrink-0" />
            <span>{transaction.date}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onDetail(transaction)}
              className="p-2 bg-stone-100 dark:bg-stone-950/80 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 rounded-xl border border-stone-200 dark:border-white/5 transition-all cursor-pointer shadow-sm"
              title="Lihat Berita Acara / BAST Keluar"
            >
              <Eye size={13} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(transaction)}
              className="p-2 bg-stone-100 dark:bg-stone-950/80 hover:bg-red-500/10 dark:hover:bg-red-500/20 text-stone-600 dark:text-stone-400 hover:text-red-600 dark:hover:text-red-400 rounded-xl border border-stone-200 dark:border-white/5 transition-all cursor-pointer shadow-sm"
              title="Hapus Transaksi"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
