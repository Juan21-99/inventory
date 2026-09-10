"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Boxes,
  ArrowDownToLine,
  ArrowUpFromLine,
  DollarSign,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  Building2,
  Calendar,
  Clock,
  ChevronRight,
  Plus,
  FileSpreadsheet,
  CheckCircle2,
  Sparkles,
  Layers,
  Briefcase,
  User,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useItems } from "./gudang/hooks/useItems";
import { useIncoming } from "./barang-masuk/hooks/useIncoming";
import { useOutgoing } from "./barang-keluar/hooks/useOutgoing";
import { useLocations } from "./gudang/hooks/useLocations";
import { useSettings } from "./hooks/useSettings";
import { calculateTotalSystemRealValue } from "@/lib/asset-utils";

export default function AdminDashboardPage() {
  const { user, profile } = useAuth();
  const { items } = useItems();
  const { incoming } = useIncoming();
  const { outgoing } = useOutgoing();
  const { locations } = useLocations();
  const { settings } = useSettings();

  // 1. KPI Statistics Computations (Opsi 1: Akumulatif KIB - Nilai Aset Terkelola Utuh)
  const stats = useMemo(() => {
    const totalItems = items.length;

    // Pemetaan akumulasi kuantitas barang yang telah didistribusikan
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

    // Sisa Stok Siap Distribusi di Gudang Logistik
    const warehouseStock = items.reduce((sum, it) => sum + (it.stock || 0), 0);

    // Total Nilai Aset Terkelola (Akumulasi Nilai Riil Berbasis Batch Pengadaan & Saldo Awal)
    const totalValue = calculateTotalSystemRealValue(items, incoming, outgoing);

    const goodItemsCount = items.filter((it) => it.condition === "Baik").length;
    const damagedItemsCount = items.filter((it) => it.condition !== "Baik").length;
    const goodConditionRatio = totalItems > 0 ? Math.round((goodItemsCount / totalItems) * 100) : 100;

    const threshold = settings.min_stock_alert || 2;
    const lowStockItems = items.filter((it) => it.stock <= threshold);

    const totalIncomingUnits = incoming.reduce((sum, tx) => sum + (tx.quantity || 0), 0);
    const totalOutgoingUnits = outgoing.reduce((sum, tx) => sum + (tx.quantity || 0), 0);

    const borrowedUnits = outgoing
      .filter((tx) => tx.status === "Dipinjam")
      .reduce((sum, tx) => sum + (tx.quantity || 0), 0);

    return {
      totalItems,
      totalUnits,
      warehouseStock,
      totalValue,
      goodConditionRatio,
      damagedItemsCount,
      lowStockItems,
      totalIncomingUnits,
      totalOutgoingUnits,
      borrowedUnits,
    };
  }, [items, incoming, outgoing, settings.min_stock_alert]);

  // 2. Recent Combined Activity Feed (Latest Incoming & Outgoing)
  const recentActivities = useMemo(() => {
    const inActivities = incoming.map((t) => ({
      id: `in-${t.id}`,
      type: "incoming" as const,
      txNumber: t.transaction_number,
      title: `Penerimaan ${t.item_name}`,
      subtitle: `${t.source} · ${t.supplier}`,
      quantity: `+${t.quantity} ${t.unit}`,
      date: t.date,
      person: t.received_by,
      location: t.target_location,
    }));

    const outActivities = outgoing.map((t) => ({
      id: `out-${t.id}`,
      type: "outgoing" as const,
      txNumber: t.transaction_number,
      title: `Distribusi ${t.item_name}`,
      subtitle: `${t.purpose} (${t.status})`,
      quantity: `-${t.quantity} ${t.unit}`,
      date: t.date,
      person: t.recipient_name,
      location: t.target_location,
    }));

    // Merge and sort descending by date
    return [...inActivities, ...outActivities]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 6);
  }, [incoming, outgoing]);

  // 3. Asset distribution per room
  const roomDistribution = useMemo(() => {
    return locations.map((loc) => {
      const roomItems = items.filter((it) => it.location === loc.name);
      const count = roomItems.reduce((sum, it) => sum + (it.stock || 0), 0);
      const pct = stats.totalUnits > 0 ? Math.round((count / stats.totalUnits) * 100) : 0;
      return {
        name: loc.name,
        floor: loc.floor || "Lantai 1",
        count,
        pct,
      };
    }).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [locations, items, stats.totalUnits]);

  // 4. Monthly Trend Data (Live from Supabase incoming & outgoing)
  const monthlyTrends = useMemo(() => {
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

  const todayStr = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* 1. Executive Welcome Banner */}
      <div className="relative overflow-hidden rounded-[2.2rem] bg-gradient-to-r from-stone-900 via-stone-900/95 to-amber-950/60 p-6 sm:p-8 border border-stone-800 dark:border-white/5 shadow-xl dark:shadow-2xl text-white">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-widest">
              <Sparkles size={15} />
              <span>Sistem Manajemen Inventaris & Logistik Terpadu</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
              Selamat Bertugas,{" "}
              <span className="text-amber-400">
                {profile?.full_name || "Admin Inspektorat"}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 dark:text-stone-400 leading-relaxed">
              Pantau pergerakan stok, pengadaan BAST, dan distribusi aset kantor Inspektorat Provinsi Sumatera Utara secara real-time.
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs text-stone-400 dark:text-stone-500 font-medium">
              <Calendar size={13} className="text-amber-400" />
              <span>{todayStr}</span>
              <span className="text-stone-600">·</span>
              <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Sistem Online & Sinkron
              </span>
            </div>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
            <Link
              href="/admin/gudang"
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              <Plus size={16} strokeWidth={3} />
              <span>Inventaris Gudang</span>
            </Link>

            <Link
              href="/admin/barang-masuk"
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 dark:bg-stone-950/80 hover:bg-white/20 dark:hover:bg-stone-800 text-emerald-300 dark:text-emerald-400 border border-emerald-400/30 font-bold text-xs uppercase tracking-wider shadow-md hover:border-emerald-400/50 transition-all"
            >
              <ArrowDownToLine size={15} />
              <span>Barang Masuk</span>
            </Link>

            <Link
              href="/admin/barang-keluar"
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 dark:bg-stone-950/80 hover:bg-white/20 dark:hover:bg-stone-800 text-amber-300 dark:text-amber-400 border border-amber-400/30 font-bold text-xs uppercase tracking-wider shadow-md hover:border-amber-400/50 transition-all"
            >
              <ArrowUpFromLine size={15} />
              <span>Barang Keluar</span>
            </Link>
          </div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. Top 4 Executive KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Nilai Aset Terkelola */}
        <div className="p-5 rounded-[1.8rem] bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-white/5 shadow-sm dark:shadow-xl backdrop-blur-md relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Nilai Aset Terkelola
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="mt-3 truncate">
            <span className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
              Rp {(stats.totalValue / 1000000).toFixed(1)} Jt
            </span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1 truncate">
            Rp {stats.totalValue.toLocaleString("id-ID")}
          </p>
        </div>

        {/* Total Fisik Unit & Master Aset */}
        <div className="p-5 rounded-[1.8rem] bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-white/5 shadow-sm dark:shadow-xl backdrop-blur-md relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Total Fisik Aset
            </span>
            <div className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-white/10 flex items-center justify-center text-stone-800 dark:text-white">
              <Boxes size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight">
              {stats.totalUnits}
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400 ml-1.5 font-medium">Unit</span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            {stats.totalItems} jenis aset · ({stats.warehouseStock} siap di gudang)
          </p>
        </div>

        {/* Mutasi Masuk vs Keluar */}
        <div className="p-5 rounded-[1.8rem] bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-white/5 shadow-sm dark:shadow-xl backdrop-blur-md relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Perputaran Mutasi
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              +{stats.totalIncomingUnits}
            </span>
            <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
              / -{stats.totalOutgoingUnits}
            </span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            {stats.borrowedUnits} unit sedang dipinjam audit
          </p>
        </div>

        {/* Kondisi Aset & Stok Kritis */}
        <div className="p-5 rounded-[1.8rem] bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-white/5 shadow-sm dark:shadow-xl backdrop-blur-md relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Kondisi Aset Baik
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {stats.goodConditionRatio}%
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400 ml-1.5 font-medium">Layak Pakai</span>
          </div>
          <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold mt-1">
            {stats.lowStockItems.length} logistik stok menipis (≤2)
          </p>
        </div>
      </div>

      {/* 3. Analytics Visualizations Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Trend Bar Chart */}
        <div className="lg:col-span-2 p-6 rounded-[2rem] bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-white/5 shadow-sm dark:shadow-xl backdrop-blur-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-0.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-stone-900 dark:text-stone-200 flex items-center gap-2">
                <TrendingUp size={15} className="text-amber-500" />
                Tren Arus Barang Masuk & Keluar Bulanan
              </h3>
              <p className="text-[11px] text-stone-500">
                Perbandingan kuantitas pengadaan vs distribusi logistik internal.
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold shrink-0">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Masuk (+{stats.totalIncomingUnits})
              </span>
              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Keluar (-{stats.totalOutgoingUnits})
              </span>
            </div>
          </div>

          {/* Live Dynamic Trend Bars */}
          <div className="h-44 flex items-end gap-1.5 sm:gap-2 pt-6 border-b border-stone-100 dark:border-white/5 px-2">
            {monthlyTrends.map((bar, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <div className="w-full flex items-end justify-center gap-1 h-full">
                  <div
                    style={{ height: `${bar.inH}%` }}
                    className="w-1/2 bg-emerald-500/80 hover:bg-emerald-500 rounded-t-md transition-all relative group-hover:shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                    title={`${bar.m} - Masuk: ${bar.inQty} unit`}
                  />
                  <div
                    style={{ height: `${bar.outH}%` }}
                    className="w-1/2 bg-amber-500/80 hover:bg-amber-500 rounded-t-md transition-all relative group-hover:shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                    title={`${bar.m} - Keluar: ${bar.outQty} unit`}
                  />
                </div>
                <span className="text-[10px] font-bold text-stone-500 group-hover:text-stone-900 dark:group-hover:text-white transition-colors">
                  {bar.m}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Room Asset Distribution */}
        <div className="p-6 rounded-[2rem] bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-white/5 shadow-sm dark:shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-stone-900 dark:text-stone-200 flex items-center gap-2">
                <Building2 size={15} className="text-amber-500" />
                Sebaran Aset per Ruangan
              </h3>
              <p className="text-[11px] text-stone-500">
                Konsentrasi unit fisik di unit kerja.
              </p>
            </div>
            <Link
              href="/admin/pengaturan"
              className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline"
            >
              Kelola
            </Link>
          </div>

          <div className="space-y-3 pt-1">
            {roomDistribution.map((room) => (
              <div key={room.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-stone-800 dark:text-stone-300 truncate max-w-[170px]" title={room.name}>
                    {room.name}
                  </span>
                  <span className="text-stone-500 dark:text-stone-400">
                    {room.count} unit ({room.pct}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-stone-100 dark:bg-stone-950 overflow-hidden border border-stone-200/60 dark:border-white/5">
                  <div
                    style={{ width: `${Math.max(5, room.pct)}%` }}
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Dual Bottom Stream: Activity Feed & Attention Required */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Activities (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-[2rem] bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-white/5 shadow-sm dark:shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-white/5">
            <div className="space-y-0.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-stone-900 dark:text-stone-200 flex items-center gap-2">
                <Clock size={15} className="text-amber-500" />
                Log Transaksi & Aktivitas Terbaru
              </h3>
              <p className="text-[11px] text-stone-500">
                Catatan mutasi penerimaan dan distribusi barang terkini.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/admin/barang-masuk"
                className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Masuk
              </Link>
              <span className="text-stone-300 dark:text-stone-700">·</span>
              <Link
                href="/admin/barang-keluar"
                className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline"
              >
                Keluar
              </Link>
            </div>
          </div>

          <div className="divide-y divide-stone-100 dark:divide-white/5">
            {recentActivities.map((act) => (
              <div
                key={act.id}
                className="py-3 flex items-center justify-between gap-3 hover:bg-stone-50 dark:hover:bg-white/[0.02] transition-colors rounded-xl px-2 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${act.type === "incoming"
                        ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        : "bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400"
                      }`}
                  >
                    {act.type === "incoming" ? <ArrowDownToLine size={16} /> : <ArrowUpFromLine size={16} />}
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-stone-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">
                        {act.title}
                      </p>
                      <span className="font-mono text-[10px] text-stone-400 dark:text-stone-500">
                        {act.txNumber}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600 dark:text-stone-400 truncate">
                      {act.person} · <span className="text-stone-400 dark:text-stone-500">{act.location}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`text-xs font-black block ${act.type === "incoming" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                      }`}
                  >
                    {act.quantity}
                  </span>
                  <span className="text-[10px] text-stone-400 dark:text-stone-500">{act.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Required: Critical Stock & Condition Warnings (1 Col) */}
        <div className="p-6 rounded-[2rem] bg-white dark:bg-stone-900/60 border border-stone-200/80 dark:border-white/5 shadow-sm dark:shadow-xl backdrop-blur-md space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-white/5">
              <div className="space-y-0.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-stone-900 dark:text-stone-200 flex items-center gap-2">
                  <AlertTriangle size={15} className="text-rose-500" />
                  Perhatian Khusus
                </h3>
                <p className="text-[11px] text-stone-500">
                  Aset & logistik perlu tindakan segera.
                </p>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-mono font-bold">
                {stats.lowStockItems.length + stats.damagedItemsCount} Poin
              </span>
            </div>

            {/* List of Warning Items */}
            <div className="space-y-2.5">
              {stats.lowStockItems.slice(0, 3).map((it) => (
                <div
                  key={it.id}
                  className="p-3 rounded-xl bg-rose-50/50 dark:bg-stone-950/60 border border-rose-200 dark:border-rose-500/20 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-700 dark:text-rose-300 text-[9px] font-black uppercase">
                      Stok Menipis
                    </span>
                    <span className="text-xs font-black text-rose-600 dark:text-rose-400">
                      Sisa: {it.stock} {it.unit}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-stone-900 dark:text-white truncate">{it.name}</p>
                  <p className="text-[10px] text-stone-500">Ruangan: {it.location}</p>
                </div>
              ))}

              {items.filter((it) => it.condition !== "Baik").slice(0, 2).map((it) => (
                <div
                  key={it.id}
                  className="p-3 rounded-xl bg-amber-50/50 dark:bg-stone-950/60 border border-amber-200 dark:border-amber-500/20 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[9px] font-black uppercase">
                      Kondisi: {it.condition}
                    </span>
                    <span className="text-[10px] font-mono text-stone-500 dark:text-stone-400">{it.code}</span>
                  </div>
                  <p className="text-xs font-bold text-stone-900 dark:text-white truncate">{it.name}</p>
                  <p className="text-[10px] text-stone-500">PJ: {it.person_in_charge}</p>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/admin/laporan"
            className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-950 hover:bg-stone-200 dark:hover:bg-stone-800 border border-stone-200 dark:border-white/5 text-xs font-bold text-stone-800 dark:text-amber-400 hover:text-stone-900 dark:hover:text-amber-300 transition-colors shadow-sm"
          >
            <FileSpreadsheet size={14} />
            <span>Lihat Rekapitulasi Laporan Lengkap</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
