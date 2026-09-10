"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import Modal from "@/app/components/ui/Modal";
import { InventoryItem } from "../../types/item.types";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  item: InventoryItem | null;
  loading?: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  item,
  loading = false,
}) => {
  if (!item) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Hapus Data Barang"
      description="Konfirmasi penghapusan data barang inventaris."
    >
      <div className="space-y-4 pt-1">
        <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs">
          <AlertTriangle size={22} className="shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
          <div className="space-y-1.5 min-w-0">
            <p className="font-bold text-rose-700 dark:text-rose-300 text-sm">
              Apakah Anda yakin ingin menghapus barang ini?
            </p>
            <p className="text-stone-700 dark:text-stone-300 font-medium">
              <span className="font-bold text-stone-900 dark:text-white">{item.name}</span>{" "}
              <span className="font-mono text-amber-600 dark:text-amber-400">({item.code})</span>
            </p>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
              Tindakan ini tidak dapat dibatalkan dan akan menghapus riwayat inventaris barang ini dari database.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200 dark:border-white/10">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/5 hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-rose-600/30 disabled:opacity-50 cursor-pointer active:scale-98"
          >
            {loading ? "Menghapus..." : "Ya, Hapus Barang"}
          </button>
        </div>
      </div>
    </Modal>
  );
};
