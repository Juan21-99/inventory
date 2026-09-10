"use client";

import React from "react";
import { CheckCircle } from "lucide-react";
import Modal from "../../../components/ui/Modal";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SuccessModal({
  isOpen,
  onClose,
}: Readonly<SuccessModalProps>) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Status Pesanan"
      description="Konfirmasi keberhasilan pesanan anda."
    >
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <div className="w-24 h-24 bg-green-500/5 rounded-[2.5rem] flex items-center justify-center mb-8 animate-in zoom-in duration-500 border border-green-500/10 relative group">
          <div className="absolute inset-0 bg-green-500/5 blur-xl rounded-full group-hover:bg-green-500/10 transition-all" />
          <CheckCircle
            size={48}
            className="text-green-500 relative z-10"
            strokeWidth={2.5}
          />
        </div>
        <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">
          Berhasil!
        </h2>
        <p className="text-stone-400 mb-8 max-w-[200px] font-medium">
          Terima kasih sudah memesan di Alin Coffee.
        </p>
        <button
          onClick={onClose}
          className="w-full bg-amber-500 text-stone-950 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-amber-500/10 hover:bg-amber-400 active:scale-95 transition-all cursor-pointer"
        >
          Lihat Pesanan Saya
        </button>
      </div>
    </Modal>
  );
}
