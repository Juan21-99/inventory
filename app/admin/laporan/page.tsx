"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileSpreadsheet,
  Printer,
  Download,
  Calendar,
  Filter,
  Layers,
  ArrowDownToLine,
  ArrowUpFromLine,
  DollarSign,
  Boxes,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Building2,
  Tag,
  Search,
  X,
  TrendingUp,
  PieChart,
} from "lucide-react";
import { useItems } from "../gudang/hooks/useItems";
import { useIncoming } from "../barang-masuk/hooks/useIncoming";
import { useOutgoing } from "../barang-keluar/hooks/useOutgoing";
import { useCategories } from "../gudang/hooks/useCategories";
import { useLocations } from "../gudang/hooks/useLocations";
import { useSettings } from "../hooks/useSettings";
import { calculateTotalSystemRealValue } from "@/lib/asset-utils";
import { CustomDropdown, DropdownOption } from "@/app/components/ui/CustomDropdown";
import { CustomDatePicker } from "@/app/components/ui/CustomDatePicker";
import { ReportPrintModal } from "./components/ReportPrintModal";

type ReportType =
  | "rekap_mutasi"
  | "buku_induk"
  | "barang_masuk"
  | "barang_keluar"
  | "stok_kritis";

interface ReportTabConfig {
  id: ReportType;
  label: string;
  icon: React.ElementType;
  description: string;
}

