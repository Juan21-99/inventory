"use client";

import React from "react";
import { Home, Receipt, User } from "lucide-react";
import Image from "next/image";

import { Order, Profile } from "../types";

interface BottomNavProps {
  activeTab: "menu" | "status" | "profile";
  setActiveTab: (tab: "menu" | "status" | "profile") => void;
  myOrders: Order[];
  profile: Profile | null;
}

export default function BottomNav({
  activeTab,
  setActiveTab,
  myOrders,
  profile,
}: Readonly<BottomNavProps>) {
  const hasActiveOrders = myOrders.some(
    (o) => o.status !== "completed" && o.status !== "cancelled",
  );

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[340px]">
      <div className="flex items-center justify-between p-1.5 bg-stone-900/95 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl shadow-stone-900/40 transform transition-all hover:scale-105 duration-300 gap-1">
        <button
          onClick={() => setActiveTab("menu")}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full transition-all duration-300 cursor-pointer relative overflow-hidden group
            ${activeTab === "menu" ? "bg-amber-600 text-white shadow-lg shadow-amber-900/20" : "text-stone-400 hover:text-white hover:bg-white/5"}`}
        >
          <div className="relative z-10 flex items-center gap-2">
            <Home size={18} strokeWidth={activeTab === "menu" ? 2.5 : 2} />
            {activeTab === "menu" && (
              <span className="text-xs font-bold animate-in fade-in slide-in-from-left-2 duration-300">
                Home
              </span>
            )}
          </div>
        </button>

        <button
          onClick={() => setActiveTab("status")}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full transition-all duration-300 cursor-pointer relative overflow-hidden group
            ${activeTab === "status" ? "bg-amber-600 text-white shadow-lg shadow-amber-900/20" : "text-stone-400 hover:text-white hover:bg-white/5"}`}
        >
          <div className="relative z-10 flex items-center gap-2">
            <Receipt size={18} strokeWidth={activeTab === "status" ? 2.5 : 2} />
            {activeTab === "status" && (
              <span className="text-xs font-bold animate-in fade-in duration-300">
                Orders
              </span>
            )}
            {/* Notification Dot */}
            {activeTab !== "status" && hasActiveOrders && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-stone-900"></span>
            )}
          </div>
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full transition-all duration-300 cursor-pointer relative overflow-hidden group
            ${activeTab === "profile" ? "bg-amber-600 text-white shadow-lg shadow-amber-900/20" : "text-stone-400 hover:text-white hover:bg-white/5"}`}
        >
          <div className="relative z-10 flex items-center gap-2">
            {profile?.avatar_url ? (
              <div
                className={`rounded-full overflow-hidden border transition-all duration-300 relative ${
                  activeTab === "profile"
                    ? "w-5 h-5 border-white" // Small when active (to fit text)
                    : "w-7 h-7 border-stone-500" // Large when inactive (standout)
                }`}
              >
                <Image
                  src={profile.avatar_url}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <User size={18} strokeWidth={activeTab === "profile" ? 2.5 : 2} />
            )}
            {activeTab === "profile" && (
              <span className="text-xs font-bold animate-in fade-in slide-in-from-right-2 duration-300">
                Profile
              </span>
            )}
          </div>
        </button>
      </div>
    </div>
  );
}
