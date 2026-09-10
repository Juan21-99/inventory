"use client";

import React, { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpFromLine,
  Boxes,
  Calendar,
  Plus,
  Clock,
} from "lucide-react";
import { useOutgoing } from "./hooks/useOutgoing";
import { useItems } from "../gudang/hooks/useItems";
import { useLocations } from "../gudang/hooks/useLocations";
import { OutgoingFilters } from "./components/OutgoingFilters";
import { OutgoingTable } from "./components/OutgoingTable";
import { OutgoingCard } from "./components/OutgoingCard";
import { OutgoingFormModal } from "./components/OutgoingFormModal";
import { OutgoingDetailModal } from "./components/OutgoingDetailModal";
import { DeleteConfirmationModal } from "../gudang/components/DeleteConfirmationModal";
import { OutgoingTransaction, OutgoingFormData } from "../types/outgoing.types";

export default function OutgoingGoodsPage() {
  const { outgoing, loading, addOutgoing, deleteOutgoing } = useOutgoing();
  const { items } = useItems();
  const { locations } = useLocations();

  // View Mode: "grid" vs "table"
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPurpose, setSelectedPurpose] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [detailTx, setDetailTx] = useState<OutgoingTransaction | null>(null);
  const [deleteTargetTx, setDeleteTargetTx] = useState<OutgoingTransaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Statistics Computations
  const stats = useMemo(() => {
    const totalTransactions = outgoing.length;
    const totalUnits = outgoing.reduce((sum, tx) => sum + (tx.quantity || 0), 0);

    const todayStr = new Date().toISOString().split("T")[0];
    const todayTransactions = outgoing.filter((tx) => tx.date === todayStr).length;

    const borrowedUnits = outgoing
      .filter((tx) => tx.status === "Dipinjam")
      .reduce((sum, tx) => sum + (tx.quantity || 0), 0);

    return {
      totalTransactions,
      totalUnits,
      todayTransactions,
      borrowedUnits,
    };
  }, [outgoing]);

  // Filtered Transactions
  const filteredOutgoing = useMemo(() => {
    return outgoing.filter((tx) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === "" ||
        tx.transaction_number.toLowerCase().includes(q) ||
        tx.item_name.toLowerCase().includes(q) ||
        tx.item_code.toLowerCase().includes(q) ||
        tx.recipient_name.toLowerCase().includes(q) ||
        tx.target_location.toLowerCase().includes(q) ||
        (tx.document_number && tx.document_number.toLowerCase().includes(q));

      const matchesPurpose = selectedPurpose === "all" || tx.purpose === selectedPurpose;
      const matchesStatus = selectedStatus === "all" || tx.status === selectedStatus;
      const matchesLocation = selectedLocation === "all" || tx.target_location === selectedLocation;
      const matchesDate = selectedDate === "" || tx.date === selectedDate;

      return matchesSearch && matchesPurpose && matchesStatus && matchesLocation && matchesDate;
    });
  }, [outgoing, searchQuery, selectedPurpose, selectedStatus, selectedLocation, selectedDate]);

  const handleFormSubmit = async (formData: OutgoingFormData) => {
    await addOutgoing(formData);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetTx) return;
    try {
      setIsDeleting(true);
      await deleteOutgoing(deleteTargetTx.id);
      setDeleteTargetTx(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Top KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Transaksi Keluar */}
        <div className="p-4 sm:p-5 rounded-[1.8rem] bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-white/5 shadow-sm dark:shadow-xl backdrop-blur-md relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Total Pengeluaran
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <ArrowUpFromLine size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight">
              {stats.totalTransactions}
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400 ml-1.5 font-medium">Transaksi</span>
          </div>
          <p className="text-[11px] text-amber-600 dark:text-amber-500/80 mt-1">
            Log distribusi & BAST keluar
          </p>
        </div>

        {/* Total Unit Keluar */}
        <div className="p-4 sm:p-5 rounded-[1.8rem] bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-white/5 shadow-sm dark:shadow-xl backdrop-blur-md relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Total Unit Keluar
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
            Didistribusikan ke ruangan
          </p>
        </div>

        {/* Pengeluaran Hari Ini */}
        <div className="p-4 sm:p-5 rounded-[1.8rem] bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-white/5 shadow-sm dark:shadow-xl backdrop-blur-md relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Keluar Hari Ini
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
            Status distribusi hari ini
          </p>
        </div>

        {/* Unit Sedang Dipinjam */}
        <div className="p-4 sm:p-5 rounded-[1.8rem] bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-white/5 shadow-sm dark:shadow-xl backdrop-blur-md relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Status Dipinjam
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-stone-800 border border-amber-500/20 dark:border-white/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-white tracking-tight">
              {stats.borrowedUnits}
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400 ml-1.5 font-medium">Unit Aktif</span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            Sedang audit di lapangan
          </p>
        </div>
      </div>

      {/* 2. Filter & Toolbar Bar with Tabs, Dropdowns & Grid/Table Switcher */}
      <OutgoingFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedPurpose={selectedPurpose}
        onPurposeChange={setSelectedPurpose}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onAddClick={() => setIsFormOpen(true)}
        locations={locations}
      />

      {/* 3. Dynamic View: Grid Cards vs Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-stone-500">
          <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4" />
          <p className="text-sm font-medium">Memuat data barang keluar...</p>
        </div>
      ) : filteredOutgoing.length === 0 ? (
        <div className="p-12 text-center rounded-[2rem] bg-white dark:bg-stone-900/40 border border-stone-200/80 dark:border-white/5 shadow-sm dark:shadow-xl flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400 dark:text-stone-600">
            <ArrowUpFromLine size={32} />
          </div>
          <div className="space-y-1 max-w-sm">
            <h3 className="text-lg font-bold text-stone-900 dark:text-white">Tidak ada transaksi ditemukan</h3>
            <p className="text-xs text-stone-500">
              {isFiltered(searchQuery, selectedPurpose, selectedStatus, selectedLocation, selectedDate)
                ? "Tidak ada data barang keluar yang cocok dengan kriteria filter."
                : "Belum ada transaksi distribusi barang keluar yang dicatat."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-stone-950 text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-amber-400 transition-all cursor-pointer"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Catat Barang Keluar Pertama</span>
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID CARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredOutgoing.map((tx) => (
              <OutgoingCard
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
        <OutgoingTable
          transactions={filteredOutgoing}
          onDetail={setDetailTx}
          onDelete={setDeleteTargetTx}
        />
      )}

      {/* 4. Modals */}
      {/* Form Modal */}
      <OutgoingFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        items={items}
        locations={locations}
      />

      {/* Detail / BAST Keluar Modal */}
      <OutgoingDetailModal
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
              name: `Distribusi ${deleteTargetTx.item_name}`,
              category: deleteTargetTx.category,
              stock: deleteTargetTx.quantity,
              unit: deleteTargetTx.unit,
              condition: "Baik",
              location: deleteTargetTx.target_location,
              person_in_charge: deleteTargetTx.recipient_name,
              received_at: deleteTargetTx.date,
            }
            : null
        }
        loading={isDeleting}
      />
    </div>
  );
}

function isFiltered(q: string, p: string, s: string, l: string, d: string) {
  return q.trim() !== "" || p !== "all" || s !== "all" || l !== "all" || d !== "";
}
