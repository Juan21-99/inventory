"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Modal from "../../components/ui/Modal";
import {
  LayoutDashboard,
  Boxes,
  ArrowDownToLine,
  ArrowUpFromLine,
  FileSpreadsheet,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface MenuItem {
  name: string;
  icon: React.ElementType;
  path: string;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

export default function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar_collapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar_collapsed", String(next));
      return next;
    });
  };

  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    setShowLogoutModal(false);
    router.push("/login");
  };

  // Menu Groups tailored for Inventory Inspektorat
  const menuGroups: MenuGroup[] = [
    {
      title: "Ringkasan",
      items: [
        {
          name: "Dashboard",
          icon: LayoutDashboard,
          path: "/admin",
        },
      ],
    },
    {
      title: "Logistik & Aset",
      items: [
        {
          name: "Inventaris Gudang",
          icon: Boxes,
          path: "/admin/gudang",
        },
        {
          name: "Barang Masuk",
          icon: ArrowDownToLine,
          path: "/admin/barang-masuk",
        },
        {
          name: "Barang Keluar",
          icon: ArrowUpFromLine,
          path: "/admin/barang-keluar",
        },
        {
          name: "Laporan Mutasi",
          icon: FileSpreadsheet,
          path: "/admin/laporan",
        },
      ],
    },
    {
      title: "Akun & Sistem",
      items: [
        {
          name: "Pengaturan",
          icon: Settings,
          path: "/admin/pengaturan",
        },
      ],
    },
  ];

  return (
    <>
      <aside
        className={`relative flex flex-col h-screen bg-white dark:bg-stone-950 border-r border-stone-200 dark:border-white/5 transition-[width] duration-300 ease-out will-change-[width] shadow-sm dark:shadow-2xl ${isCollapsed ? "w-[90px]" : "w-[280px]"
          }`}
      >
        {/* LOGO */}
        <div className="flex items-center gap-4 p-6 h-24 border-b border-stone-200 dark:border-white/5">
          <Link
            href="/admin"
            className="flex items-center gap-4 hover:opacity-80 transition-opacity"
          >
            <div className="relative flex items-center justify-center flex-shrink-0 w-11 h-11 bg-white border border-stone-200 rounded-xl p-1.5 shadow-sm dark:shadow-lg dark:shadow-black/20 ring-1 ring-stone-900/5 dark:ring-white/10">
              <Image
                src="/logo.png"
                alt="Logo Inspektorat"
                width={32}
                height={32}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div
              className={`flex flex-col ${isCollapsed
                  ? "opacity-0 hidden"
                  : "opacity-100 animate-in fade-in slide-in-from-left-2 duration-300"
                }`}
            >
              <span className="font-black text-stone-900 dark:text-white text-xl tracking-tight leading-none uppercase italic">
                Inventaris<span className="text-amber-500">.</span>
              </span>
              <span className="text-[9px] font-bold text-stone-500 tracking-[0.2em] uppercase mt-1">
                Inspektorat Sumut
              </span>
            </div>
          </Link>
        </div>

        {/* TOGGLE */}
        <button
          type="button"
          onClick={toggleCollapse}
          className="absolute -right-3 top-24 bg-white dark:bg-stone-900 border border-stone-200 dark:border-white/10 rounded-full p-2 shadow-md dark:shadow-xl dark:shadow-black/50 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:border-amber-500/50 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all z-20 cursor-pointer"
          aria-label={isCollapsed ? "Buka Sidebar" : "Tutup Sidebar"}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* NAV */}
        <nav className="flex-1 py-6 px-4 space-y-8 overflow-y-auto overflow-x-hidden scrollbar-hide">
          {menuGroups.map((group) => (
            <div key={group.title}>
              {!isCollapsed && (
                <h3 className="px-4 mb-3 text-[10px] font-black text-stone-400 dark:text-stone-600 uppercase tracking-[0.2em]">
                  {group.title}
                </h3>
              )}
              <div className="space-y-1.5">
                {group.items.map((item) => {
                  const isActive =
                    item.path === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.path);

                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative ${isActive
                          ? "bg-stone-100 dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm dark:shadow-lg dark:shadow-black/20 border border-stone-200 dark:border-white/5 font-bold"
                          : "text-stone-600 dark:text-stone-400 hover:bg-stone-100/80 dark:hover:bg-stone-900/50 hover:text-stone-900 dark:hover:text-white border border-transparent font-medium"
                        }`}
                      title={isCollapsed ? item.name : ""}
                    >
                      <div
                        className={`relative ${isActive
                            ? "text-amber-500"
                            : "text-stone-400 dark:text-stone-500 group-hover:text-amber-500"
                          } transition-colors duration-300`}
                      >
                        <item.icon
                          size={22}
                          strokeWidth={isActive ? 2.5 : 2}
                          className="flex-shrink-0"
                        />
                        {isActive && (
                          <div className="absolute inset-0 bg-amber-500/20 blur-md rounded-full -z-10" />
                        )}
                      </div>

                      {!isCollapsed && (
                        <span className="flex-1 whitespace-nowrap text-sm">
                          {item.name}
                        </span>
                      )}

                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-amber-500 rounded-r-full shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                      )}

                      {isCollapsed && (
                        <div className="absolute left-full ml-4 px-3 py-2 bg-stone-900 border border-white/10 text-white text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap pointer-events-none z-50 shadow-xl translate-x-2 group-hover:translate-x-0">
                          {item.name}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* FOOTER */}
        <div className="p-4 border-t border-stone-200 dark:border-white/5 bg-stone-50/50 dark:bg-stone-900/10">
          <Link
            href="/admin/pengaturan"
            className={`flex items-center gap-3 p-3 rounded-2xl hover:bg-stone-100 dark:hover:bg-stone-900 border border-transparent hover:border-stone-200 dark:hover:border-white/5 transition-all cursor-pointer group ${isCollapsed ? "justify-center" : ""
              }`}
          >
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-xl ring-1 ring-stone-900/5 dark:ring-white/10 group-hover:ring-amber-500/50 shadow-sm dark:shadow-lg overflow-hidden transition-all bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-600 dark:text-stone-400 font-bold group-hover:text-amber-500">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name || "Avatar"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  profile?.full_name?.charAt(0).toUpperCase() ||
                  user?.email?.charAt(0).toUpperCase() ||
                  "A"
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-stone-950 rounded-full shadow-lg" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-stone-900 dark:text-white truncate group-hover:text-amber-500 transition-colors">
                  {profile?.full_name || "Admin Inspektorat"}
                </p>
                <p className="text-[10px] text-stone-500 truncate uppercase tracking-wider font-bold">
                  {user?.email || "admin@inspektorat.go.id"}
                </p>
              </div>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className={`mt-2 w-full flex items-center gap-3 p-3 rounded-xl text-stone-500 hover:text-red-600 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all cursor-pointer border border-transparent hover:border-red-200 dark:hover:border-red-500/20 group ${isCollapsed ? "justify-center" : "pl-4"
              }`}
          >
            <LogOut
              size={18}
              className="group-hover:-translate-x-1 transition-transform"
            />
            {!isCollapsed && (
              <span className="text-xs font-bold uppercase tracking-wider">
                Keluar
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* LOGOUT MODAL */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Konfirmasi Keluar"
        description="Apakah Anda yakin ingin keluar dari aplikasi admin?"
      >
        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={() => setShowLogoutModal(false)}
            className="px-4 py-2 text-sm font-medium text-stone-300 bg-stone-800 hover:bg-stone-700 rounded-lg transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm shadow-red-500/20 cursor-pointer"
          >
            Keluar
          </button>
        </div>
      </Modal>
    </>
  );
}
