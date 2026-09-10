"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { FloatingPortal } from "@floating-ui/react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import {
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Power,
  PowerOff,
  Archive,
} from "lucide-react";
import styles from "./AcademicYearActionsDropdown.module.css";

type AcademicYearStatus = "draft" | "active" | "completed" | "archived";

interface ActionOption {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: "default" | "destructive" | "success" | "warning";
}

interface AcademicYearActionsDropdownProps {
  status: AcademicYearStatus;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onActivate: () => void;
  onDeactivate: () => void;
  onArchive: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut" as const,
    },
  },
};

export function AcademicYearActionsDropdown({
  status,
  onView,
  onEdit,
  onDelete,
  onActivate,
  onDeactivate,
  onArchive,
}: AcademicYearActionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculate position - above table container, shifted left
  const calculatePosition = useCallback(() => {
    if (!buttonRef.current) return null;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const tableContainer = document.getElementById(
      "academic-year-table-container"
    );

    if (tableContainer) {
      const tableRect = tableContainer.getBoundingClientRect();
      return {
        top: tableRect.top - 10, // 10px above table
        left: buttonRect.left - 160, // 160px to the left of button
      };
    }

    // Fallback: position above button
    return {
      top: buttonRect.top - 10,
      left: buttonRect.left - 160,
    };
  }, []);

  const handleToggle = () => {
    if (!isOpen) {
      const newPosition = calculatePosition();
      setPosition(newPosition);
    }
    setIsOpen(!isOpen);
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isClickInsideButton = buttonRef.current?.contains(target);
      const isClickInsideDropdown = dropdownRef.current?.contains(target);

      if (!isClickInsideButton && !isClickInsideDropdown) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", handleScroll, true);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        window.removeEventListener("scroll", handleScroll, true);
      };
    }
  }, [isOpen]);

  // Build actions based on status
  const getStatusAction = (): ActionOption | null => {
    switch (status) {
      case "draft":
        return {
          id: "activate",
          label: "Aktifkan",
          icon: Power,
          onClick: () => {
            onActivate();
            setIsOpen(false);
          },
          variant: "success" as const,
        };
      case "active":
        return {
          id: "deactivate",
          label: "Nonaktifkan",
          icon: PowerOff,
          onClick: () => {
            onDeactivate();
            setIsOpen(false);
          },
        };
      case "completed":
        return {
          id: "archive",
          label: "Arsipkan",
          icon: Archive,
          onClick: () => {
            onArchive();
            setIsOpen(false);
          },
          variant: "warning" as const,
        };
      case "archived":
        return null; // No status action for archived
      default:
        return null;
    }
  };

  const statusAction = getStatusAction();

  const actions: ActionOption[] = [
    {
      id: "view",
      label: "Lihat Detail",
      icon: Eye,
      onClick: () => {
        onView();
        setIsOpen(false);
      },
    },
    {
      id: "edit",
      label: "Edit",
      icon: Edit,
      onClick: () => {
        onEdit();
        setIsOpen(false);
      },
    },
    ...(statusAction ? [statusAction] : []),
    {
      id: "delete",
      label: "Hapus",
      icon: Trash2,
      onClick: () => {
        onDelete();
        setIsOpen(false);
      },
      variant: "destructive" as const,
    },
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const getActionColor = (action: ActionOption, isHovered: boolean) => {
    if (action.variant === "destructive") {
      return isHovered ? "text-red-600" : "text-red-500";
    }
    if (action.variant === "success") {
      return isHovered ? "text-emerald-600" : "text-emerald-500";
    }
    if (action.variant === "warning") {
      return isHovered ? "text-amber-600" : "text-amber-500";
    }
    return isHovered ? "text-stone-900" : "text-stone-600";
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className={`${styles.actionsContainer} relative`}>
        <button
          ref={buttonRef}
          type="button"
          onClick={handleToggle}
          className="group h-8 w-8 rounded-md hover:bg-stone-100 flex items-center justify-center cursor-pointer"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <MoreHorizontal className="h-4 w-4 text-stone-600 group-hover:text-emerald-500" />
        </button>

        <FloatingPortal>
          <AnimatePresence>
            {isOpen && position && (
              <motion.div
                ref={dropdownRef}
                className={`${styles.dropdownWrapper} fixed z-50 w-[160px]`}
                style={{
                  top: position.top,
                  left: position.left,
                  transformOrigin: "bottom right",
                }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 28,
                  mass: 0.8,
                }}
                onKeyDown={handleKeyDown}
              >
                <motion.div
                  className="w-full rounded-xl border border-stone-200 bg-white p-1 shadow-2xl"
                  style={{
                    transform: "translateZ(0)",
                    backfaceVisibility: "hidden",
                  }}
                >
                  <motion.div
                    className="py-1 relative"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {hoveredAction && (
                      <motion.div
                        layoutId="academic-action-hover-highlight"
                        className="absolute inset-x-1 bg-stone-100 rounded-md"
                        style={{
                          willChange: "transform",
                          transform: "translateZ(0)",
                        }}
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: 1,
                          y:
                            actions.findIndex((a) => hoveredAction === a.id) *
                            36,
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
                    {actions.map((action) => {
                      const Icon = action.icon;
                      const isHovered = hoveredAction === action.id;
                      return (
                        <motion.button
                          key={action.id}
                          type="button"
                          onClick={action.onClick}
                          onHoverStart={() => setHoveredAction(action.id)}
                          onHoverEnd={() => setHoveredAction(null)}
                          className={`relative z-10 flex w-full items-center gap-2 px-3 py-2 text-sm rounded-md focus:outline-none cursor-pointer ${getActionColor(
                            action,
                            isHovered
                          )}`}
                          variants={itemVariants}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="font-medium">{action.label}</span>
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
