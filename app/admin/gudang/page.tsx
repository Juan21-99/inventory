"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Boxes,
  ShieldCheck,
  AlertTriangle,
  PackageX,
  Search,
  Plus,
  ArrowUpDown,
  FileSpreadsheet,
} from "lucide-react";
import { useItems } from "./hooks/useItems";
import { useCategories } from "./hooks/useCategories";
import { useLocations } from "./hooks/useLocations";
import { useIncoming } from "../barang-masuk/hooks/useIncoming";
import { useOutgoing } from "../barang-keluar/hooks/useOutgoing";
import { ItemFilters } from "./components/ItemFilters";
import { ItemCard } from "./components/ItemCard";
import { ItemTable } from "./components/ItemTable";
import { ItemFormModal } from "./components/ItemFormModal";
import { ItemDetailModal } from "./components/ItemDetailModal";
import { DeleteConfirmationModal } from "./components/DeleteConfirmationModal";
import { CategoryManagementModal } from "./components/CategoryManagementModal";
import { InventoryItem, ItemFormData } from "../types/item.types";

export default function ProductsPage() {
  const { items, loading, addItem, updateItem, deleteItem } = useItems();
  const { categories, addCategory, deleteCategory } = useCategories();
  const { locations } = useLocations();
  const { incoming } = useIncoming();
  const { outgoing } = useOutgoing();

  // Filter States
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedCondition, setSelectedCondition] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [detailItem, setDetailItem] = useState<InventoryItem | null>(null);
  const [deleteTargetItem, setDeleteTargetItem] = useState<InventoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Statistics Computations
  const stats = useMemo(() => {
    const total = items.length;
    const good = items.filter((i) => i.condition === "Baik").length;
    const damagedLight = items.filter((i) => i.condition === "Rusak Ringan").length;
    const damagedHeavy = items.filter((i) => i.condition === "Rusak Berat").length;
    const lowStock = items.filter((i) => i.stock <= 2).length;
    
    // Pemetaan akumulasi barang keluar
    const outgoingMap = outgoing.reduce<Record<string, number>>((acc, tx) => {
      const key = tx.item_id || tx.item_code;
      if (key) {
        acc[key] = (acc[key] || 0) + (tx.quantity || 0);
      }
      return acc;
    }, {});

    const warehouseUnits = items.reduce((sum, i) => sum + (i.stock || 0), 0);
    const distributedUnits = outgoing.reduce((sum, tx) => sum + (tx.quantity || 0), 0);
    const totalUnits = warehouseUnits + distributedUnits;

    return {
      total,
      good,
      damaged: damagedLight + damagedHeavy,
      lowStock,
      warehouseUnits,
      distributedUnits,
      totalUnits,
    };
  }, [items, outgoing]);

  // Filtered Items Computation
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.person_in_charge.toLowerCase().includes(q) ||
        (item.notes && item.notes.toLowerCase().includes(q));

      const matchesCategory =
        activeCategory === "all" || item.category === activeCategory;

      const matchesCondition =
        selectedCondition === "all" || item.condition === selectedCondition;

      const matchesLocation =
        selectedLocation === "all" || item.location === selectedLocation;

      return matchesSearch && matchesCategory && matchesCondition && matchesLocation;
    });
  }, [items, searchQuery, activeCategory, selectedCondition, selectedLocation]);

  // Handlers
  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (formData: ItemFormData) => {
    if (editingItem) {
      await updateItem(editingItem.id, formData);
    } else {
      await addItem(formData);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetItem) return;
    try {
      setIsDeleting(true);
      await deleteItem(deleteTargetItem.id);
      setDeleteTargetItem(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Top Statistics KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Barang / Aset */}
        <div className="p-4 sm:p-5 rounded-[1.8rem] bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-white/5 shadow-sm dark:shadow-xl backdrop-blur-md relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Total Aset Terdata
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-500">
              <Boxes size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight">
              {stats.total}
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400 ml-1.5 font-medium">Barang</span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            {stats.warehouseUnits} di gudang · {stats.distributedUnits} terdistribusi
          </p>
        </div>

        {/* Kondisi Baik */}
        <div className="p-4 sm:p-5 rounded-[1.8rem] bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-white/5 shadow-sm dark:shadow-xl backdrop-blur-md relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Kondisi Baik
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {stats.good}
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400 ml-1.5 font-medium">Aset</span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-500/80 mt-1">
            {stats.total > 0 ? Math.round((stats.good / stats.total) * 100) : 0}% siap operasional
          </p>
        </div>

        {/* Rusak Ringan / Berat */}
        <div className="p-4 sm:p-5 rounded-[1.8rem] bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-white/5 shadow-sm dark:shadow-xl backdrop-blur-md relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Perlu Perbaikan
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
              {stats.damaged}
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400 ml-1.5 font-medium">Aset</span>
          </div>
          <p className="text-[11px] text-amber-600 dark:text-amber-500/80 mt-1">
            Rusak ringan / berat
          </p>
        </div>

        {/* Stok Menipis */}
        <div className="p-4 sm:p-5 rounded-[1.8rem] bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-white/5 shadow-sm dark:shadow-xl backdrop-blur-md relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-red-400">
              Stok Menipis
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-red-400">
              <PackageX size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-red-400 tracking-tight">
              {stats.lowStock}
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400 ml-1.5 font-medium">Barang</span>
          </div>
          <p className="text-[11px] text-rose-600 dark:text-red-400/80 mt-1">
            Sisa stok ≤ 2 unit
          </p>
        </div>
      </div>

      {/* 2. Interactive Filter & Toolbar Bar */}
      <ItemFilters
        categories={categories}
        locations={locations}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        selectedCondition={selectedCondition}
        onConditionChange={setSelectedCondition}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onAddClick={handleOpenAdd}
        onManageCategoriesClick={() => setIsCategoryModalOpen(true)}
      />

      {/* 3. Main Content: Grid vs Table View */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-stone-500">
          <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4" />
          <p className="text-sm font-medium">Memuat data inventaris...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        /* Empty State */
        <div className="p-12 text-center rounded-[2rem] bg-white dark:bg-stone-900/40 border border-stone-200/80 dark:border-white/5 shadow-sm dark:shadow-xl flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400 dark:text-stone-600">
            <Boxes size={32} />
          </div>
          <div className="space-y-1 max-w-sm">
            <h3 className="text-lg font-bold text-stone-900 dark:text-white">Tidak ada data barang ditemukan</h3>
            <p className="text-xs text-stone-500">
              {searchQuery || activeCategory !== "all" || selectedCondition !== "all"
                ? "Tidak ada barang yang cocok dengan kriteria pencarian atau filter yang dipilih."
                : "Belum ada data barang yang terdaftar dalam sistem inventaris."}
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-stone-950 text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-amber-400 transition-all cursor-pointer"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Tambah Barang Pertama</span>
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* Grid Cards View */
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5"
        >
          <AnimatePresence>
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <ItemCard
                  item={item}
                  onEdit={handleOpenEdit}
                  onDetail={setDetailItem}
                  onDelete={setDeleteTargetItem}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        /* Structured Table View */
        <ItemTable
          items={filteredItems}
          onEdit={handleOpenEdit}
          onDetail={setDetailItem}
          onDelete={setDeleteTargetItem}
        />
      )}

      {/* 4. Modals */}
      {/* Add / Edit Form Modal */}
      <ItemFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        editItem={editingItem}
        categories={categories}
        locations={locations}
      />

      {/* Asset Detail Identity Modal */}
      <ItemDetailModal
        isOpen={!!detailItem}
        onClose={() => setDetailItem(null)}
        item={detailItem}
        incoming={incoming}
        outgoing={outgoing}
        onEdit={(it) => {
          setDetailItem(null);
          handleOpenEdit(it);
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deleteTargetItem}
        onClose={() => setDeleteTargetItem(null)}
        onConfirm={handleConfirmDelete}
        item={deleteTargetItem}
        loading={isDeleting}
      />

      {/* Category Management Modal */}
      <CategoryManagementModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onAddCategory={addCategory}
        onDeleteCategory={deleteCategory}
      />
    </div>
  );
}
