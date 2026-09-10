"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export type ModalMaxWidth =
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl"
  | "full";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: ModalMaxWidth;
  className?: string;
}

const maxWidthMap: Record<ModalMaxWidth, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  full: "max-w-6xl",
};

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "md",
  className = "",
}: Readonly<ModalProps>) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const sizeClass = maxWidthMap[maxWidth] || "max-w-md";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Overlay Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="no-print fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className={`relative z-10 w-full ${sizeClass} rounded-[2rem] bg-white dark:bg-stone-900/98 border border-stone-200 dark:border-white/10 p-6 sm:p-7 text-stone-900 dark:text-white shadow-xl dark:shadow-2xl shadow-black/20 dark:shadow-black/90 max-h-[92vh] flex flex-col my-auto overflow-hidden ${className}`}
          >
            {/* Modal Header */}
            <div className="no-print flex items-start justify-between gap-4 pb-4 border-b border-stone-100 dark:border-white/5 shrink-0">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-stone-900 dark:text-white tracking-tight leading-none uppercase italic">
                  {title}
                </h3>
                {description && (
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 font-medium leading-relaxed">
                    {description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-stone-100 dark:bg-stone-950/60 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white border border-stone-200 dark:border-white/5 hover:border-stone-300 dark:hover:border-white/15 transition-colors cursor-pointer shrink-0"
                aria-label="Tutup modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="overflow-y-auto flex-1 pr-1 scrollbar-thin scrollbar-thumb-stone-700 mt-4">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
