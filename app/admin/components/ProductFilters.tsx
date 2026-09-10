import { motion } from "framer-motion";
import { useState } from "react";
import {
  Coffee,
  CupSoda,
  UtensilsCrossed,
  Store,
  Search,
  Plus,
  X,
  Settings2,
} from "lucide-react";
import { Category } from "../products/hooks/useCategories";

interface ProductFiltersProps {
  categories: Category[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddClick: () => void;
  onManageCategoriesClick: () => void;
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

export const ProductFilters = ({
  categories,
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  onAddClick,
  onManageCategoriesClick,
}: ProductFiltersProps) => {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  const getTabButtonClass = (tabId: string) => {
    if (activeTab === tabId) return "text-white";
    if (hoveredTab === tabId) return "text-stone-700";
    return "text-stone-500";
  };

  return (
    <div className="bg-stone-900/60 backdrop-blur-md p-4 rounded-[2rem] shadow-sm border border-white/5 mb-6 sticky top-2 z-10 transition-all">
      <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
        {/* Categories */}
        <div className="flex items-center gap-2 w-full xl:w-auto">
          <div
            className="relative flex gap-1 p-1 bg-stone-950/50 rounded-2xl flex-1 xl:flex-none overflow-x-auto scrollbar-hide border border-white/5"
            onMouseLeave={() => setHoveredTab(null)}
          >
            {/* Hardcoded "Semua" Tab */}
            <button
              key="all"
              onClick={() => onTabChange("all")}
              onMouseEnter={() => setHoveredTab("all")}
              className="relative z-10 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap cursor-pointer"
              type="button"
            >
              {activeTab === "all" && (
                <motion.div
                  layoutId="toolbar-active-tab"
                  className="absolute inset-0 bg-stone-800 rounded-xl border border-white/10 shadow-lg"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span
                className={`relative z-10 flex items-center gap-2 ${getTabButtonClass("all")}`}
              >
                <Store
                  size={16}
                  className={activeTab === "all" ? "text-amber-500" : ""}
                />
                Semua
              </span>
            </button>

            {/* Dynamic database categories */}
            {categories.map((tab) => {
              const Icon = getCategoryIcon(tab.name);
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.name)}
                  onMouseEnter={() => setHoveredTab(tab.name)}
                  className="relative z-10 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap cursor-pointer"
                  type="button"
                >
                  {activeTab === tab.name && (
                    <motion.div
                      layoutId="toolbar-active-tab"
                      className="absolute inset-0 bg-stone-800 rounded-xl border border-white/10 shadow-lg"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <span
                    className={`relative z-10 flex items-center gap-2 ${getTabButtonClass(tab.name)}`}
                  >
                    <Icon
                      size={16}
                      className={activeTab === tab.name ? "text-amber-500" : ""}
                    />
                    {tab.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Manage Categories Button */}
          <button
            onClick={onManageCategoriesClick}
            className="p-3.5 bg-stone-900 border border-white/5 rounded-2xl text-stone-500 hover:text-white hover:border-white/10 transition-all cursor-pointer shadow-lg active:scale-95 group"
            title="Kelola Kategori"
            type="button"
          >
            <Settings2
              size={18}
              className="group-hover:rotate-90 transition-transform duration-500"
            />
          </button>
        </div>

        {/* Right Side: Search & Add Button */}
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500"
              size={18}
            />
            <input
              type="text"
              placeholder="Cari menu..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-11 pr-10 py-3 bg-stone-950 border border-white/5 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 transition-all outline-none font-medium text-white placeholder:text-stone-600 shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-500 hover:text-white hover:bg-stone-800 rounded-full transition-colors cursor-pointer"
                type="button"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Add Button */}
          <button
            onClick={onAddClick}
            className="flex items-center justify-center gap-2 bg-amber-500 text-stone-950 px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wide hover:bg-amber-400 shrink-0 cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            type="button"
          >
            <Plus size={18} strokeWidth={2.5} />
            <span className="hidden sm:inline">Tambah</span>
          </button>
        </div>
      </div>
    </div>
  );
};
