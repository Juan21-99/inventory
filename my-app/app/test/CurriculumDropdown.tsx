"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { FloatingPortal } from "@floating-ui/react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { ChevronDown, GraduationCap } from "lucide-react";
import styles from "./AcademicYearActionsDropdown.module.css";

interface CurriculumOption {
  id: string;
  label: string;
}

const curriculumsForm: CurriculumOption[] = [
  { id: "", label: "Pilih Kurikulum" },
  { id: "Kurikulum Merdeka", label: "Kurikulum Merdeka" },
  { id: "Kurikulum 2013", label: "Kurikulum 2013" },
  { id: "KTSP", label: "KTSP" },
];

const curriculumsFilter: CurriculumOption[] = [
  { id: "all", label: "Semua Kurikulum" },
  { id: "Kurikulum Merdeka", label: "Kurikulum Merdeka" },
  { id: "Kurikulum 2013", label: "Kurikulum 2013" },
  { id: "KTSP", label: "KTSP" },
];

interface CurriculumDropdownProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  showLabel?: boolean;
  isFilter?: boolean;
  direction?: "up" | "down";
}

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

export const CurriculumDropdown: React.FC<CurriculumDropdownProps> = ({
  value,
  onChange,
  error,
  showLabel = true,
  isFilter = false,
  direction = "down",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const curriculums = isFilter ? curriculumsFilter : curriculumsForm;
  const selectedItem = curriculums.find((c) => c.id === value);

  const calculatePosition = useCallback(() => {
    if (!buttonRef.current) return null;
    const rect = buttonRef.current.getBoundingClientRect();
    const dropdownHeight = curriculums.length * 36 + 24;

    if (direction === "up") {
      return {
        top: rect.top - dropdownHeight - 8,
        left: rect.left,
        width: rect.width,
      };
    }
    return {
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
    };
  }, [direction, curriculums.length]);

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
        (target as Element).closest("#curriculum-dropdown-portal") !== null;

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
      <div className="space-y-2">
        {showLabel && (
          <label className="block text-sm font-medium text-stone-700 min-h-[20px]">
            Kurikulum
          </label>
        )}

        <div className="relative">
          <button
            ref={buttonRef}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleToggle();
            }}
            className={`group w-full h-10 px-3 flex items-center justify-between rounded-xl border cursor-pointer shadow-sm ${
              error
                ? "border-red-500 bg-red-50"
                : isOpen
                ? "border-stone-900 ring-1 ring-stone-900 bg-stone-50"
                : "border-stone-200 bg-stone-50 hover:border-stone-300"
            }`}
            aria-expanded={isOpen}
            aria-haspopup="true"
          >
            <span className="flex items-center gap-2 text-sm flex-1 min-w-0 overflow-hidden">
              <GraduationCap className="w-4 h-4 text-stone-400 group-hover:text-stone-600 flex-shrink-0" />
              <span
                className={`font-medium text-sm truncate ${
                  selectedItem && selectedItem.id
                    ? "text-stone-900"
                    : "text-stone-400"
                }`}
              >
                {selectedItem ? selectedItem.label : "Pilih Kurikulum"}
              </span>
            </span>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center w-4 h-4 flex-shrink-0 ml-2"
            >
              <ChevronDown className="w-4 h-4 text-stone-400" />
            </motion.div>
          </button>

          <FloatingPortal>
            <AnimatePresence>
              {isOpen && position && (
                <motion.div
                  ref={dropdownRef}
                  id="curriculum-dropdown-portal"
                  className={`${styles.dropdownWrapper} fixed z-[9999] pointer-events-auto`}
                  style={{
                    top: position.top,
                    left: position.left,
                    width: position.width,
                  }}
                  initial={{
                    opacity: 0,
                    scale: 0.95,
                    y: direction === "up" ? 10 : -10,
                  }}
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
                    y: direction === "up" ? 10 : -10,
                    transition: { duration: 0.15, ease: "easeOut" },
                  }}
                  onKeyDown={handleKeyDown}
                  onClick={(e) => e.stopPropagation()}
                >
                  <motion.div
                    className="w-full rounded-xl border border-stone-200 bg-white p-1 shadow-2xl max-h-[250px] overflow-y-auto pointer-events-auto"
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
                      {(hoveredItem !== null || selectedItem) && (
                        <motion.div
                          layoutId="curriculum-hover-highlight"
                          className="absolute inset-x-1 bg-stone-100 rounded-lg"
                          style={{
                            willChange: "transform",
                            transform: "translateZ(0)",
                          }}
                          initial={{ opacity: 0 }}
                          animate={{
                            opacity: 1,
                            y:
                              curriculums.findIndex(
                                (c) =>
                                  (hoveredItem ?? selectedItem?.id ?? "") ===
                                  c.id
                              ) * 36,
                            height: 36,
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
                      {curriculums.map((item) => (
                        <motion.button
                          key={item.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onChange(item.id);
                            setIsOpen(false);
                          }}
                          onHoverStart={() => setHoveredItem(item.id)}
                          onHoverEnd={() => setHoveredItem(null)}
                          className={`relative z-10 flex w-full items-center justify-between px-3 py-2 text-sm rounded-lg focus:outline-none cursor-pointer pointer-events-auto ${
                            selectedItem?.id === item.id ||
                            hoveredItem === item.id
                              ? "text-stone-900"
                              : "text-stone-500"
                          }`}
                          whileTap={{ scale: 0.98 }}
                          variants={itemVariants}
                        >
                          <span className="font-medium text-sm">
                            {item.label}
                          </span>
                          {selectedItem?.id === item.id && item.id && (
                            <div className="w-2 h-2 rounded-full bg-amber-500" />
                          )}
                        </motion.button>
                      ))}
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </FloatingPortal>
        </div>
      </div>
    </MotionConfig>
  );
};
