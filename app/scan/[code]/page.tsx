"use client";

import React, { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Boxes,
  Building2,
  User,
  Calendar,
  DollarSign,
  FileText,
  ShieldCheck,
  Tag,
  AlertTriangle,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ScanPageProps {
  params: Promise<{ code: string }>;
}

export default function AssetScanVerificationPage({ params }: ScanPageProps) {
  const resolvedParams = use(params);
  const rawCode = resolvedParams.code;
  const decodedCode = decodeURIComponent(rawCode);

  const [item, setItem] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // 1. Fetch Item from Supabase
        const { data: itemData, error: itemError } = await supabase
          .from("items")
          .select("*")
          .eq("code", decodedCode)
          .maybeSingle();

        if (itemError || !itemData) {
          setNotFound(true);
        } else {
          setItem(itemData);
        }

        // 2. Fetch System Settings
        const { data: settingsData } = await supabase
          .from("system_settings")
          .select("*")
          .limit(1)
          .maybeSingle();

        if (settingsData) {
          setSettings(settingsData);
        }
      } catch (err) {
        console.error("Error fetching asset scan data:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [decodedCode]);

  return (
    <div className="min-h-screen bg-stone-950 text-white flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-lg space-y-5">
        {/* Header Branding */}
        <div className="flex items-center gap-3 bg-stone-900/60 p-4 rounded-3xl border border-white/5 shadow-xl backdrop-blur-md">
          <div className="w-12 h-12 relative shrink-0">
            <Image
              src="/logo.png"
              alt="Logo Instansi"
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 truncate">
              {settings?.institution_name || "Pemerintah Provinsi Sumatera Utara"}
            </h3>
            <h2 className="text-sm font-black uppercase text-white truncate">
              {settings?.sub_name || "Inspektorat Daerah Provinsi Sumatera Utara"}
            </h2>
            <p className="text-[10px] text-stone-400">
              Sistem Informasi Manajemen Inventaris & Aset Terpadu
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-12 text-center space-y-3 bg-stone-900/40 rounded-3xl border border-white/5">
            <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-stone-400 font-semibold tracking-wider uppercase">
              Memverifikasi data aset di Supabase...
            </p>
          </div>
        )}

        {/* Not Found State */}
        {!loading && notFound && (
          <div className="p-8 text-center space-y-4 bg-stone-900/60 rounded-3xl border border-red-500/20 shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto border border-red-500/20">
              <AlertTriangle size={28} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-white">
                Aset Tidak Ditemukan
              </h3>
              <p className="text-xs text-stone-400">
                Kode registrasi <span className="font-mono text-amber-400 font-bold">{decodedCode}</span> belum terdaftar di basis data inventaris.
              </p>
            </div>
            <Link
              href="/admin/gudang"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-all"
            >
              <ArrowLeft size={14} />
              <span>Kembali ke Inventaris Gudang</span>
            </Link>
          </div>
        )}

        {/* Found Asset Detail Card */}
        {!loading && item && (
          <div className="p-6 rounded-[2.2rem] bg-stone-900/90 border border-white/10 shadow-2xl space-y-5">
            {/* Verified Badge */}
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                <ShieldCheck size={16} />
                <span>Aset Terdaftar & Terverifikasi</span>
              </div>
              <span className="font-mono text-xs font-black text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
                {item.code}
              </span>
            </div>

            {/* Asset Photo & Title */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="w-24 h-24 rounded-2xl bg-stone-950 border border-white/10 relative overflow-hidden shrink-0 flex items-center justify-center">
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <Boxes size={36} className="text-amber-500/70" />
                )}
              </div>

              <div className="min-w-0 space-y-1">
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider">
                  {item.category}
                </span>
                <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  {item.name}
                </h1>
                <p className="text-xs text-stone-400">
                  Kondisi:{" "}
                  <span
                    className={`font-bold ${
                      item.condition === "Baik" ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {item.condition}
                  </span>
                  {" · "}
                  Fisik: <strong className="text-stone-200">{item.stock} {item.unit}</strong>
                </p>
              </div>
            </div>

            {/* Specification Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-3.5 rounded-2xl bg-stone-950/70 border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-stone-500 font-bold uppercase text-[10px]">
                  <Building2 size={13} className="text-amber-500" />
                  Ruangan / Lokasi
                </div>
                <p className="font-bold text-white text-xs truncate">
                  {item.location || "-"}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-950/70 border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-stone-500 font-bold uppercase text-[10px]">
                  <User size={13} className="text-amber-500" />
                  Penanggung Jawab
                </div>
                <p className="font-bold text-white text-xs truncate">
                  {item.person_in_charge || "-"}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-950/70 border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-stone-500 font-bold uppercase text-[10px]">
                  <Calendar size={13} className="text-amber-500" />
                  Tanggal Pembukuan
                </div>
                <p className="font-bold text-white text-xs truncate">
                  {item.received_at || "-"}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-950/70 border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-stone-500 font-bold uppercase text-[10px]">
                  <DollarSign size={13} className="text-amber-500" />
                  Nilai Perolehan
                </div>
                <p className="font-bold text-amber-400 text-xs truncate">
                  {item.price ? `Rp ${item.price.toLocaleString("id-ID")}` : "-"}
                </p>
              </div>
            </div>

            {/* Notes if any */}
            {item.notes && (
              <div className="p-3.5 rounded-2xl bg-stone-950/70 border border-white/5 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-stone-500 font-bold uppercase text-[10px]">
                  <FileText size={13} className="text-amber-500" />
                  Catatan / No. Seri
                </div>
                <p className="text-stone-300 leading-relaxed">{item.notes}</p>
              </div>
            )}

            {/* Action Footer */}
            <div className="pt-2 flex items-center justify-between gap-3 border-t border-white/10">
              <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold transition-all cursor-pointer"
              >
                <ExternalLink size={14} />
                <span>Masuk Petugas</span>
              </Link>

              <Link
                href="/admin/gudang"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <span>Inventaris Gudang</span>
              </Link>
            </div>
          </div>
        )}

        <div className="text-center">
          <p className="text-[10px] text-stone-500">
            © {new Date().getFullYear()} {settings?.sub_name || "Inspektorat Daerah Provinsi Sumatera Utara"} · Inventra Inventory System
          </p>
        </div>
      </div>
    </div>
  );
}
