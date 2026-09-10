"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface PageLoadingProps {
  isOpen: boolean;
  message?: string;
}

export default function PageLoading({
  isOpen,
  message = "Memuat data...",
}: Readonly<PageLoadingProps>) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-50/90 dark:bg-stone-950/95 backdrop-blur-md transition-colors duration-300"
        >
          <div className="flex flex-col items-center">
            {/* Logo Container with Ambient Glow */}
            <div className="relative mb-6 flex items-center justify-center">
              <motion.div
                animate={{
                  scale: [1, 1.35, 1],
                  opacity: [0.2, 0.45, 0.2],
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-amber-500/25 dark:bg-amber-500/15 rounded-full blur-[40px]"
              />

              <motion.div
                animate={{
                  scale: [1, 1.04, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-22 h-22 sm:w-24 sm:h-24 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-white/15 p-4 flex items-center justify-center relative z-10 shadow-xl dark:shadow-2xl transition-colors duration-300"
              >
                <Image
                  src="/logo.png"
                  alt="Logo Inspektorat"
                  width={60}
                  height={60}
                  className="w-full h-full object-contain drop-shadow-md"
                  priority
                />
              </motion.div>
            </div>

            {/* Brand & Animated Message */}
            <div className="text-center space-y-1.5 max-w-xs px-4">
              <h2 className="text-sm sm:text-base font-black text-stone-900 dark:text-white tracking-widest uppercase transition-colors duration-300">
                INVENTARIS <span className="text-amber-600 dark:text-amber-500">INSPEKTORAT</span>
              </h2>

              <motion.div
                className="flex items-center justify-center gap-2"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <p className="text-xs font-semibold text-stone-600 dark:text-stone-400 tracking-wide transition-colors duration-300">
                  {message}
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
