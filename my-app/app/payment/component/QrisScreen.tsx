"use client";

import { ArrowLeft, QrCode } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { QrisDisplay } from "./QrisDisplay";
import { QrisTimer } from "./QrisTimer";

interface QrisScreenProps {
  readonly qrisData: {
    qris_url: string;
    transaction_id: string;
    expires_at: string;
  } | null;
  readonly isProcessing: boolean;
  readonly onBack: () => void;
  readonly onDownload: () => Promise<void>;
  readonly onCheckStatus: () => Promise<void>;
}

export function QrisScreen({
  qrisData,
  isProcessing,
  onBack,
  onDownload,
  onCheckStatus,
}: QrisScreenProps) {
  const [isExpired, setIsExpired] = useState(false);

  // Calculate isExpired and update every second
  useEffect(() => {
    const checkExpiry = () => {
      if (!qrisData?.expires_at) {
        setIsExpired(false);
        return;
      }
      const now = Date.now();
      const expiry = new Date(qrisData.expires_at).getTime();
      setIsExpired(now > expiry);
    };

    // Check immediately
    checkExpiry();

    // Then check every second
    const interval = setInterval(checkExpiry, 1000);
    return () => clearInterval(interval);
  }, [qrisData?.expires_at]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, ease: "circOut" }}
      className="min-h-screen flex flex-col p-6 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] -z-10" />

      <div className="max-w-md mx-auto w-full pt-4">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-3 text-stone-500 hover:text-white mb-8 transition-all group cursor-pointer active:scale-95"
        >
          <div className="w-11 h-11 bg-stone-900/50 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-white/10 group-hover:bg-stone-800 transition-all">
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
          </div>
          <div className="flex flex-col items-start translate-y-0.5">
            <span className="font-black uppercase tracking-[0.2em] text-[10px]">
              Kembali
            </span>
            <span className="text-[8px] text-stone-600 font-bold uppercase tracking-widest mt-0.5 group-hover:text-stone-400 transition-colors">
              Ubah Metode
            </span>
          </div>
        </button>

        {/* Main Card */}
        <div className="bg-stone-900/40 backdrop-blur-2xl rounded-[2.5rem] p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] border border-white/5 text-center relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[9px] font-black text-amber-500/80 uppercase tracking-[0.4em]">
                QRIS PAYMENT
              </span>
            </div>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic mb-6">
              Scan <span className="text-amber-500">&</span> Pay
            </h2>
            <QrisTimer expiresAt={qrisData?.expires_at ?? null} />
          </div>

          {/* QR Code Container */}
          <div className="bg-white p-7 rounded-[2.5rem] mb-10 flex items-center justify-center relative shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] group mx-auto max-w-[280px]">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent rounded-[2.5rem]" />
            <div
              className={`w-full aspect-square bg-white flex items-center justify-center relative z-10 transition-transform duration-700 group-hover:scale-[0.98] overflow-hidden rounded-2xl ${
                isExpired ? "opacity-20 grayscale" : ""
              }`}
            >
              {qrisData?.qris_url && !isExpired ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrisData.qris_url}
                  alt="QRIS Code"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <QrCode
                    size={220}
                    className="text-stone-950 opacity-20"
                    strokeWidth={1.5}
                  />
                  <p className="text-black text-xs font-bold mt-2">
                    {isExpired ? "QR Code Expired" : "QR Failed to Load"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <QrisDisplay
            qrisData={qrisData}
            isProcessing={isProcessing}
            isExpired={isExpired}
            onDownload={onDownload}
            onCheckStatus={onCheckStatus}
          />
        </div>
      </div>
    </motion.div>
  );
}
