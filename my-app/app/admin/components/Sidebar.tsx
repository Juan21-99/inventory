"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import Modal from "../../components/ui/Modal";
import {
  LayoutDashboard,
  Coffee,
  Truck,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Store,
  Bell,
  Volume2,
  MessageCircle,
  Sparkles,
  Users,
} from "lucide-react";

// Helper to unlock audio silently
const unlockAudio = (audio: HTMLAudioElement) => {
  return new Promise<void>((resolve, reject) => {
    const playPromise = audio.play();
    playPromise
      .then(() => {
        audio.pause();
        audio.currentTime = 0;
        resolve();
      })
      .catch((error) => {
        reject(error);
      });
  });
};

interface MenuItem {
  name: string;
  icon: React.ElementType;
  path: string;
  count?: number;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

export default function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Audio Permission State
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);

  // Badge Counters & Notif Logic
  const [newPickupCount, setNewPickupCount] = useState(0);
  const [newDeliveryCount, setNewDeliveryCount] = useState(0);
  const [showToast, setShowToast] = useState<{
    message: string;
    type: "pickup" | "delivery";
  } | null>(null);

  // Ref
  const prevPickupCountRef = useRef(0);
  const prevDeliveryCountRef = useRef(0);
  const isFirstLoadRef = useRef(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();

  // Initialize Audio Object
  useEffect(() => {
    audioRef.current = new Audio("/sounds/notif.mp3");

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Auto-unlock audio on user interaction
  useEffect(() => {
    const handleInteraction = () => {
      if (audioRef.current && !isAudioEnabled) {
        unlockAudio(audioRef.current)
          .then(() => {
            setIsAudioEnabled(true);
          })
          .catch((err) => {
            console.log("Audio unlock pending, waiting for interaction", err);
          });
      }
    };

    globalThis.addEventListener("click", handleInteraction);
    globalThis.addEventListener("keydown", handleInteraction);
    globalThis.addEventListener("touchstart", handleInteraction);

    return () => {
      globalThis.removeEventListener("click", handleInteraction);
      globalThis.removeEventListener("keydown", handleInteraction);
      globalThis.removeEventListener("touchstart", handleInteraction);
    };
  }, [isAudioEnabled]);

  // Manual enable audio button
  const enableAudio = () => {
    if (audioRef.current) {
      unlockAudio(audioRef.current).then(() => setIsAudioEnabled(true));
    }
  };

  const playNotificationSound = useCallback(() => {
    console.log("[NOTIF] playNotificationSound called", {
      isAudioEnabled,
      hasAudioRef: !!audioRef.current,
    });

    if (!isAudioEnabled || !audioRef.current) {
      console.warn("[NOTIF] Cannot play: audio not enabled or ref missing");
      return;
    }

    audioRef.current.currentTime = 0;
    audioRef.current
      .play()
      .then(() => {
        console.log("[NOTIF] ✅ Sound played successfully!");
      })
      .catch((err) => {
        console.error("[NOTIF] ❌ Audio playback blocked:", err);
      });
  }, [isAudioEnabled]);

  // Cleanup toast timer
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  // Listen Supabase & Trigger Notifications
  useEffect(() => {
    // Sync avatar from profile
    if (profile) {
      setAvatarUrl(profile.avatar_url);
    }

    const fetchInitialCounts = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("order_type")
        .eq("status", "new");

      if (!error && data) {
        let pickup = 0;
        let delivery = 0;
        data.forEach((order) => {
          if (order.order_type === "delivery") delivery++;
          else pickup++;
        });
        setNewPickupCount(pickup);
        setNewDeliveryCount(delivery);
        prevPickupCountRef.current = pickup;
        prevDeliveryCountRef.current = delivery;
        isFirstLoadRef.current = false;
      }
    };

    fetchInitialCounts();

    const channel = supabase
      .channel("sidebar_notifications")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async (payload: any) => {
          console.log("[NOTIF] Postgres Change Received:", payload);

          // 1. Play sound and show toast on NEW orders (INSERT event)
          if (payload.eventType === "INSERT" && payload.new?.status === "new") {
            playNotificationSound();
            const orderType =
              payload.new.order_type === "delivery" ? "delivery" : "pickup";
            const emoji = orderType === "delivery" ? "🛵" : "🛍️";
            const typeLabel = orderType === "delivery" ? "Delivery" : "Pickup";

            setShowToast({
              message: `Pesanan ${typeLabel} Baru! ${emoji}`,
              type: orderType,
            });

            if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
            toastTimerRef.current = setTimeout(() => setShowToast(null), 5000);
          }

          // 2. Always re-fetch total counts to keep badges synced
          const { data, error } = await supabase
            .from("orders")
            .select("order_type")
            .eq("status", "new");

          if (!error && data) {
            let pickup = 0;
            let delivery = 0;
            data.forEach((order) => {
              if (order.order_type === "delivery") delivery++;
              else pickup++;
            });

            setNewPickupCount(pickup);
            setNewDeliveryCount(delivery);
            prevPickupCountRef.current = pickup;
            prevDeliveryCountRef.current = delivery;
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, isAudioEnabled, profile, playNotificationSound]);

  // Menu Definitions
  const menuGroups: MenuGroup[] = [
    {
      title: "Ringkasan",
      items: [{ name: "Dashboard", icon: LayoutDashboard, path: "/admin" }],
    },
    {
      title: "Operasional",
      items: [
        {
          name: "Pesanan Pickup",
          icon: Store,
          path: "/admin/orders",
          count: newPickupCount,
        },
        {
          name: "Pesanan Delivery",
          icon: Truck,
          path: "/admin/delivery",
          count: newDeliveryCount,
        },
        {
          name: "Pelanggan",
          icon: Users,
          path: "/admin/customers",
        },
      ],
    },
    {
      title: "Katalog",
      items: [
        { name: "Produk & Menu", icon: Coffee, path: "/admin/products" },
        { name: "Opsi Menu", icon: Settings, path: "/admin/options" },
      ],
    },
    {
      title: "Pemasaran",
      items: [
        { name: "Banner & Promo", icon: Sparkles, path: "/admin/promos" },
      ],
    },
    {
      title: "Akun",
      items: [
        { name: "Pengaturan", icon: Settings, path: "/admin/settings" },
        {
          name: "Integrasi WA",
          icon: MessageCircle,
          path: "/admin/settings/whatsapp",
        },
      ],
    },
  ];

  const handleLogout = async () => {
    await signOut();
    setShowLogoutModal(false);
  };

  return (
    <>
      <aside
        className={`relative flex flex-col h-screen bg-stone-950 border-r border-white/5 transition-[width] duration-300 ease-out will-change-[width] shadow-2xl ${
          isCollapsed ? "w-[90px]" : "w-[280px]"
        }`}
      >
        {/* LOGO */}
        <div className="flex items-center gap-4 p-6 h-24 border-b border-white/5">
          <a
            href={process.env.NEXT_PUBLIC_BRAND_LINK || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 hover:opacity-80 transition-opacity"
            title="Kunjungi Instagram Alin Coffee"
          >
            <div className="relative flex items-center justify-center flex-shrink-0 w-11 h-11 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl text-stone-950 shadow-lg shadow-amber-500/20 ring-1 ring-amber-400/50">
              <Coffee strokeWidth={2.5} size={22} />
            </div>
            <div
              className={`flex flex-col ${isCollapsed ? "opacity-0 hidden" : "opacity-100 animate-in fade-in slide-in-from-left-2 duration-300"}`}
            >
              <span className="font-black text-white text-xl tracking-tight leading-none uppercase italic">
                Alin<span className="text-amber-500">Coffee</span>
              </span>
              <span className="text-[9px] font-bold text-stone-500 tracking-[0.2em] uppercase mt-1">
                Admin Panel
              </span>
            </div>
          </a>
        </div>

        {/* AUDIO PERMISSION BANNER - Always visible when needed */}
        {!isAudioEnabled && (
          <div
            className={`mt-4 p-3 mx-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 backdrop-blur-md ${isCollapsed ? "hidden" : "block"}`}
          >
            <div className="flex items-center gap-2 text-amber-500 text-xs font-black uppercase tracking-wide">
              <Volume2 size={14} className="animate-pulse" /> Suara Notifikasi
            </div>
            <button
              onClick={enableAudio}
              type="button"
              className="w-full bg-amber-500 text-stone-950 rounded-xl font-bold py-2 text-xs shadow-lg shadow-amber-500/10 hover:bg-amber-400 hover:shadow-amber-500/30 active:scale-95 transition-all cursor-pointer uppercase tracking-wider"
              title="Aktifkan Suara Notifikasi"
            >
              Aktifkan
            </button>
          </div>
        )}

        {/* TOGGLE */}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-24 bg-stone-900 border border-white/10 rounded-full p-2 shadow-xl shadow-black/50 text-stone-400 hover:text-white hover:border-amber-500/50 hover:bg-stone-800 transition-all z-20 cursor-pointer"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* NAV */}
        <nav
          className={`flex-1 py-6 px-4 space-y-8 overflow-y-auto overflow-x-hidden scrollbar-hide`}
        >
          {menuGroups.map((group) => (
            <div key={group.title}>
              {!isCollapsed && (
                <h3 className="px-4 mb-3 text-[10px] font-black text-stone-600 uppercase tracking-[0.2em]">
                  {group.title}
                </h3>
              )}
              <div className="space-y-1.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.path;
                  const myCount = item.count || 0;
                  const showBadge = myCount > 0;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative ${
                        isActive
                          ? "bg-stone-900 text-white shadow-lg shadow-black/20 border border-white/5"
                          : "text-stone-500 hover:bg-stone-900/50 hover:text-white hover:border-white/5 border border-transparent"
                      }`}
                      title={isCollapsed ? item.name : ""}
                    >
                      <div
                        className={`relative ${isActive ? "text-amber-500" : "text-stone-600 group-hover:text-amber-500"} transition-colors duration-300`}
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
                        <span
                          className={`flex-1 whitespace-nowrap text-sm ${isActive ? "font-bold" : "font-medium"}`}
                        >
                          {item.name}
                        </span>
                      )}

                      {showBadge &&
                        (isCollapsed ? (
                          <span className="absolute top-2 right-3 w-2.5 h-2.5 bg-amber-500 rounded-full border border-stone-950 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]"></span>
                        ) : (
                          <span className="px-2 py-0.5 bg-amber-500 text-stone-950 text-[10px] font-black rounded-lg shadow-lg shadow-amber-500/20 animate-in zoom-in duration-300">
                            {myCount}
                          </span>
                        ))}

                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-amber-500 rounded-r-full shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                      )}

                      {isCollapsed && (
                        <div className="absolute left-full ml-4 px-3 py-2 bg-stone-900 border border-white/10 text-white text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap pointer-events-none z-50 shadow-xl translate-x-2 group-hover:translate-x-0">
                          {item.name}
                          {showBadge && (
                            <span className="ml-2 text-amber-500">
                              ({myCount})
                            </span>
                          )}
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
        <div className="p-4 border-t border-white/5 bg-stone-900/10">
          <Link
            href="/admin/settings"
            className={`flex items-center gap-3 p-3 rounded-2xl hover:bg-stone-900 border border-transparent hover:border-white/5 transition-all cursor-pointer group ${isCollapsed ? "justify-center" : ""}`}
          >
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-xl ring-1 ring-white/10 group-hover:ring-amber-500/50 shadow-lg overflow-hidden transition-all">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-stone-800 flex items-center justify-center text-stone-400 font-bold group-hover:text-amber-500 transition-colors">
                    {user?.email?.charAt(0).toUpperCase() || "A"}
                  </div>
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-stone-950 rounded-full shadow-lg"></div>
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate group-hover:text-amber-500 transition-colors">
                  {profile?.full_name || "Admin"}
                </p>
                <p className="text-[10px] text-stone-500 truncate uppercase tracking-wider font-bold">
                  {user?.email}
                </p>
              </div>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className={`mt-2 w-full flex items-center gap-3 p-3 rounded-xl text-stone-500 hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer border border-transparent hover:border-red-500/20 group ${isCollapsed ? "justify-center" : "pl-4"}`}
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

      {/* TOAST NOTIFICATION */}
      {showToast && (
        <div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-right-10 fade-in duration-300">
          <div className="bg-stone-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 min-w-[300px] border border-stone-700">
            <div
              className={`p-2 rounded-full ${showToast.type === "pickup" ? "bg-amber-500" : "bg-indigo-500"} text-white`}
            >
              <Bell size={20} className="animate-bounce" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Pesanan Baru!</h4>
              <p className="text-xs text-stone-300 mt-0.5">
                {showToast.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowToast(null)}
              className="ml-auto text-stone-500 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* LOGOUT MODAL */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Konfirmasi Keluar"
        description="Apakah Anda yakin ingin keluar dari aplikasi admin?"
        isDraggable={false}
      >
        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={() => setShowLogoutModal(false)}
            className="px-4 py-2 text-sm font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm shadow-red-200 cursor-pointer"
          >
            Keluar
          </button>
        </div>
      </Modal>
    </>
  );
}
