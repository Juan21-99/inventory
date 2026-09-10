"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coffee } from "lucide-react";

interface PageLoadingProps {
  isOpen: boolean;
  message?: string;
}

export default function PageLoading({
  isOpen,
  message = "Memproses pesanan...",
}: Readonly<PageLoadingProps>) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950 backdrop-blur-2xl"
        >
          <div className="flex flex-col items-center">
            <div className="relative mb-12">
              {/* Pulsing Glow Effect - Layer 1 */}
              <motion.div
                animate={{
                  scale: [1, 1.6, 1],
                  opacity: [0.1, 0.3, 0.1],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 bg-amber-500 rounded-full blur-[60px]"
              />
              {/* Pulsing Glow Effect - Layer 2 */}
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                className="absolute inset-0 bg-amber-400 rounded-full blur-[30px]"
              />

              {/* Logo Container */}
              <motion.div
                animate={{
                  scale: [1, 1.08, 1],
                  rotate: [0, 2, -2, 0],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-28 h-28 bg-gradient-to-br from-amber-400 to-amber-600 rounded-[2.5rem] flex items-center justify-center text-stone-950 shadow-[0_32px_64px_-12px_rgba(245,158,11,0.3)] relative z-10 border border-white/20"
              >
                <div className="absolute inset-0 bg-white/10 rounded-[2.5rem]" />
                <Coffee size={44} strokeWidth={2.5} className="relative z-10" />
              </motion.div>
            </div>

            {/* Brand & Message */}
            <div className="text-center">
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-2xl font-black text-white tracking-[0.3em] uppercase mb-4"
              >
                ALIN.<span className="text-amber-500">CO</span>
              </motion.h2>

              {/* Streaming Shimmer Message */}
              <div className="relative">
                <motion.p
                  className="text-[9px] font-black uppercase tracking-[0.4em] text-transparent bg-clip-text bg-gradient-to-r from-stone-600 via-stone-300 to-stone-600 bg-[length:200%_100%]"
                  animate={{
                    backgroundPosition: ["100% 0%", "-100% 0%"],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  {message}
                </motion.p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
