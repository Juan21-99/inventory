"use client";

import { Loader2, Download, ChevronRight } from "lucide-react";
import { useState } from "react";

interface QrisData {
  qris_url: string;
  transaction_id: string;
  expires_at: string;
}

interface QrisDisplayProps {
  readonly qrisData: QrisData | null;
  readonly isProcessing: boolean;
  readonly isExpired: boolean;
  readonly onDownload: () => Promise<void>;
  readonly onCheckStatus: () => Promise<void>;
}

export function QrisDisplay({
  qrisData,
  isProcessing,
  isExpired,
  onDownload,
  onCheckStatus,
}: QrisDisplayProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await onDownload();
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleDownload}
        disabled={!qrisData?.qris_url || isExpired || isDownloading}
        className="w-full bg-stone-900 border border-white/5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <Download size={16} />
        {isDownloading ? "Menyimpan..." : "Simpan QR ke Galeri"}
      </button>

      <button
        onClick={onCheckStatus}
        disabled={isProcessing || isExpired}
        className="w-full bg-amber-500 text-stone-950 py-5 rounded-2xl shadow-2xl shadow-amber-500/20 hover:bg-amber-400 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed font-black text-[11px] uppercase tracking-[0.2em] cursor-pointer"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" strokeWidth={3} />
            <span>Verifikasi...</span>
          </>
        ) : (
          <>
            <span>Saya Sudah Bayar</span>
            <ChevronRight size={18} strokeWidth={3} />
          </>
        )}
      </button>
    </div>
  );
}
