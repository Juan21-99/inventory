"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
  RotateCcw,
} from "lucide-react";

interface CustomDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  showLabel?: boolean;
  required?: boolean;
  className?: string;
  buttonClassName?: string;
}

const MONTH_NAMES_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const DAY_NAMES_ID = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  placeholder = "Pilih Tanggal...",
  label,
  showLabel = false,
  required = false,
  className = "",
  buttonClassName = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize current view month and year
  const initialDate = value ? new Date(value) : new Date();
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());

  // Click outside to close
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

  // Sync calendar view if value changes
  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setCurrentYear(d.getFullYear());
        setCurrentMonth(d.getMonth());
      }
    }
  }, [value]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleSelectDate = (day: number) => {
    const formattedMonth = String(currentMonth + 1).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");
    const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  const handleSelectToday = () => {
    const today = new Date();
    const formattedMonth = String(today.getMonth() + 1).padStart(2, "0");
    const formattedDay = String(today.getDate()).padStart(2, "0");
    const dateStr = `${today.getFullYear()}-${formattedMonth}-${formattedDay}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange("");
    setIsOpen(false);
  };

  // Format display text on trigger button
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return placeholder;
    try {
      const [year, month, day] = dateStr.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Calendar Calculation
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const today = new Date();
  const isToday = (day: number) =>
    today.getFullYear() === currentYear &&
    today.getMonth() === currentMonth &&
    today.getDate() === day;

  const isSelectedDate = (day: number) => {
    if (!value) return false;
    const [y, m, d] = value.split("-").map(Number);
    return y === currentYear && m === currentMonth + 1 && d === day;
  };

  const isSelected = Boolean(value);

  return (
    <div className={`space-y-1.5 ${isOpen ? "relative z-[70]" : "relative z-10"} ${className}`} ref={containerRef}>
      {showLabel && label && (
        <label className="block text-[10px] font-black uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1 ml-1">
          {label} {required && <span className="text-amber-500">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`group w-full px-3.5 py-2.5 flex items-center justify-between gap-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
          isOpen
            ? "border-amber-500 bg-amber-500/10 dark:bg-stone-900 shadow-[0_0_15px_rgba(245,158,11,0.15)] text-stone-900 dark:text-white"
            : isSelected
            ? "border-stone-300 dark:border-white/10 bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm"
            : "border-stone-200 dark:border-white/5 bg-stone-50 dark:bg-stone-950/70 text-stone-700 dark:text-stone-300 hover:border-stone-300 dark:hover:border-white/15 hover:bg-stone-100 dark:hover:bg-stone-900 hover:text-stone-900 dark:hover:text-white shadow-sm"
        } ${buttonClassName}`}
      >
        <span className="flex items-center gap-2.5 text-xs font-semibold flex-1 min-w-0">
          <CalendarIcon
            size={15}
            className={`shrink-0 transition-colors ${
              isOpen || isSelected
                ? "text-amber-500"
                : "text-amber-600 dark:text-amber-500/80 group-hover:text-amber-500"
            }`}
          />
          <span
            className={`truncate font-bold tracking-tight ${
              isSelected ? "text-stone-900 dark:text-white" : "text-stone-400"
            }`}
          >
            {formatDisplayDate(value)}
          </span>
        </span>

        {isSelected && !required ? (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            className="flex items-center justify-center w-5 h-5 shrink-0 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 hover:bg-rose-50 dark:hover:bg-red-500/20 hover:text-rose-600 dark:hover:text-red-400 transition-colors cursor-pointer"
            title="Hapus tanggal"
          >
            <X size={12} strokeWidth={2.5} />
          </span>
        ) : (
          <span
            className={`flex items-center justify-center w-5 h-5 shrink-0 rounded-full transition-colors ${
              isOpen
                ? "bg-amber-500 text-stone-950"
                : "bg-stone-200 dark:bg-stone-800 text-stone-500 group-hover:text-stone-700 dark:group-hover:text-stone-300"
            }`}
          >
            <CalendarIcon size={11} />
          </span>
        )}
      </button>

      {/* Custom Framer Motion Calendar Popup Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
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
              scale: 0.95,
              y: -6,
              transition: { duration: 0.12, ease: "easeOut" },
            }}
            className="absolute left-0 top-full mt-2 z-[80] w-72"
            style={{ transformOrigin: "top left" }}
          >
            <div className="w-full rounded-2xl border border-stone-200 dark:border-white/10 bg-white/98 dark:bg-stone-900/98 backdrop-blur-2xl p-4 shadow-xl dark:shadow-[0_25px_50px_rgba(0,0,0,0.85)] ring-1 ring-stone-900/5 dark:ring-black/80 space-y-3.5">
              {/* Header: Month, Year & Nav Controls */}
              <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-white/5">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black text-stone-900 dark:text-white uppercase italic tracking-wider">
                    {MONTH_NAMES_ID[currentMonth]}{" "}
                    <span className="text-amber-500 font-bold not-italic">{currentYear}</span>
                  </h4>
                  <p className="text-[9px] font-bold text-stone-500 uppercase tracking-widest">
                    Pilih Tanggal
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-950/70 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white border border-stone-200 dark:border-white/5 transition-colors cursor-pointer"
                    title="Bulan Sebelumnya"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-950/70 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white border border-stone-200 dark:border-white/5 transition-colors cursor-pointer"
                    title="Bulan Berikutnya"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* Weekday Labels */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {DAY_NAMES_ID.map((day) => (
                  <span
                    key={day}
                    className="text-[10px] font-black uppercase tracking-wider text-stone-400 dark:text-stone-500"
                  >
                    {day}
                  </span>
                ))}
              </div>

              {/* Day Grid */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {/* Previous month filler days */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div
                    key={`prev-${i}`}
                    className="h-8 flex items-center justify-center text-xs font-semibold text-stone-300 dark:text-stone-700 select-none"
                  >
                    {daysInPrevMonth - firstDayOfWeek + i + 1}
                  </div>
                ))}

                {/* Current month days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const selected = isSelectedDate(day);
                  const todayCheck = isToday(day);

                  return (
                    <button
                      key={`day-${day}`}
                      type="button"
                      onClick={() => handleSelectDate(day)}
                      className={`h-8 w-full rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center relative ${
                        selected
                          ? "bg-amber-500 text-stone-950 font-black shadow-md shadow-amber-500/30 scale-105 z-10"
                          : todayCheck
                          ? "bg-amber-50 dark:bg-stone-800 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-500/40 hover:bg-amber-100 dark:hover:bg-stone-700"
                          : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/10 hover:text-stone-900 dark:hover:text-white"
                      }`}
                    >
                      {day}
                      {todayCheck && !selected && (
                        <div className="absolute bottom-1 w-1 h-1 rounded-full bg-amber-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Footer: Quick Actions */}
              <div className="flex items-center justify-between pt-2.5 border-t border-stone-100 dark:border-white/5 text-[11px] font-bold">
                {!required ? (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="flex items-center gap-1 text-stone-500 dark:text-stone-400 hover:text-rose-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <RotateCcw size={12} />
                    <span>Reset</span>
                  </button>
                ) : (
                  <span />
                )}

                <button
                  type="button"
                  onClick={handleSelectToday}
                  className="px-3 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 transition-colors cursor-pointer"
                >
                  Hari Ini
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
