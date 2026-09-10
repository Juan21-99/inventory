import { motion } from "framer-motion";
import { useState } from "react";
import {
  Search,
  Store,
  Package,
  Truck,
  CheckCircle2,
  X,
  XCircle,
} from "lucide-react";

interface DeliveryFiltersProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const DELIVERY_STATUSES = [
  { id: "all", label: "Semua", icon: Store },
  { id: "processing", label: "Perlu Dikirim", icon: Package },
  { id: "ready", label: "Sedang Diantar", icon: Truck },
  { id: "completed", label: "Selesai", icon: CheckCircle2 },
  { id: "cancelled", label: "Dibatalkan", icon: XCircle },
];

export const DeliveryFilters = ({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
}: DeliveryFiltersProps) => {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  const getTabButtonClass = (tabId: string) => {
    if (activeTab === tabId) return "text-white";
    if (hoveredTab === tabId) return "text-white";
    return "text-stone-400";
  };

  return (
    <div className="bg-stone-900/60 backdrop-blur-xl p-4 rounded-[2rem] shadow-sm border border-white/5 mb-6 sticky top-2 z-10 transition-all">
      <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
        {/* Status Tabs */}
        {/* eslint-disable-next-line jsx-a11y/mouse-events-have-key-events */}
        <div
          className="relative flex gap-1 p-1 bg-stone-950/50 rounded-2xl w-full xl:w-auto overflow-x-auto scrollbar-hide border border-white/5"
          onMouseLeave={() => setHoveredTab(null)}
        >
          {DELIVERY_STATUSES.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              onMouseEnter={() => setHoveredTab(tab.id)}
              className="relative z-10 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap cursor-pointer transition-colors"
              type="button"
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="delivery-toolbar-active-tab"
                  className="absolute inset-0 bg-stone-800 rounded-xl border border-white/10 shadow-lg"
                  style={{
                    willChange: "transform",
                    transform: "translateZ(0)",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              {hoveredTab === tab.id && activeTab !== tab.id && (
                <motion.div
                  layoutId="delivery-toolbar-hover-tab"
                  className="absolute inset-0 bg-stone-800/50 rounded-xl"
                  style={{
                    willChange: "transform",
                    transform: "translateZ(0)",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span
                className={`relative z-10 flex items-center gap-2 ${getTabButtonClass(
                  tab.id,
                )}`}
              >
                <tab.icon
                  size={16}
                  className={
                    activeTab === tab.id
                      ? `text-amber-500 ${tab.id === "ready" ? "animate-bounce" : ""}`
                      : ""
                  }
                />
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full xl:w-80">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500"
            size={18}
          />
          <input
            type="text"
            placeholder="Cari nama / alamat..."
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
      </div>
    </div>
  );
};
