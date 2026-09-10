"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  X,
  Filter,
  Briefcase,
  RefreshCw,
  Send,
  LayoutGrid,
  List,
  Clock,
  Layers,
  Building2,
} from "lucide-react";
import { CustomDropdown, DropdownOption } from "@/app/components/ui/CustomDropdown";
import { CustomDatePicker } from "@/app/components/ui/CustomDatePicker";
import { LocationRoom } from "../../types/item.types";
import { usePurposes } from "../hooks/usePurposes";
import { useStatuses } from "../hooks/useStatuses";

interface OutgoingFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedPurpose: string;
  onPurposeChange: (purpose: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  selectedLocation: string;
  onLocationChange: (loc: string) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  viewMode: "grid" | "table";
  onViewModeChange: (mode: "grid" | "table") => void;
  onAddClick: () => void;
  locations: LocationRoom[];
}

export const OutgoingFilters: React.FC<OutgoingFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedPurpose,
  onPurposeChange,
  selectedStatus,
  onStatusChange,
  selectedLocation,
  onLocationChange,
  selectedDate,
  onDateChange,
  viewMode,
  onViewModeChange,
  onAddClick,
  locations,
}) => {
  const { purposes } = usePurposes();
  const { statuses } = useStatuses();
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  const statusOptions: DropdownOption[] = [
    { value: "all", label: "Semua Status", icon: Filter },
    ...statuses.map((s) => ({
      value: s.name,
      label: s.name,
      icon: s.name.includes("Pinjam") ? Clock : s.name.includes("Servis") ? RefreshCw : Send,
    })),
  ];

  const purposeTabs = [
    { id: "all", label: "Semua Distribusi", icon: Layers },
    ...purposes.map((p) => ({
      id: p.name,
      label: p.name,
      icon: p.name.includes("Audit") ? Briefcase : p.name.includes("Servis") ? RefreshCw : Send,
    })),
  ];

  const isFiltered =
    searchQuery.trim() !== "" ||
    selectedPurpose !== "all" ||
    selectedStatus !== "all" ||
    selectedLocation !== "all" ||
    selectedDate !== "";

  const handleReset = () => {
    onSearchChange("");
    onPurposeChange("all");
    onStatusChange("all");
    onLocationChange("all");
    onDateChange("");
  };

  const locationOptions: DropdownOption[] = [
    { value: "all", label: "Semua Ruangan", icon: Building2 },
    ...locations.map((loc) => ({
      value: loc.name,
      label: loc.name,
      icon: Building2,
    })),
  ];

  return (
    <div className="bg-white dark:bg-stone-900/70 backdrop-blur-xl p-4 sm:p-5 rounded-[2rem] border border-stone-200/80 dark:border-white/5 shadow-sm dark:shadow-2xl space-y-4 mb-6 relative z-30 transition-colors">
      {/* Top Row: Search, Dropdowns, Date Picker, View Mode Toggle & Add Button */}
      <div className="flex flex-col xl:flex-row gap-3 items-stretch xl:items-center justify-between">
        {/* Left: Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500" size={17} />
          <input
            type="text"
            placeholder="Cari no bukti, barang, penerima, atau ruangan..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-stone-100 dark:bg-stone-950/60 border border-stone-200 dark:border-white/5 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 transition-all outline-none text-xs sm:text-sm text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-600 shadow-inner"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700 dark:text-stone-500 dark:hover:text-white hover:bg-stone-200 dark:hover:bg-stone-800 rounded-full transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Center: Dropdown Filters & Custom Date Picker */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Dropdown */}
          <CustomDropdown
            value={selectedStatus}
            onChange={onStatusChange}
            options={statusOptions}
            placeholder="Status Distribusi"
            className="w-44"
          />

          {/* Ruangan Dropdown */}
          <CustomDropdown
            value={selectedLocation}
            onChange={onLocationChange}
            options={locationOptions}
            placeholder="Pilih Ruangan"
            className="w-48"
          />

          {/* Custom Date Picker */}
          <CustomDatePicker
            value={selectedDate}
            onChange={onDateChange}
            placeholder="Semua Tanggal"
            className="w-44"
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

        {/* Right: View Mode Toggle & + Catat Barang Keluar Button */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Grid vs Table View Switcher */}
          <div className="flex items-center bg-stone-100 dark:bg-stone-950/70 p-1 rounded-2xl border border-stone-200 dark:border-white/5 shadow-inner">
            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-amber-500 text-stone-950 shadow-md font-bold"
                  : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200 dark:hover:bg-stone-800"
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
                  : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200 dark:hover:bg-stone-800"
              }`}
              title="Tampilan Tabel Data"
            >
              <List size={16} />
            </button>
          </div>

          {/* + Catat Barang Keluar Button */}
          <button
            type="button"
            onClick={onAddClick}
            className="flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 px-5 py-3 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider shrink-0 cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            <Plus size={18} strokeWidth={3} />
            <span>Catat Barang Keluar</span>
          </button>
        </div>
      </div>

      {/* Bottom Row: Animated Horizontal Purpose Tabs (Matching Data Barang Design) */}
      <div className="pt-2 border-t border-stone-200/80 dark:border-white/5 flex items-center justify-between overflow-x-auto scrollbar-hide py-1">
        <div className="flex items-center gap-1.5 min-w-max p-1 bg-stone-100 dark:bg-stone-950/40 rounded-2xl border border-stone-200/80 dark:border-white/5">
          {purposeTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = selectedPurpose === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onPurposeChange(tab.id)}
                onMouseEnter={() => setHoveredTab(tab.id)}
                onMouseLeave={() => setHoveredTab(null)}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  isActive ? "text-stone-950 font-black" : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
                }`}
              >
                {/* Active Sliding Glowing Pill */}
                {isActive && (
                  <motion.div
                    layoutId="activePurposeTab"
                    className="absolute inset-0 bg-amber-500 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.35)]"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}

                {/* Hover Background Pill */}
                {!isActive && hoveredTab === tab.id && (
                  <motion.div
                    layoutId="hoverPurposeTab"
                    className="absolute inset-0 bg-stone-200/70 dark:bg-white/5 rounded-xl"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}

                <span className="relative z-10 flex items-center gap-2">
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
