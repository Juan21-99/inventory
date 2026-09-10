"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { ChevronDown, AlertCircle } from "lucide-react";

interface ReasonOption {
  id: string;
  label: string;
}

const reasons: ReasonOption[] = [
  { id: "custom", label: "-- Tulis Manual --" },
  { id: "Stok habis mendadak", label: "Stok Habis Mendadak" },
  { id: "Toko tutup darurat", label: "Toko Tutup Darurat" },
  { id: "Pesanan duplikat", label: "Pesanan Duplikat" },
  { id: "Alamat tidak dapat dijangkau", label: "Alamat Tidak Terjangkau" },
];

interface CancellationReasonDropdownProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  showLabel?: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.03,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.2,
      ease: "easeOut" as const,
    },
  },
};

export const CancellationReasonDropdown: React.FC<
  CancellationReasonDropdownProps
> = ({ value, onChange, label = "Pilih Alasan Cepat", showLabel = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredReason, setHoveredReason] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedReason =
    reasons.find((r) => r.id === value || r.label === value) ||
    reasons.find((r) => r.id === "custom");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="space-y-2">
        {showLabel && (
          <label className="block text-[10px] font-black uppercase tracking-wider text-stone-500 mb-1 ml-1">
            {label}
          </label>
        )}

        <div className="relative" ref={containerRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`group w-full px-4 py-3.5 flex items-center justify-between rounded-xl border transition-all duration-200 cursor-pointer ${
              isOpen
                ? "border-amber-500 bg-stone-900/80 shadow-[0_0_15px_rgba(245,158,11,0.1)] text-white"
                : "border-white/5 bg-stone-900/50 text-stone-400 hover:border-white/10 hover:bg-stone-900 hover:text-stone-300"
            }`}
            aria-expanded={isOpen}
            aria-haspopup="true"
          >
            <span className="flex items-center gap-3 text-sm flex-1">
              <AlertCircle
                className={`w-4 h-4 transition-colors duration-200 flex-shrink-0 ${
                  isOpen
                    ? "text-amber-500"
                    : "text-stone-500 group-hover:text-stone-400"
                }`}
              />
              <span
                className={`font-bold text-xs uppercase tracking-wider truncate ${
                  selectedReason && selectedReason.id !== "custom"
                    ? "text-white"
                    : "text-stone-500"
                }`}
              >
                {selectedReason && selectedReason.id !== "custom"
                  ? selectedReason.label
                  : "-- Tulis Manual --"}
              </span>
            </span>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className={`flex items-center justify-center w-5 h-5 flex-shrink-0 ml-2 rounded-full ${
                isOpen
                  ? "bg-amber-500 text-stone-950"
                  : "bg-stone-800 text-stone-500"
              }`}
            >
              <ChevronDown className="w-3 h-3" strokeWidth={3} />
            </motion.div>
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  transition: {
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                    mass: 0.8,
                  },
                }}
                exit={{
                  opacity: 0,
                  scale: 0.95,
                  y: -8,
                  transition: {
                    duration: 0.15,
                    ease: "easeOut",
                  },
                }}
                className="absolute left-0 right-0 top-full mt-2 z-50"
                style={{ transformOrigin: "top center" }}
                onKeyDown={handleKeyDown}
              >
                <motion.div
                  className="w-full rounded-2xl border border-white/5 bg-stone-900/95 backdrop-blur-xl p-2 shadow-2xl max-h-[240px] overflow-y-auto z-50 ring-1 ring-black/50"
                  style={{
                    transformOrigin: "top",
                    transform: "translateZ(0)",
                    backfaceVisibility: "hidden",
                  }}
                >
                  <motion.div
                    className="space-y-1 relative"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {(hoveredReason || selectedReason) && (
                      <motion.div
                        layoutId="reason-hover-highlight"
                        className="absolute inset-x-0 bg-white/5 rounded-xl border border-white/5"
                        style={{
                          willChange: "transform",
                          transform: "translateZ(0)",
                        }}
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: 1,
                          y:
                            reasons.findIndex(
                              (r) =>
                                (hoveredReason ||
                                  selectedReason?.id ||
                                  selectedReason?.label) === r.id ||
                                (hoveredReason ||
                                  selectedReason?.id ||
                                  selectedReason?.label) === r.label,
                            ) * 44, // Adjusted height match
                          height: 44,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{
                          type: "spring",
                          bounce: 0.15,
                          duration: 0.4,
                          stiffness: 300,
                          damping: 25,
                        }}
                      />
                    )}
                    {reasons.map((reason) => (
                      <motion.button
                        key={reason.id}
                        type="button"
                        onClick={() => {
                          onChange(reason.id);
                          setIsOpen(false);
                        }}
                        onHoverStart={() => setHoveredReason(reason.id)}
                        onHoverEnd={() => setHoveredReason(null)}
                        className={`relative flex w-full items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors duration-150 focus:outline-none cursor-pointer z-10 ${(() => {
                          if (
                            selectedReason?.id === reason.id ||
                            selectedReason?.label === reason.label
                          )
                            return "text-amber-500";
                          if (hoveredReason === reason.id) return "text-white";
                          return "text-stone-400";
                        })()}`}
                        whileTap={{ scale: 0.98 }}
                        variants={itemVariants}
                      >
                        <span className="truncate">{reason.label}</span>
                        {(selectedReason?.id === reason.id ||
                          selectedReason?.label === reason.label) && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                          ></motion.div>
                        )}
                      </motion.button>
                    ))}
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MotionConfig>
  );
};
