"use client";

import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import { FloatingPortal } from "@floating-ui/react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import {
  Coffee,
  CupSoda,
  UtensilsCrossed,
  ChevronDown,
  Check,
} from "lucide-react";

interface CategoryOption {
  id: string;
  name: string;
}

interface CategoryDropdownProps {
  value: string; // This is the id
  options: CategoryOption[];
  onChange: (id: string, name: string) => void;
}

const getCategoryIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("coffee") && !n.includes("non")) return Coffee;
  if (n.includes("food") || n.includes("makan")) return UtensilsCrossed;
  if (
    n.includes("drink") ||
    n.includes("minum") ||
    n.includes("non-coffee") ||
    n.includes("cup")
  )
    return CupSoda;
  return Coffee;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { when: "beforeChildren", staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
};

function CategoryDropdownComponent({
  value,
  options,
  onChange,
}: Readonly<CategoryDropdownProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCat = options.find((c) => c.id === value) ||
    options[0] || { id: "", name: "Pilih Kategori" };

  const calculatePosition = useCallback(() => {
    if (!buttonRef.current) return null;
    const rect = buttonRef.current.getBoundingClientRect();
    return {
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
    };
  }, []);

  const handleToggle = () => {
    if (!isOpen) {
      setPosition(calculatePosition());
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isDropdownPortal =
        (target as Element).closest("#category-dropdown-portal") !== null;

      if (
        !buttonRef.current?.contains(target) &&
        !dropdownRef.current?.contains(target) &&
        !isDropdownPortal
      ) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => setIsOpen(false);

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", handleScroll, true);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        window.removeEventListener("scroll", handleScroll, true);
      };
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") setIsOpen(false);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleToggle();
          }}
          className={`group w-full px-5 py-3 flex items-center justify-between rounded-xl border transition-all cursor-pointer ${
            isOpen
              ? "border-amber-500/50 bg-stone-950 ring-1 ring-amber-500/20"
              : "border-white/5 bg-stone-950 hover:border-white/10"
          }`}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <div className="flex items-center gap-3">
            {React.createElement(getCategoryIcon(selectedCat.name), {
              size: 16,
              className:
                "text-stone-400 group-hover:text-amber-500 transition-colors",
            })}
            <span className="font-medium text-white text-sm">
              {selectedCat.name}
            </span>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown
              size={16}
              className="text-stone-500 group-hover:text-white transition-colors"
            />
          </motion.div>
        </button>

        <FloatingPortal>
          <AnimatePresence>
            {isOpen && position && (
              <motion.div
                ref={dropdownRef}
                id="category-dropdown-portal"
                className="fixed z-[9999] pointer-events-auto"
                style={{
                  top: position.top,
                  left: position.left,
                  width: position.width,
                }}
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  transition: {
                    type: "spring",
                    stiffness: 400,
                    damping: 28,
                    mass: 0.8,
                  },
                }}
                exit={{
                  opacity: 0,
                  scale: 0.95,
                  y: -10,
                  transition: { duration: 0.15, ease: "easeOut" },
                }}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
              >
                <motion.div
                  className="w-full rounded-xl border border-white/5 bg-stone-900 p-1 shadow-2xl pointer-events-auto"
                  style={{
                    transform: "translateZ(0)",
                    backfaceVisibility: "hidden",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <motion.div
                    className="py-1 relative"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {(hoveredItem !== null || value) && (
                      <motion.div
                        layoutId="category-hover-highlight"
                        className="absolute inset-x-1 bg-stone-800 rounded-lg"
                        style={{
                          willChange: "transform",
                          transform: "translateZ(0)",
                        }}
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: 1,
                          y:
                            options.findIndex(
                              (c) => (hoveredItem ?? value) === c.id,
                            ) * 44,
                          height: 44,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.4,
                          stiffness: 300,
                          damping: 25,
                        }}
                      />
                    )}
                    {options.map((cat) => {
                      const Icon = getCategoryIcon(cat.name);
                      return (
                        <motion.button
                          key={cat.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onChange(cat.id, cat.name);
                            setIsOpen(false);
                          }}
                          onHoverStart={() => setHoveredItem(cat.id)}
                          onHoverEnd={() => setHoveredItem(null)}
                          className={`relative z-10 w-full flex items-center justify-between p-3 rounded-lg text-sm cursor-pointer pointer-events-auto transition-colors ${
                            value === cat.id || hoveredItem === cat.id
                              ? "text-white"
                              : "text-stone-400"
                          }`}
                          whileTap={{ scale: 0.98 }}
                          variants={itemVariants}
                        >
                          <div className="flex items-center gap-3">
                            <Icon
                              size={16}
                              className={
                                value === cat.id ? "text-amber-500" : ""
                              }
                            />
                            <span className="font-bold tracking-wide uppercase text-[10px]">
                              {cat.name}
                            </span>
                          </div>
                          {value === cat.id && (
                            <Check size={14} className="text-amber-500" />
                          )}
                        </motion.button>
                      );
                    })}
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </FloatingPortal>
      </div>
    </MotionConfig>
  );
}

export const CategoryDropdown = memo(CategoryDropdownComponent);
