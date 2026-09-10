"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { ChevronDown, LucideIcon } from "lucide-react";

export interface DropdownOption {
  value: string;
  label: string;
  icon?: LucideIcon;
  badge?: React.ReactNode;
  color?: string;
}

interface CustomDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  label?: string;
  showLabel?: boolean;
  icon?: LucideIcon;
  className?: string;
  buttonClassName?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.02,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -6 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.15,
      ease: "easeOut" as const,
    },
  },
};

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  value,
  onChange,
  options,
  placeholder = "Pilih opsi...",
  label,
  showLabel = false,
  icon: HeaderIcon,
  className = "",
  buttonClassName = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredValue, setHoveredValue] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

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
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const SelectedIcon = selectedOption?.icon || HeaderIcon;

  return (
    <MotionConfig reducedMotion="user">
      <div className={`space-y-1.5 ${isOpen ? "relative z-[60]" : "relative z-10"} ${className}`}>
        {showLabel && label && (
          <label className="block text-[10px] font-black uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1 ml-1">
            {label}
          </label>
        )}

        <div className={`relative ${isOpen ? "z-[60]" : "z-10"}`} ref={containerRef}>
          {/* Dropdown Trigger Button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`group w-full px-3.5 py-2.5 flex items-center justify-between gap-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
              isOpen
                ? "border-amber-500 bg-amber-500/10 dark:bg-stone-900 shadow-[0_0_15px_rgba(245,158,11,0.15)] text-stone-900 dark:text-white"
                : "border-stone-200 dark:border-white/5 bg-stone-50 dark:bg-stone-950/70 text-stone-700 dark:text-stone-300 hover:border-stone-300 dark:hover:border-white/15 hover:bg-stone-100 dark:hover:bg-stone-900 hover:text-stone-900 dark:hover:text-white shadow-sm"
            } ${buttonClassName}`}
            aria-expanded={isOpen}
            aria-haspopup="true"
          >
            <span className="flex items-center gap-2.5 text-xs font-semibold flex-1 min-w-0">
              {SelectedIcon && (
                <SelectedIcon
                  size={15}
                  className={`shrink-0 transition-colors ${
                    isOpen
                      ? "text-amber-500"
                      : selectedOption?.color || "text-amber-600 dark:text-amber-500/80 group-hover:text-amber-500"
                  }`}
                />
              )}
              <span className="truncate font-bold tracking-tight">
                {selectedOption ? selectedOption.label : placeholder}
              </span>
            </span>

            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className={`flex items-center justify-center w-5 h-5 shrink-0 rounded-full transition-colors ${
                isOpen
                  ? "bg-amber-500 text-stone-950"
                  : "bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400 group-hover:text-stone-900 dark:group-hover:text-white"
              }`}
            >
              <ChevronDown size={12} strokeWidth={2.8} />
            </motion.div>
          </button>

          {/* Animated Dropdown Menu Panel with high z-index & solid background */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: -6 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  transition: {
                    type: "spring",
                    stiffness: 450,
                    damping: 32,
                    mass: 0.8,
                  },
                }}
                exit={{
                  opacity: 0,
                  scale: 0.96,
                  y: -6,
                  transition: { duration: 0.12, ease: "easeOut" },
                }}
                className="absolute left-0 right-0 top-full mt-2 z-[70] min-w-[200px]"
                style={{ transformOrigin: "top center" }}
                onKeyDown={handleKeyDown}
              >
                <div className="w-full rounded-2xl border border-stone-200 dark:border-white/10 bg-white/98 dark:bg-stone-900/98 backdrop-blur-2xl p-1.5 shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)] max-h-[260px] overflow-y-auto z-[70] ring-1 ring-stone-900/5 dark:ring-black/80 scrollbar-thin scrollbar-thumb-stone-300 dark:scrollbar-thumb-stone-700">
                  <motion.div
                    className="space-y-1"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {options.map((opt) => {
                      const isSelected = value === opt.value;
                      const OptionIcon = opt.icon;

                      return (
                        <motion.button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            onChange(opt.value);
                            setIsOpen(false);
                          }}
                          onMouseEnter={() => setHoveredValue(opt.value)}
                          onMouseLeave={() => setHoveredValue(null)}
                          className={`relative flex w-full items-center justify-between gap-2.5 px-3 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer text-left ${
                            isSelected
                              ? "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-white/[0.08]"
                              : hoveredValue === opt.value
                              ? "text-stone-900 dark:text-white bg-stone-100 dark:bg-white/[0.05]"
                              : "text-stone-600 dark:text-stone-400"
                          }`}
                          whileTap={{ scale: 0.98 }}
                          variants={itemVariants}
                        >
                          <span className="flex items-center gap-2.5 truncate">
                            {OptionIcon && (
                              <OptionIcon
                                size={14}
                                className={`shrink-0 ${
                                  isSelected ? "text-amber-500" : "text-stone-400 dark:text-stone-500"
                                }`}
                              />
                            )}
                            <span className="truncate">{opt.label}</span>
                          </span>

                          {/* Selected Glow Dot */}
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.9)]"
                            />
                          )}
                        </motion.button>
                      );
                    })}
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MotionConfig>
  );
};
