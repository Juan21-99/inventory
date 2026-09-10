"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  Calendar,
  LayoutDashboard,
  Boxes,
  ArrowDownToLine,
  ArrowUpFromLine,
  FileSpreadsheet,
  Settings,
  LucideIcon,
} from "lucide-react";

import ThemeToggle from "@/app/components/ui/ThemeToggle";

interface PageConfig {
  title: React.ReactNode;
  description: string;
  icon: LucideIcon;
  iconColor?: string;
}

// Route configuration - single source of truth for Inventory System
const PAGE_CONFIG: Record<string, PageConfig> = {
  "/admin": {
    title: (
      <>
        Dashboard <span className="text-amber-500">Utama</span>
      </>
    ),
    description: "Ringkasan data inventaris aset",
    icon: LayoutDashboard,
  },
  "/admin/gudang": {
    title: (
      <>
        Inventaris <span className="text-amber-500">Gudang</span>
      </>
    ),
    description: "Kelola master data stok gudang, kategori, dan fisik aset",
    icon: Boxes,
  },
  "/admin/produk": {
    title: (
      <>
        Inventaris <span className="text-amber-500">Gudang</span>
      </>
    ),
    description: "Kelola master data stok gudang, kategori, dan fisik aset",
    icon: Boxes,
  },
  "/admin/barang-masuk": {
    title: (
      <>
        Barang <span className="text-amber-500">Masuk</span>
      </>
    ),
    description: "Pencatatan pengadaan barang masuk",
    icon: ArrowDownToLine,
  },
  "/admin/barang-keluar": {
    title: (
      <>
        Barang <span className="text-amber-500">Keluar</span>
      </>
    ),
    description: "Pencatatan distribusi dan pemakaian barang keluar",
    icon: ArrowUpFromLine,
  },
  "/admin/laporan": {
    title: (
      <>
        Laporan <span className="text-amber-500">Mutasi</span>
      </>
    ),
    description: "Rekap data barang masuk dan barang keluar",
    icon: FileSpreadsheet,
  },
  "/admin/pengaturan": {
    title: (
      <>
        Pengaturan <span className="text-amber-500">Sistem</span>
      </>
    ),
    description: "Konfigurasi instansi dan profil administrator",
    icon: Settings,
  },
};

export default function Header() {
  const pathname = usePathname();

  // Get page config based on current route
  const config = PAGE_CONFIG[pathname] || {
    title: (
      <>
        Admin <span className="text-amber-500">Panel</span>
      </>
    ),
    description: "Sistem Informasi Inventaris & Logistik Inspektorat",
    icon: LayoutDashboard,
  };

  const Icon = config.icon;
  const iconColor = config.iconColor || "text-amber-500";

  // Tanggal hari ini dalam format Bahasa Indonesia
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="flex h-24 shrink-0 items-center justify-between gap-4 border-b border-stone-200 dark:border-white/5 bg-white/90 dark:bg-stone-950 backdrop-blur-md px-8 z-30 shadow-sm dark:shadow-2xl transition-colors duration-200">
      {/* LEFT: Page Title with Icon */}
      <div className="flex items-center gap-5">
        <div
          className={`w-12 h-12 bg-stone-100 dark:bg-stone-900 rounded-2xl flex items-center justify-center border border-stone-200 dark:border-white/5 shadow-sm dark:shadow-lg dark:shadow-black/20 ${iconColor}`}
        >
          <Icon size={22} aria-hidden="true" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-stone-900 dark:text-white tracking-tight leading-none uppercase italic">
            {config.title}
          </h1>
          {config.description && (
            <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mt-1">
              {config.description}
            </p>
          )}
        </div>
      </div>

      {/* RIGHT: Date & Theme Toggle */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-3 px-5 py-2.5 bg-stone-100 dark:bg-stone-900 rounded-[1rem] border border-stone-200 dark:border-white/5 shadow-inner">
          <Calendar size={18} className="text-amber-500" strokeWidth={2.5} />
          <span className="text-xs font-black text-stone-700 dark:text-stone-400 uppercase tracking-wider">
            {today}
          </span>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
