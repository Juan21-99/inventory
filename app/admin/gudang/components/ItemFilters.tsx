"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  X,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Boxes,
  Laptop,
  Armchair,
  Eye,
  Car,
  FileText,
  Building2,
  Filter,
  ShieldCheck,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { Category, LocationRoom } from "../../types/item.types";
import { CustomDropdown, DropdownOption } from "@/app/components/ui/CustomDropdown";

interface ItemFiltersProps {
  categories: Category[];
  locations: LocationRoom[];
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
  selectedCondition: string;
  onConditionChange: (cond: string) => void;
  selectedLocation: string;
  onLocationChange: (loc: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: "grid" | "table";
  onViewModeChange: (mode: "grid" | "table") => void;
  onAddClick: () => void;
  onManageCategoriesClick: () => void;
}

const getCategoryIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("elektronik") || n.includes("komputer") || n.includes("laptop")) return Laptop;
  if (n.includes("furnitur") || n.includes("mebel") || n.includes("kursi") || n.includes("meja")) return Armchair;
  if (n.includes("pengawasan") || n.includes("audit") || n.includes("kamera")) return Eye;
  if (n.includes("kendaraan") || n.includes("mobil") || n.includes("motor")) return Car;
  if (n.includes("atk") || n.includes("kertas") || n.includes("logistik")) return FileText;
  return Boxes;
};

export const ItemFilters: React.FC<ItemFiltersProps> = ({
  categories,
  locations,
  activeCategory,
  onCategoryChange,
  selectedCondition,
  onConditionChange,
  selectedLocation,
  onLocationChange,
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onAddClick,
  onManageCategoriesClick,
}) => {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  const isFiltered =
    activeCategory !== "all" ||
    selectedCondition !== "all" ||
    selectedLocation !== "all" ||
    searchQuery.trim() !== "";

  const handleResetFilters = () => {
    onCategoryChange("all");
    onConditionChange("all");
    onLocationChange("all");
    onSearchChange("");
  };

  // Condition Options for CustomDropdown
  const conditionOptions: DropdownOption[] = [
    { value: "all", label: "Semua Kondisi", icon: Filter },
    { value: "Baik", label: "Kondisi Baik", icon: ShieldCheck, color: "text-emerald-400" },
    { value: "Rusak Ringan", label: "Rusak Ringan", icon: AlertTriangle, color: "text-amber-400" },
    { value: "Rusak Berat", label: "Rusak Berat", icon: XCircle, color: "text-red-400" },
  ];

  // Location Options for CustomDropdown
  const locationOptions: DropdownOption[] = [
    { value: "all", label: "Semua Ruangan", icon: Building2 },
    ...locations.map((loc) => ({
      value: loc.name,
      label: loc.name,
      icon: Building2,
    })),
  ];

  return (
    <div className="space-y-4 mb-6 relative z-30">
      {/* Top Filter Container */}
      <div className="bg-white dark:bg-stone-900/70 backdrop-blur-xl p-4 sm:p-5 rounded-[2rem] border border-stone-200/80 dark:border-white/5 shadow-sm dark:shadow-2xl space-y-4 relative z-30">
        {/* Row 1: Category Scrollable Tabs + Add & Category Action */}
        <div className="flex flex-col xl:flex-row gap-3 justify-between items-start xl:items-center">
          <div className="flex items-center gap-2 w-full xl:w-auto overflow-hidden">
            {/* Category Tabs Container */}
            <div
              className="relative flex gap-1 p-1 bg-stone-100 dark:bg-stone-950/60 rounded-2xl flex-1 xl:flex-none overflow-x-auto scrollbar-none border border-stone-200/60 dark:border-white/5"
              onMouseLeave={() => setHoveredTab(null)}
            >
              {/* "Semua Kategori" Tab */}
              <button
                type="button"
                onClick={() => onCategoryChange("all")}
                onMouseEnter={() => setHoveredTab("all")}
                className="relative z-10 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap cursor-pointer transition-colors"
              >
                {activeCategory === "all" && (
                  <motion.div
                    layoutId="item-category-tab"
                    className="absolute inset-0 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-white/10 shadow-sm dark:shadow-lg"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span
                  className={`relative z-10 flex items-center gap-2 ${
                    activeCategory === "all" ? "text-stone-900 dark:text-white" : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                  }`}
                >
                  <Boxes size={16} className={activeCategory === "all" ? "text-amber-500" : ""} />
                  Semua Aset
                </span>
              </button>

              {/* Dynamic Categories */}
              {categories.map((cat) => {
                const Icon = getCategoryIcon(cat.name);
                const isActive = activeCategory === cat.name;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onCategoryChange(cat.name)}
                    onMouseEnter={() => setHoveredTab(cat.name)}
                    className="relative z-10 flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap cursor-pointer transition-colors"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="item-category-tab"
                        className="absolute inset-0 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-white/10 shadow-sm dark:shadow-lg"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span
                      className={`relative z-10 flex items-center gap-2 ${
                        isActive ? "text-stone-900 dark:text-white" : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                      }`}
                    >
                      <Icon size={15} className={isActive ? "text-amber-500" : ""} />
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Manage Categories Button */}
            <button
              type="button"
              onClick={onManageCategoriesClick}
              className="p-3 bg-stone-100 dark:bg-stone-950/60 border border-stone-200/60 dark:border-white/5 rounded-2xl text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:border-stone-300 dark:hover:border-white/15 transition-all cursor-pointer shrink-0 shadow-sm dark:shadow-lg"
              title="Kelola Kategori Barang"
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>

          {/* Right Action: Add Item Button */}
          <button
            type="button"
            onClick={onAddClick}
            className="w-full xl:w-auto flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 px-6 py-3 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider shrink-0 cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            <Plus size={18} strokeWidth={3} />
            <span>Tambah Barang</span>
          </button>
        </div>

        {/* Row 2: Search + Custom Animated Dropdowns + View Mode Switcher */}
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between pt-2 border-t border-stone-100 dark:border-white/5">
          {/* Left: Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500" size={17} />
            <input
              type="text"
              placeholder="Cari nama, kode barang, ruangan, atau nama PJ..."
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

          {/* Center: Custom Animated Dropdowns for Condition & Location */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Condition Custom Dropdown */}
            <CustomDropdown
              value={selectedCondition}
              onChange={onConditionChange}
              options={conditionOptions}
              placeholder="Semua Kondisi"
              className="w-44"
            />

            {/* Location Custom Dropdown */}
            <CustomDropdown
              value={selectedLocation}
              onChange={onLocationChange}
              options={locationOptions}
              placeholder="Semua Ruangan"
              className="w-48"
            />

            {/* Reset Filters Pill */}
            {isFiltered && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 px-2 py-1 transition-colors cursor-pointer"
              >
                <X size={13} /> Reset
              </button>
            )}
          </div>

          {/* Right: Grid vs Table View Mode Switcher */}
          <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-950/60 p-1 rounded-xl border border-stone-200/60 dark:border-white/5 shrink-0 self-end lg:self-auto">
            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white dark:bg-stone-800 text-amber-600 dark:text-amber-500 shadow-sm"
                  : "text-stone-500 hover:text-stone-800 dark:hover:text-stone-300"
              }`}
              title="Tampilan Grid Kartu"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("table")}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-white dark:bg-stone-800 text-amber-600 dark:text-amber-500 shadow-sm"
                  : "text-stone-500 hover:text-stone-800 dark:hover:text-stone-300"
              }`}
              title="Tampilan Tabel Data"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