export default function ReportsPage() {
  const { items } = useItems();
  const { incoming } = useIncoming();
  const { outgoing } = useOutgoing();
  const { categories } = useCategories();
  const { locations } = useLocations();
  const { settings } = useSettings();

  const REPORT_TABS: ReportTabConfig[] = [
    {
      id: "rekap_mutasi",
      label: "Rekap Mutasi Stok",
      icon: FileSpreadsheet,
      description: "Rekapitulasi perputaran stok barang (Stok Awal + Masuk - Keluar = Sisa Akhir).",
    },
    {
      id: "buku_induk",
      label: "Buku Induk Aset (KIB)",
      icon: Layers,
      description: "Daftar buku induk seluruh aset, kondisi fisik, nilai perolehan, dan penanggung jawab.",
    },
    {
      id: "barang_masuk",
      label: "Rekap Barang Masuk",
      icon: ArrowDownToLine,
      description: "Daftar transaksi penerimaan barang dan pengadaan APBD / e-Katalog.",
    },
    {
      id: "barang_keluar",
      label: "Rekap Barang Keluar",
      icon: ArrowUpFromLine,
      description: "Daftar distribusi dan penyerahan barang ke ruangan serta pegawai pengguna.",
    },
    {
      id: "stok_kritis",
      label: "Peringatan Stok Kritis",
      icon: AlertTriangle,
      description: `Daftar barang dan logistik dengan sisa persediaan menipis (≤ ${settings.min_stock_alert || 2} unit).`,
    },
  ];

  const currentYear = new Date().getFullYear();

  // Active Report Type Tab
  const [activeReport, setActiveReport] = useState<ReportType>("rekap_mutasi");
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  // Filter States
  const [startDate, setStartDate] = useState(`${currentYear}-01-01`);
  const [endDate, setEndDate] = useState(`${currentYear}-12-31`);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Print Modal State
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Computed Summary Stats (Opsi 1: Akumulatif KIB - Nilai Aset Terkelola Utuh)
  const summaryStats = useMemo(() => {
    const totalItems = items.length;

    // Pemetaan akumulasi barang keluar yang telah didistribusikan
    const outgoingMap = outgoing.reduce<Record<string, number>>((acc, tx) => {
      const key = tx.item_id || tx.item_code;
      if (key) {
        acc[key] = (acc[key] || 0) + (tx.quantity || 0);
      }
      return acc;
    }, {});

    // Total Unit Aset Terkelola (Stok Fisik di Gudang + Unit yang Telah Didistribusikan ke Pegawai/Ruangan)
    const totalUnits = items.reduce((sum, it) => {
      const distributed = outgoingMap[it.id] || outgoingMap[it.code] || 0;
      return sum + (it.stock || 0) + distributed;
    }, 0);

    // Total Nilai Aset Terkelola (Akumulasi Nilai Riil Berbasis Batch Pengadaan & Saldo Awal)
    const totalValue = calculateTotalSystemRealValue(items, incoming, outgoing);

    const goodItemsCount = items.filter((it) => it.condition === "Baik").length;
    const goodConditionRatio = totalItems > 0 ? Math.round((goodItemsCount / totalItems) * 100) : 100;

    const totalIncomingUnits = incoming.reduce((sum, tx) => sum + (tx.quantity || 0), 0);
    const totalOutgoingUnits = outgoing.reduce((sum, tx) => sum + (tx.quantity || 0), 0);

    return {
      totalItems,
      totalUnits,
      totalValue,
      goodConditionRatio,
      totalIncomingUnits,
      totalOutgoingUnits,
    };
  }, [items, incoming, outgoing]);

  // Category Options for Dropdown
  const categoryOptions: DropdownOption[] = [
    { value: "all", label: "Semua Kategori", icon: Tag },
    ...categories.map((c) => ({ value: c.name, label: c.name, icon: Tag })),
  ];

  // Location Options for Dropdown
  const locationOptions: DropdownOption[] = [
    { value: "all", label: "Semua Ruangan", icon: Building2 },
    ...locations.map((loc) => ({ value: loc.name, label: loc.name, icon: Building2 })),
  ];

  // Monthly Mutation Activity Chart (Live from Supabase incoming & outgoing)
  const monthlyChartData = useMemo(() => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const now = new Date();
    const targetYear = now.getFullYear();

    const data = monthNames.map((name, monthIndex) => {
      const inUnits = incoming
        .filter((t) => {
          if (!t.date) return false;
          const d = new Date(t.date);
          return d.getFullYear() === targetYear && d.getMonth() === monthIndex;
        })
        .reduce((sum, t) => sum + (t.quantity || 0), 0);

      const outUnits = outgoing
        .filter((t) => {
          if (!t.date) return false;
          const d = new Date(t.date);
          return d.getFullYear() === targetYear && d.getMonth() === monthIndex;
        })
        .reduce((sum, t) => sum + (t.quantity || 0), 0);

      return {
        m: name,
        inQty: inUnits,
        outQty: outUnits,
      };
    });

    const maxVal = Math.max(...data.map((d) => Math.max(d.inQty, d.outQty)), 1);

    return data.map((d) => ({
      ...d,
      inH: d.inQty > 0 ? Math.max(14, Math.round((d.inQty / maxVal) * 100)) : 6,
      outH: d.outQty > 0 ? Math.max(14, Math.round((d.outQty / maxVal) * 100)) : 6,
    }));
  }, [incoming, outgoing]);

  // Category Composition Distribution (Live from Supabase items, outgoing & categories)
  const categoryCompositionData = useMemo(() => {
    const totalVal = summaryStats.totalValue;
    const colors = [
      "bg-amber-500",
      "bg-emerald-500",
      "bg-sky-500",
      "bg-purple-500",
      "bg-rose-500",
      "bg-indigo-500",
      "bg-teal-500",
    ];

    const outgoingMap = outgoing.reduce<Record<string, number>>((acc, tx) => {
      const key = tx.item_id || tx.item_code;
      if (key) {
        acc[key] = (acc[key] || 0) + (tx.quantity || 0);
      }
      return acc;
    }, {});

    const catMap = new Map<string, { count: number; totalValue: number }>();

    items.forEach((it) => {
      const catName = it.category || "Lainnya";
      const distributed = outgoingMap[it.id] || outgoingMap[it.code] || 0;
      const totalItemUnits = (it.stock || 0) + distributed;
      const itemVal = (it.price || 0) * totalItemUnits;
      const existing = catMap.get(catName) || { count: 0, totalValue: 0 };
      catMap.set(catName, {
        count: existing.count + totalItemUnits,
        totalValue: existing.totalValue + itemVal,
      });
    });

    categories.forEach((c) => {
      if (!catMap.has(c.name)) {
        catMap.set(c.name, { count: 0, totalValue: 0 });
      }
    });

    const sorted = Array.from(catMap.entries())
      .map(([name, stat], idx) => {
        const pct = totalVal > 0 ? Math.round((stat.totalValue / totalVal) * 100) : 0;
        const formattedVal =
          stat.totalValue >= 1_000_000
            ? `Rp ${(stat.totalValue / 1_000_000).toFixed(1)} Jt`
            : `Rp ${stat.totalValue.toLocaleString("id-ID")}`;

        return {
          label: name,
          units: stat.count,
          val: formattedVal,
          pct,
          color: colors[idx % colors.length],
        };
      })
      .sort((a, b) => b.pct - a.pct);

    return sorted.length > 0 ? sorted.slice(0, 5) : [];
  }, [items, categories, summaryStats.totalValue]);

  // Dynamic Data Calculation per Report Type
  const reportData = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    if (activeReport === "rekap_mutasi") {
      return items
        .filter((it) => {
          const matchCat = selectedCategory === "all" || it.category === selectedCategory;
          const matchLoc = selectedLocation === "all" || it.location === selectedLocation;
          const matchQ = q === "" || it.name.toLowerCase().includes(q) || it.code.toLowerCase().includes(q);
          return matchCat && matchLoc && matchQ;
        })
        .map((it) => {
          const inQty = incoming
            .filter((t) => t.item_code === it.code || t.item_name.toLowerCase() === it.name.toLowerCase())
            .reduce((sum, t) => sum + (t.quantity || 0), 0);
          const outQty = outgoing
            .filter((t) => t.item_code === it.code || t.item_name.toLowerCase() === it.name.toLowerCase())
            .reduce((sum, t) => sum + (t.quantity || 0), 0);
          const initialStock = Math.max(0, it.stock - inQty + outQty);
          return {
            ...it,
            initial_stock: initialStock,
            incoming_qty: inQty,
            outgoing_qty: outQty,
          };
        });
    }

    if (activeReport === "buku_induk") {
      return items.filter((it) => {
        const matchCat = selectedCategory === "all" || it.category === selectedCategory;
        const matchLoc = selectedLocation === "all" || it.location === selectedLocation;
        const matchQ = q === "" || it.name.toLowerCase().includes(q) || it.code.toLowerCase().includes(q) || it.person_in_charge.toLowerCase().includes(q);
        return matchCat && matchLoc && matchQ;
      });
    }

    if (activeReport === "barang_masuk") {
      return incoming.filter((t) => {
        const matchCat = selectedCategory === "all" || t.category === selectedCategory;
        const matchLoc = selectedLocation === "all" || t.target_location === selectedLocation;
        const matchDate = (!startDate || t.date >= startDate) && (!endDate || t.date <= endDate);
        const matchQ = q === "" || t.item_name.toLowerCase().includes(q) || t.transaction_number.toLowerCase().includes(q) || t.supplier.toLowerCase().includes(q);
        return matchCat && matchLoc && matchDate && matchQ;
      });
    }

    if (activeReport === "barang_keluar") {
      return outgoing.filter((t) => {
        const matchCat = selectedCategory === "all" || t.category === selectedCategory;
        const matchLoc = selectedLocation === "all" || t.target_location === selectedLocation;
        const matchDate = (!startDate || t.date >= startDate) && (!endDate || t.date <= endDate);
        const matchQ = q === "" || t.item_name.toLowerCase().includes(q) || t.transaction_number.toLowerCase().includes(q) || t.recipient_name.toLowerCase().includes(q);
        return matchCat && matchLoc && matchDate && matchQ;
      });
    }

    if (activeReport === "stok_kritis") {
      const threshold = settings.min_stock_alert || 2;
      return items.filter((it) => it.stock <= threshold && (q === "" || it.name.toLowerCase().includes(q) || it.code.toLowerCase().includes(q)));
    }

    return [];
  }, [activeReport, items, incoming, outgoing, selectedCategory, selectedLocation, startDate, endDate, searchQuery, settings.min_stock_alert]);

  // Export to CSV
  const handleExportCSV = () => {
    if (reportData.length === 0) return;
    const firstRow = reportData[0] as unknown as Record<string, unknown>;
    const headers = Object.keys(firstRow).filter((k) => typeof firstRow[k] !== "object");
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        headers.join(","),
        ...reportData.map((row) => {
          const rowObj = row as unknown as Record<string, unknown>;
          return headers.map((h) => `"${String(rowObj[h] ?? "").replace(/"/g, '""')}"`).join(",");
        }),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_${activeReport}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentTabInfo = REPORT_TABS.find((t) => t.id === activeReport)!;

  return (
    <div className="space-y-6">
      {/* 1. Top KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Nilai Aset */}
        <div className="p-4 sm:p-5 rounded-[1.8rem] bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-white/5 shadow-sm dark:shadow-xl backdrop-blur-md relative overflow-hidden group transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Total Nilai Aset
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="mt-3 truncate">
            <span className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
              Rp {(summaryStats.totalValue / 1000000).toFixed(1)} Juta
            </span>
          </div>
          <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-1 truncate">
            Rp {summaryStats.totalValue.toLocaleString("id-ID")}
          </p>
        </div>

        {/* Mutasi Masuk */}
        <div className="p-4 sm:p-5 rounded-[1.8rem] bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-white/5 shadow-sm dark:shadow-xl backdrop-blur-md relative overflow-hidden group transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Mutasi Masuk
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ArrowDownToLine size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight">
              +{summaryStats.totalIncomingUnits}
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400 ml-1.5 font-medium">Unit</span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-500/80 mt-1">
            Pengadaan & BAST diterima
          </p>
        </div>

        {/* Mutasi Keluar */}
        <div className="p-4 sm:p-5 rounded-[1.8rem] bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-white/5 shadow-sm dark:shadow-xl backdrop-blur-md relative overflow-hidden group transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Mutasi Keluar
            </span>
            <div className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-white/10 flex items-center justify-center text-stone-700 dark:text-stone-300">
              <ArrowUpFromLine size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight">
              -{summaryStats.totalOutgoingUnits}
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400 ml-1.5 font-medium">Unit</span>
          </div>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
            Terdistribusi ke ruangan
          </p>
        </div>

        {/* Rasio Kondisi Baik */}
        <div className="p-4 sm:p-5 rounded-[1.8rem] bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-white/5 shadow-sm dark:shadow-xl backdrop-blur-md relative overflow-hidden group transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Kondisi Baik
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {summaryStats.goodConditionRatio}%
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400 ml-1.5 font-medium">Layak Pakai</span>
          </div>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
            Total {summaryStats.totalUnits} unit fisik
          </p>
        </div>
      </div>

      {/* 2. Horizontal Report Type Tabs (Animated Sliding Amber Pill) */}
      <div className="bg-white dark:bg-stone-900/70 backdrop-blur-xl p-3 sm:p-4 rounded-[2rem] border border-stone-200/80 dark:border-white/5 shadow-sm dark:shadow-2xl relative z-30 space-y-3 transition-colors">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1">
          {REPORT_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeReport === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveReport(tab.id)}
                onMouseEnter={() => setHoveredTab(tab.id)}
                onMouseLeave={() => setHoveredTab(null)}
                className={`relative flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${isActive ? "text-stone-950 font-black" : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
                  }`}
              >
                {/* Active Sliding Pill */}
                {isActive && (
                  <motion.div
                    layoutId="activeReportTab"
                    className="absolute inset-0 bg-amber-500 rounded-2xl shadow-[0_0_25px_rgba(245,158,11,0.35)]"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}

                {/* Hover Background */}
                {!isActive && hoveredTab === tab.id && (
                  <motion.div
                    layoutId="hoverReportTab"
                    className="absolute inset-0 bg-stone-100 dark:bg-white/5 rounded-2xl"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}

                <span className="relative z-10 flex items-center gap-2">
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter Controls Row */}
        <div className="pt-3 border-t border-stone-200/80 dark:border-white/5 flex flex-col xl:flex-row gap-3 items-stretch xl:items-center justify-between">
          {/* Left: Search Bar */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500" size={16} />
            <input
              type="text"
              placeholder="Cari dalam laporan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2 bg-stone-100 dark:bg-stone-950/60 border border-stone-200 dark:border-white/5 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 transition-all outline-none text-xs text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-600 shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700 dark:text-stone-500 dark:hover:text-white rounded-full"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Center: Date Range & Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <CustomDatePicker
              value={startDate}
              onChange={setStartDate}
              placeholder="Tgl Mulai"
              className="w-36"
            />
            <span className="text-xs text-stone-400 dark:text-stone-600 font-bold">s/d</span>
            <CustomDatePicker
              value={endDate}
              onChange={setEndDate}
              placeholder="Tgl Selesai"
              className="w-36"
            />

            <CustomDropdown
              value={selectedCategory}
              onChange={setSelectedCategory}
              options={categoryOptions}
              placeholder="Kategori"
              className="w-44"
            />

            <CustomDropdown
              value={selectedLocation}
              onChange={setSelectedLocation}
              options={locationOptions}
              placeholder="Ruangan"
              className="w-44"
            />
          </div>

          {/* Right: Print & Export Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-950/80 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white border border-stone-200 dark:border-white/5 text-xs font-bold transition-all cursor-pointer shadow-inner"
              title="Unduh Data CSV / Excel"
            >
              <Download size={14} />
              <span>Ekspor CSV</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPrintModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider shrink-0 cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              <Printer size={15} />
              <span>Cetak Laporan Resmi</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Analytics Visualizations Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Visual Bar Chart: Perbandingan Mutasi */}
        <div className="lg:col-span-2 p-5 rounded-[2rem] bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-white/5 shadow-sm dark:shadow-xl backdrop-blur-md space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-stone-800 dark:text-stone-200 flex items-center gap-2">
                <TrendingUp size={15} className="text-amber-500" />
                Aktivitas Perputaran Barang (Mutasi)
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Grafik perbandingan kuantitas barang masuk vs barang keluar.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Masuk (+{summaryStats.totalIncomingUnits})
              </span>
              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Keluar (-{summaryStats.totalOutgoingUnits})
              </span>
            </div>
          </div>

          {/* Live Dynamic Bar Chart */}
          <div className="h-44 flex items-end gap-1.5 sm:gap-2 pt-6 border-b border-stone-200/80 dark:border-white/5 px-2">
            {monthlyChartData.map((bar, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <div className="w-full flex items-end justify-center gap-1 h-full">
                  <div
                    style={{ height: `${bar.inH}%` }}
                    className="w-1/2 bg-emerald-500/80 hover:bg-emerald-400 rounded-t-md transition-all relative group-hover:shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                    title={`${bar.m} - Masuk: ${bar.inQty} unit`}
                  />
                  <div
                    style={{ height: `${bar.outH}%` }}
                    className="w-1/2 bg-amber-500/80 hover:bg-amber-400 rounded-t-md transition-all relative group-hover:shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                    title={`${bar.m} - Keluar: ${bar.outQty} unit`}
                  />
                </div>
                <span className="text-[10px] font-bold text-stone-400 group-hover:text-stone-900 dark:text-stone-500 dark:group-hover:text-white transition-colors">
                  {bar.m}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Value Distribution (Live from Supabase) */}
        <div className="p-5 rounded-[2rem] bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-white/5 shadow-sm dark:shadow-xl backdrop-blur-md space-y-4 transition-colors">
          <div className="space-y-0.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-stone-800 dark:text-stone-200 flex items-center gap-2">
              <PieChart size={15} className="text-amber-500" />
              Komposisi Aset per Kategori
            </h3>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              Sebaran nilai inventaris real-time di Supabase.
            </p>
          </div>

          <div className="space-y-3.5 pt-2">
            {categoryCompositionData.length === 0 ? (
              <div className="py-8 text-center text-xs text-stone-400 dark:text-stone-500">
                Belum ada data barang terdaftar.
              </div>
            ) : (
              categoryCompositionData.map((cat) => (
                <div key={cat.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-stone-700 dark:text-stone-300 truncate max-w-[140px]">{cat.label}</span>
                    <span className="text-stone-500 dark:text-stone-400">
                      {cat.val} ({cat.pct}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-stone-100 dark:bg-stone-950 overflow-hidden border border-stone-200 dark:border-white/5">
                    <div style={{ width: `${Math.max(2, cat.pct)}%` }} className={`h-full ${cat.color} rounded-full transition-all duration-500`} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 4. Live Data Table Preview */}
      <div className="bg-white dark:bg-stone-900/60 backdrop-blur-md rounded-[2rem] border border-stone-200/80 dark:border-white/5 shadow-sm dark:shadow-2xl overflow-hidden space-y-0 transition-colors">
        <div className="p-4 sm:p-5 border-b border-stone-200/80 dark:border-white/5 flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-stone-900 dark:text-white tracking-tight">
              Pratinjau Data: {currentTabInfo.label}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">{currentTabInfo.description}</p>
          </div>
          <span className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-600 dark:text-amber-400">
            {reportData.length} Baris Data
          </span>
        </div>

        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-stone-300 dark:scrollbar-thumb-stone-800">
          <table className="w-full text-left text-xs sm:text-sm text-stone-600 dark:text-stone-300">
            <thead className="bg-stone-50 dark:bg-stone-950/80 text-[10px] sm:text-xs font-black uppercase tracking-widest text-stone-500 dark:text-stone-400 border-b border-stone-200/80 dark:border-white/5">
              {activeReport === "rekap_mutasi" && (
                <tr>
                  <th className="px-5 py-4">No</th>
                  <th className="px-5 py-4">Kode & Nama Barang</th>
                  <th className="px-5 py-4">Kategori</th>
                  <th className="px-5 py-4 text-center">Stok Awal</th>
                  <th className="px-5 py-4 text-center text-emerald-600 dark:text-emerald-400">Masuk (+)</th>
                  <th className="px-5 py-4 text-center text-amber-600 dark:text-amber-400">Keluar (-)</th>
                  <th className="px-5 py-4 text-center">Sisa Stok</th>
                  <th className="px-5 py-4 text-right">Nilai Total (Rp)</th>
                </tr>
              )}
              {activeReport === "buku_induk" && (
                <tr>
                  <th className="px-5 py-4">No</th>
                  <th className="px-5 py-4">Kode Barang</th>
                  <th className="px-5 py-4">Nama Aset</th>
                  <th className="px-5 py-4">Kategori</th>
                  <th className="px-5 py-4 text-center">Jumlah</th>
                  <th className="px-5 py-4">Kondisi</th>
                  <th className="px-5 py-4">Ruangan</th>
                  <th className="px-5 py-4 text-right">Nilai Perolehan</th>
                </tr>
              )}
              {activeReport === "barang_masuk" && (
                <tr>
                  <th className="px-5 py-4">No. BAST</th>
                  <th className="px-5 py-4">Tanggal</th>
                  <th className="px-5 py-4">Nama Barang</th>
                  <th className="px-5 py-4 text-center">Jumlah</th>
                  <th className="px-5 py-4">Sumber / Rekanan</th>
                  <th className="px-5 py-4">Ruangan Tujuan</th>
                  <th className="px-5 py-4 text-right">Total Nilai</th>
                </tr>
              )}
              {activeReport === "barang_keluar" && (
                <tr>
                  <th className="px-5 py-4">No. Bukti</th>
                  <th className="px-5 py-4">Tanggal</th>
                  <th className="px-5 py-4">Nama Barang</th>
                  <th className="px-5 py-4 text-center">Kuantitas</th>
                  <th className="px-5 py-4">Keperluan</th>
                  <th className="px-5 py-4">Ruangan</th>
                  <th className="px-5 py-4">Penerima (PJ)</th>
                </tr>
              )}
              {activeReport === "stok_kritis" && (
                <tr>
                  <th className="px-5 py-4">No</th>
                  <th className="px-5 py-4">Kode Barang</th>
                  <th className="px-5 py-4">Nama Logistik</th>
                  <th className="px-5 py-4">Kategori</th>
                  <th className="px-5 py-4 text-center">Sisa Stok</th>
                  <th className="px-5 py-4">Ruangan</th>
                  <th className="px-5 py-4">Status Peringatan</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-white/5">
              {reportData.map((row: any, idx: number) => (
                <tr key={idx} className="hover:bg-stone-50/80 dark:hover:bg-white/[0.02] transition-colors">
                  {activeReport === "rekap_mutasi" && (
                    <>
                      <td className="px-5 py-3.5 text-stone-400 dark:text-stone-500 font-bold">{idx + 1}</td>
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-stone-900 dark:text-white block">{row.name}</span>
                        <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400">{row.code}</span>
                      </td>
                      <td className="px-5 py-3.5 text-stone-500 dark:text-stone-400">{row.category}</td>
                      <td className="px-5 py-3.5 text-center font-bold text-stone-700 dark:text-stone-300">
                        {row.initial_stock || row.stock} {row.unit}
                      </td>
                      <td className="px-5 py-3.5 text-center font-black text-emerald-600 dark:text-emerald-400">
                        +{row.incoming_qty || 0}
                      </td>
                      <td className="px-5 py-3.5 text-center font-black text-amber-600 dark:text-amber-400">
                        -{row.outgoing_qty || 0}
                      </td>
                      <td className="px-5 py-3.5 text-center font-black text-stone-900 dark:text-white">
                        {row.stock} {row.unit}
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-amber-600 dark:text-amber-400">
                        Rp {((row.price || 0) * (row.stock || 0)).toLocaleString("id-ID")}
                      </td>
                    </>
                  )}

                  {activeReport === "buku_induk" && (
                    <>
                      <td className="px-5 py-3.5 text-stone-400 dark:text-stone-500 font-bold">{idx + 1}</td>
                      <td className="px-5 py-3.5 font-mono font-bold text-amber-600 dark:text-amber-400">{row.code}</td>
                      <td className="px-5 py-3.5 font-bold text-stone-900 dark:text-white">{row.name}</td>
                      <td className="px-5 py-3.5 text-stone-500 dark:text-stone-400">{row.category}</td>
                      <td className="px-5 py-3.5 text-center font-black text-stone-900 dark:text-white">{row.stock} {row.unit}</td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                          {row.condition}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-stone-700 dark:text-stone-300">{row.location}</td>
                      <td className="px-5 py-3.5 text-right font-bold text-amber-600 dark:text-amber-400">
                        Rp {(row.price || 0).toLocaleString("id-ID")}
                      </td>
                    </>
                  )}

                  {activeReport === "barang_masuk" && (
                    <>
                      <td className="px-5 py-3.5 font-mono font-bold text-amber-600 dark:text-amber-400">{row.transaction_number}</td>
                      <td className="px-5 py-3.5 text-stone-500 dark:text-stone-400">{row.date}</td>
                      <td className="px-5 py-3.5 font-bold text-stone-900 dark:text-white">{row.item_name}</td>
                      <td className="px-5 py-3.5 text-center font-black text-emerald-600 dark:text-emerald-400">+{row.quantity} {row.unit}</td>
                      <td className="px-5 py-3.5 text-stone-700 dark:text-stone-300">{row.source} - {row.supplier}</td>
                      <td className="px-5 py-3.5 text-stone-500 dark:text-stone-400">{row.target_location}</td>
                      <td className="px-5 py-3.5 text-right font-bold text-amber-600 dark:text-amber-400">
                        Rp {(row.total_price || 0).toLocaleString("id-ID")}
                      </td>
                    </>
                  )}

                  {activeReport === "barang_keluar" && (
                    <>
                      <td className="px-5 py-3.5 font-mono font-bold text-amber-600 dark:text-amber-400">{row.transaction_number}</td>
                      <td className="px-5 py-3.5 text-stone-500 dark:text-stone-400">{row.date}</td>
                      <td className="px-5 py-3.5 font-bold text-stone-900 dark:text-white">{row.item_name}</td>
                      <td className="px-5 py-3.5 text-center font-black text-amber-600 dark:text-amber-400">-{row.quantity} {row.unit}</td>
                      <td className="px-5 py-3.5 text-stone-700 dark:text-stone-300">{row.purpose}</td>
                      <td className="px-5 py-3.5 text-stone-500 dark:text-stone-400">{row.target_location}</td>
                      <td className="px-5 py-3.5 text-stone-800 dark:text-stone-300 font-medium">{row.recipient_name}</td>
                    </>
                  )}

                  {activeReport === "stok_kritis" && (
                    <>
                      <td className="px-5 py-3.5 text-stone-400 dark:text-stone-500 font-bold">{idx + 1}</td>
                      <td className="px-5 py-3.5 font-mono font-bold text-amber-600 dark:text-amber-400">{row.code}</td>
                      <td className="px-5 py-3.5 font-bold text-stone-900 dark:text-white">{row.name}</td>
                      <td className="px-5 py-3.5 text-stone-500 dark:text-stone-400">{row.category}</td>
                      <td className="px-5 py-3.5 text-center font-black text-rose-600 dark:text-rose-400">{row.stock} {row.unit}</td>
                      <td className="px-5 py-3.5 text-stone-700 dark:text-stone-300">{row.location}</td>
                      <td className="px-5 py-3.5 font-bold text-rose-600 dark:text-rose-400">
                        ⚠️ Sisa ≤ {settings.min_stock_alert || 2} Unit
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Official Print Modal */}
      <ReportPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        reportType={activeReport}
        reportTitle={currentTabInfo.label}
        startDate={startDate}
        endDate={endDate}
        data={reportData}
        summaryStats={summaryStats}
      />
    </div>
  );
}
