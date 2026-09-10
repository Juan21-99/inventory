"use client";

import React, { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownToLine,
  Boxes,
  Calendar,
  DollarSign,
  Plus,
} from "lucide-react";
import { useIncoming } from "./hooks/useIncoming";
import { useItems } from "../gudang/hooks/useItems";
import { useLocations } from "../gudang/hooks/useLocations";
import { IncomingFilters } from "./components/IncomingFilters";
import { IncomingTable } from "./components/IncomingTable";
import { IncomingCard } from "./components/IncomingCard";
import { IncomingFormModal } from "./components/IncomingFormModal";
import { IncomingDetailModal } from "./components/IncomingDetailModal";
import { DeleteConfirmationModal } from "../gudang/components/DeleteConfirmationModal";
import { IncomingTransaction, IncomingFormData } from "../types/incoming.types";

export default function IncomingGoodsPage() {
  const { incoming, loading, addIncoming, deleteIncoming } = useIncoming();
  const { items } = useItems();
  const { locations } = useLocations();

  // View Mode: "grid" vs "table"
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [detailTx, setDetailTx] = useState<IncomingTransaction | null>(null);
  const [deleteTargetTx, setDeleteTargetTx] = useState<IncomingTransaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Statistics Computations
  const stats = useMemo(() => {
    const totalTransactions = incoming.length;
    const totalUnits = incoming.reduce((sum, tx) => sum + (tx.quantity || 0), 0);
    const totalValue = incoming.reduce((sum, tx) => sum + (tx.total_price || 0), 0);

    const todayStr = new Date().toISOString().split("T")[0];
    const todayTransactions = incoming.filter((tx) => tx.date === todayStr).length;

    return {
      totalTransactions,
      totalUnits,
      totalValue,
      todayTransactions,
    };
  }, [incoming]);

  // Filtered Transactions
  const filteredIncoming = useMemo(() => {
    return incoming.filter((tx) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        tx.transaction_number.toLowerCase().includes(q) ||
        tx.item_name.toLowerCase().includes(q) ||
        tx.item_code.toLowerCase().includes(q) ||
        tx.supplier.toLowerCase().includes(q) ||
        tx.received_by.toLowerCase().includes(q) ||
        (tx.document_number && tx.document_number.toLowerCase().includes(q));

      const matchesSource = selectedSource === "all" || tx.source === selectedSource;
      const matchesDate = selectedDate === "" || tx.date === selectedDate;

      return matchesSearch && matchesSource && matchesDate;
    });
  }, [incoming, searchQuery, selectedSource, selectedDate]);

  const handleFormSubmit = async (formData: IncomingFormData) => {
    await addIncoming(formData);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetTx) return;
    try {
      setIsDeleting(true);
      await deleteIncoming(deleteTargetTx.id);
      setDeleteTargetTx(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Top KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Transaksi Masuk */}
        <div className="p-4 sm:p-5 rounded-[1.8rem] bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-white/5 shadow-sm dark:shadow-xl backdrop-blur-md relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Total Penerimaan
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ArrowDownToLine size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight">
              {stats.totalTransactions}
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400 ml-1.5 font-medium">Transaksi</span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-500/80 mt-1">
            Log pengadaan & BAST
          </p>
        </div>

        {/* Total Unit Diterima */}
        <div className="p-4 sm:p-5 rounded-[1.8rem] bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-white/5 shadow-sm dark:shadow-xl backdrop-blur-md relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Total Unit Diterima
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Boxes size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-amber-400 tracking-tight">
              {stats.totalUnits}
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400 ml-1.5 font-medium">Unit Fisik</span>
          </div>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
            Ditambahkan ke inventaris
          </p>
        </div>

        {/* Total Nilai Masuk */}
        <div className="p-4 sm:p-5 rounded-[1.8rem] bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-white/5 shadow-sm dark:shadow-xl backdrop-blur-md relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Akumulasi Nilai
            </span>
            <div className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-white/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="mt-3 truncate">
            <span className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white tracking-tight">
              Rp {stats.totalValue > 1000000 ? `${(stats.totalValue / 1000000).toFixed(1)}Jt` : stats.totalValue.toLocaleString("id-ID")}
            </span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1 truncate">
            Rp {stats.totalValue.toLocaleString("id-ID")}
          </p>
        </div>

        {/* Penerimaan Hari Ini */}
        <div className="p-4 sm:p-5 rounded-[1.8rem] bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-white/5 shadow-sm dark:shadow-xl backdrop-blur-md relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Masuk Hari Ini
            </span>
            <div className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-white/10 flex items-center justify-center text-stone-700 dark:text-stone-300">
              <Calendar size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight">
              {stats.todayTransactions}
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400 ml-1.5 font-medium">Transaksi</span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            Status terkini hari ini
          </p>
        </div>
      </div>

      {/* 2. Filter & Toolbar Bar with Grid/Table Switcher */}
      <IncomingFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedSource={selectedSource}
        onSourceChange={setSelectedSource}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onAddClick={() => setIsFormOpen(true)}
      />

      {/* 3. Dynamic View: Grid vs Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-stone-500">
          <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4" />
          <p className="text-sm font-medium">Memuat data barang masuk...</p>
        </div>
      ) : filteredIncoming.length === 0 ? (
        <div className="p-12 text-center rounded-[2rem] bg-white dark:bg-stone-900/40 border border-stone-200/80 dark:border-white/5 shadow-sm dark:shadow-xl flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400 dark:text-stone-600">
            <ArrowDownToLine size={32} />
          </div>
          <div className="space-y-1 max-w-sm">
            <h3 className="text-lg font-bold text-stone-900 dark:text-white">Tidak ada transaksi ditemukan</h3>
            <p className="text-xs text-stone-500">
              {searchQuery || selectedSource !== "all" || selectedDate !== ""
                ? "Tidak ada data barang masuk yang cocok dengan kriteria filter."
                : "Belum ada transaksi barang masuk yang dicatat."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-stone-950 text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-amber-400 transition-all cursor-pointer"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Catat Barang Masuk Pertama</span>
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID CARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredIncoming.map((tx) => (
              <IncomingCard
                key={tx.id}
                transaction={tx}
                onDetail={setDetailTx}
                onDelete={setDeleteTargetTx}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* TABLE DATA VIEW */
        <IncomingTable
          transactions={filteredIncoming}
          onDetail={setDetailTx}
          onDelete={setDeleteTargetTx}
        />
      )}

      {/* 4. Modals */}
      {/* Form Modal */}
      <IncomingFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        items={items}
        locations={locations}
      />

      {/* Detail / BAST Modal */}
      <IncomingDetailModal
        isOpen={!!detailTx}
        onClose={() => setDetailTx(null)}
        transaction={detailTx}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deleteTargetTx}
        onClose={() => setDeleteTargetTx(null)}
        onConfirm={handleConfirmDelete}
        item={
          deleteTargetTx
            ? {
              id: deleteTargetTx.id,
              code: deleteTargetTx.transaction_number,
              name: `Transaksi Penerimaan ${deleteTargetTx.item_name}`,
              category: deleteTargetTx.category,
              stock: deleteTargetTx.quantity,
              unit: deleteTargetTx.unit,
              condition: "Baik",
              location: deleteTargetTx.target_location,
              person_in_charge: deleteTargetTx.received_by,
              received_at: deleteTargetTx.date,
            }
            : null
        }
        loading={isDeleting}
      />
    </div>
  );
}
