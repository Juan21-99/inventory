"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export function PaymentSuccess() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen flex items-center justify-center p-6"
    >
      <div className="bg-stone-900/50 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-2xl border border-white/5 max-w-sm w-full text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl" />

        <div className="w-24 h-24 bg-green-500/20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-500/10">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>

        <h2 className="text-3xl font-black text-white mb-3 tracking-tighter uppercase italic">
          Selesai!
        </h2>

        <p className="text-stone-400 mb-10 text-xs leading-relaxed font-bold uppercase tracking-widest">
          Pembayaran kamu berhasil dikonfirmasi. Barista kami sedang menyiapkan
          pesananmu.
        </p>

        <Link
          href="/"
          className="block w-full bg-amber-500 text-stone-950 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-amber-500/20 hover:bg-amber-400 active:scale-95 transition-all text-center"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </motion.div>
  );
}
