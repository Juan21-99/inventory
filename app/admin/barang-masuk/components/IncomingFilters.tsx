"use client";

import React from "react";
import {
  Search,
  Plus,
  X,
  Filter,
  Truck,
  FileText,
  LayoutGrid,
  List,
} from "lucide-react";
import { CustomDropdown, DropdownOption } from "@/app/components/ui/CustomDropdown";
import { CustomDatePicker } from "@/app/components/ui/CustomDatePicker";
import { useSources } from "../hooks/useSources";

interface IncomingFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedSource: string;
  onSourceChange: (source: string) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  viewMode: "grid" | "table";
  onViewModeChange: (mode: "grid" | "table") => void;
  onAddClick: () => void;
}

export const IncomingFilters: React.FC<IncomingFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedSource,
  onSourceChange,
  selectedDate,
  onDateChange,
  viewMode,
  onViewModeChange,
  onAddClick,
}) => {
  const { sources } = useSources();

  const sourceOptions: DropdownOption[] = [
    { value: "all", label: "Semua Sumber Pengadaan", icon: Filter },
    ...sources.map((s) => ({
      value: s.name,
      label: s.name,
      icon: s.name.includes("APBD") || s.name.includes("Langsung") ? FileText : Truck,
    })),
  ];
  const isFiltered = searchQuery.trim() !== "" || selectedSource !== "all" || selectedDate !== "";

  const handleReset = () => {
    onSearchChange("");
    onSourceChange("all");
    onDateChange("");
  };

  return (
    <div className="bg-white dark:bg-stone-900/70 backdrop-blur-xl p-4 sm:p-5 rounded-[2rem] border border-stone-200/80 dark:border-white/5 shadow-sm dark:shadow-2xl space-y-4 mb-6 relative z-30">
      <div className="flex flex-col xl:flex-row gap-3 items-stretch xl:items-center justify-between">
        {/* Left: Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500" size={17} />
          <input
            type="text"
            placeholder="Cari no transaksi, barang, rekanan, atau penerima..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-stone-50 dark:bg-stone-950/60 border border-stone-200/80 dark:border-white/5 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 transition-all outline-none text-xs sm:text-sm text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-600 shadow-inner"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-800 dark:hover:text-white hover:bg-stone-200 dark:hover:bg-stone-800 rounded-full transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Center: Dropdown Source & Custom Date Picker */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Sumber Pengadaan Dropdown */}
          <CustomDropdown
            value={selectedSource}
            onChange={onSourceChange}
            options={sourceOptions}
            placeholder="Sumber Pengadaan"
            className="w-56"
          />

          {/* Custom Date Picker */}
          <CustomDatePicker
            value={selectedDate}
            onChange={onDateChange}
            placeholder="Semua Tanggal"
            className="w-48"
          />

          {/* Reset Filter Button */}
          {isFiltered && (
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 px-2 py-1 transition-colors cursor-pointer"
            >
              <X size={13} /> Reset
            </button>
          )}
        </div>

        {/* Right: View Mode Toggle & + Catat Barang Masuk Button */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Grid vs Table View Switcher */}
          <div className="flex items-center bg-stone-100 dark:bg-stone-950/70 p-1 rounded-2xl border border-stone-200/60 dark:border-white/5 shadow-inner">
            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-amber-500 text-stone-950 shadow-md font-bold"
                  : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white hover:bg-stone-200 dark:hover:bg-stone-800"
              }`}
              title="Tampilan Grid Kartu"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("table")}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-amber-500 text-stone-950 shadow-md font-bold"
                  : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white hover:bg-stone-200 dark:hover:bg-stone-800"
              }`}
              title="Tampilan Tabel Data"
            >
              <List size={16} />
            </button>
          </div>

          {/* + Catat Barang Masuk Button */}
          <button
            type="button"
            onClick={onAddClick}
            className="flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 px-5 py-3 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider shrink-0 cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            <Plus size={18} strokeWidth={3} />
            <span>Catat Barang Masuk</span>
          </button>
        </div>
      </div>
    </div>
  );
};
