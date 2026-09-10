"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  Calendar,
  LayoutDashboard,
  Store,
  Truck,
  Coffee,
  Settings,
  MessageCircle,
  LucideIcon,
  Users,
  Sparkles,
} from "lucide-react";

interface PageConfig {
  title: React.ReactNode;
  description: string;
  icon: LucideIcon;
  iconColor?: string;
}

// Route configuration - single source of truth
const PAGE_CONFIG: Record<string, PageConfig> = {
  "/admin": {
    title: "Dashboard",
    description: "Ringkasan bisnis hari ini",
    icon: LayoutDashboard,
  },
  "/admin/orders": {
    title: (
      <>
        Pesanan <span className="text-amber-500">Pickup</span>
      </>
    ),
    description: "Kelola pesanan ambil ditempat",
    icon: Store,
  },
  "/admin/delivery": {
    title: "Pengiriman",
    description: "Kelola pesanan delivery dan kurir",
    icon: Truck,
  },
  "/admin/products": {
    title: (
      <>
        Produk <span className="text-amber-500">& Menu</span>
      </>
    ),
    description: "Kelola daftar menu dan harga",
    icon: Coffee,
  },
  "/admin/options": {
    title: (
      <>
        Opsi <span className="text-amber-500">Menu</span>
      </>
    ),
    description: "Kelola varian rasa, topping, dan ukuran",
    icon: Settings,
  },
  "/admin/customers": {
    title: (
      <>
        Data <span className="text-amber-500">Pelanggan</span>
      </>
    ),
    description: "Kelola data pelanggan dan riwayat transaksi",
    icon: Users,
  },
  "/admin/settings": {
    title: "Pengaturan",
    description: "Kelola profil dan preferensi",
    icon: Settings,
  },
  "/admin/settings/whatsapp": {
    title: (
      <>
        Integrasi <span className="text-emerald-500">WhatsApp</span>
      </>
    ),
    description: "Hubungkan Robot WA Gateway untuk notifikasi otomatis",
    icon: MessageCircle,
    iconColor: "text-emerald-600",
  },
  "/admin/promos": {
    title: (
      <>
        Promo <span className="text-amber-500">Banners</span>
      </>
    ),
    description: "Kelola banner promosi aplikasi pelanggan",
    icon: Sparkles,
  },
};

export default function Header() {
  const pathname = usePathname();

  // Get page config based on current route
  const config = PAGE_CONFIG[pathname] || {
    title: "Admin",
    description: "",
    icon: LayoutDashboard,
  };

  const Icon = config.icon;
  const iconColor = config.iconColor || "text-amber-600";

  // Tanggal hari ini
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="flex h-24 shrink-0 items-center justify-between gap-4 border-b border-white/5 bg-stone-950 px-8 z-30 shadow-2xl">
      {/* LEFT: Page Title with Icon */}
      <div className="flex items-center gap-5">
        <div
          className={`w-12 h-12 bg-stone-900 rounded-2xl flex items-center justify-center border border-white/5 shadow-lg shadow-black/20 ${iconColor}`}
        >
          <Icon size={22} aria-hidden="true" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight leading-none uppercase italic">
            {config.title}
          </h1>
          {config.description && (
            <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mt-1">
              {config.description}
            </p>
          )}
        </div>
      </div>

      {/* RIGHT: Date */}
      <div className="flex items-center gap-3 px-5 py-2.5 bg-stone-900 rounded-[1rem] border border-white/5 shadow-inner">
        <Calendar size={18} className="text-amber-500" strokeWidth={2.5} />
        <span className="text-xs font-black text-stone-400 uppercase tracking-wider">
          {today}
        </span>
      </div>
    </header>
  );
}
