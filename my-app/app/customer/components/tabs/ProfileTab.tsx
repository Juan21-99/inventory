"use client";

import React from "react";
import {
  User,
  Mail,
  Settings,
  Store,
  Receipt,
  ChevronRight,
  LogOut,
} from "lucide-react";

interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  role: "customer" | "admin";
  avatar_url: string | null;
}

interface ProfileTabProps {
  readonly setIsEditProfileOpen: (open: boolean) => void;
  readonly setIsAddressesOpen: (open: boolean) => void;
  readonly setIsLogoutOpen: (open: boolean) => void;
  readonly setActiveTab: (tab: "menu" | "status" | "profile") => void;
  readonly profile: Profile | null;
  readonly userEmail?: string;
}

export default function ProfileTab({
  setIsEditProfileOpen,
  setIsAddressesOpen,
  setIsLogoutOpen,
  setActiveTab,
  profile,
  userEmail,
}: ProfileTabProps) {
  return (
    <div className="pt-24 px-4 min-h-screen animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
      <h2 className="text-3xl font-black mb-8 px-1 tracking-tighter uppercase text-white">
        Profil Saya
      </h2>

      <div className="space-y-4">
        {/* Profile Card */}
        <div className="bg-stone-900/50 border border-white/5 rounded-3xl p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-amber-500/10 transition-colors duration-500" />

          <div className="flex items-center gap-6 relative z-10">
            <div className="w-20 h-20 bg-stone-900 rounded-3xl flex items-center justify-center shadow-xl shadow-amber-500/20 border-2 border-amber-500 overflow-hidden">
              {profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name || "Avatar"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={40} className="text-stone-500" strokeWidth={2.5} />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                {profile?.full_name || "Pelanggan"}
              </h3>
              <p className="text-stone-400 text-sm">Pelanggan Setia</p>
            </div>
          </div>

          <div className="mt-10 space-y-4 pt-6 text-stone-100 border-t border-white/5 relative z-10">
            <div className="flex items-center justify-between group/item">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-stone-950 rounded-2xl flex items-center justify-center text-stone-500 group-hover/item:text-amber-500 transition-colors">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-stone-600 uppercase tracking-widest">
                    Email
                  </p>
                  <p className="text-sm font-medium text-stone-300">
                    {userEmail || profile?.email || "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between group/item">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-stone-950 rounded-2xl flex items-center justify-center text-stone-500 group-hover/item:text-[#25D366] transition-colors">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5 fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-4.821 4.992a6.3 6.3 0 0 1-3.111-.817l-.223-.133-2.31.606.617-2.254-.146-.233a6.29 6.29 0 0 1-.965-3.35c0-3.483 2.836-6.319 6.321-6.319a6.3 6.3 0 0 1 6.32 6.32 6.3 6.3 0 0 1-6.319 6.32m0-13.824C9.175 5.55 5.549 9.176 5.549 13.593c0 1.412.367 2.793 1.064 4.004L5.6 20.6l3.114-.817a8.03 8.03 0 0 0 3.931 1.028h.003c4.417 0 8.043-3.626 8.043-8.044a8.04 8.04 0 0 0-8.043-8.043" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-black text-stone-600 uppercase tracking-widest">
                    WhatsApp
                  </p>
                  <p className="text-sm font-medium text-stone-300">
                    {profile?.phone || "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* iOS Style Compact Menu Group */}
        <div className="bg-stone-900/40 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden">
          <button
            onClick={() => setIsEditProfileOpen(true)}
            className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-all active:scale-[0.98] cursor-pointer group text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                <Settings size={20} />
              </div>
              <span className="font-bold text-stone-200 tracking-tight">
                Pengaturan Akun
              </span>
            </div>
            <ChevronRight
              size={18}
              className="text-stone-600 group-hover:text-stone-300 transition-colors"
            />
          </button>

          <div className="h-[1px] bg-white/5 mx-5" />

          <button
            onClick={() => setIsAddressesOpen(true)}
            className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-all active:scale-[0.98] cursor-pointer group text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400">
                <Store size={20} />
              </div>
              <span className="font-bold text-stone-200 tracking-tight">
                Daftar Alamat
              </span>
            </div>
            <ChevronRight
              size={18}
              className="text-stone-600 group-hover:text-stone-300 transition-colors"
            />
          </button>

          <div className="h-[1px] bg-white/5 mx-5" />

          <button
            onClick={() => setActiveTab("status")}
            className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-all active:scale-[0.98] cursor-pointer group text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400">
                <Receipt size={20} />
              </div>
              <span className="font-bold text-stone-200 tracking-tight">
                Riwayat Transaksi
              </span>
            </div>
            <ChevronRight
              size={18}
              className="text-stone-600 group-hover:text-stone-300 transition-colors"
            />
          </button>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => setIsLogoutOpen(true)}
          className="w-full flex items-center justify-center gap-3 py-4.5 bg-red-500/[0.03] border border-red-500/10 rounded-2xl text-red-500/80 hover:bg-red-500/10 hover:text-red-500 transition-all active:scale-95 cursor-pointer mt-6 group/logout"
        >
          <LogOut
            size={18}
            className="group-hover:translate-x-0.5 transition-transform"
          />
          <span className="font-black tracking-[0.15em] text-[10px] uppercase">
            Keluar Akun
          </span>
        </button>
      </div>
      <footer className="mt-10 text-center">
        <p className="text-[10px] font-black text-stone-800 uppercase tracking-[0.5em] select-none">
          ALIN CREATIVE STUDIO
        </p>
      </footer>
    </div>
  );
}
