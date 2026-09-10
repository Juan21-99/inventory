"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Upload,
  Sparkles,
  X,
  Boxes,
  Building2,
  User,
  Calendar,
  FileText,
  Briefcase,
  ArrowUpFromLine,
  XCircle,
  Package,
  Send,
  ShieldCheck,
  Clock,
  RefreshCw,
} from "lucide-react";
import Modal from "@/app/components/ui/Modal";
import { CustomDropdown, DropdownOption } from "@/app/components/ui/CustomDropdown";
import { CustomDatePicker } from "@/app/components/ui/CustomDatePicker";
import { OutgoingFormData, DistributionPurpose, OutgoingStatus } from "../../types/outgoing.types";
import { InventoryItem, LocationRoom } from "../../types/item.types";
import { usePurposes } from "../hooks/usePurposes";
import { useStatuses } from "../hooks/useStatuses";

interface OutgoingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: OutgoingFormData) => Promise<void>;
  items: InventoryItem[];
  locations: LocationRoom[];
}

export const OutgoingFormModal: React.FC<OutgoingFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  items,
  locations,
}) => {
  const { purposes } = usePurposes();
  const { statuses } = useStatuses();
  const [formData, setFormData] = useState<OutgoingFormData>({
    transaction_number: "",
    date: new Date().toISOString().split("T")[0],
    item_id: "",
    item_code: "",
    item_name: "",
    category: "Elektronik",
    quantity: 1,
    unit: "Unit",
    purpose: "Operasional Audit Lapangan",
    target_location: locations[0]?.name || "Ruang Irban I",
    recipient_name: "",
    recipient_nip: "",
    officer_name: "Budi Santoso, S.Kom",
    status: "Didistribusikan",
    document_number: "",
    notes: "",
    proofImageFile: null,
    proofImageUrl: null,
  });

  const [availableStock, setAvailableStock] = useState<number>(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      const randomNum = Math.floor(100 + Math.random() * 900);
      const firstItem = items[0];
      setFormData({
        transaction_number: `BK-2026-${randomNum}`,
        date: new Date().toISOString().split("T")[0],
        item_id: firstItem?.id || "",
        item_code: firstItem?.code || "",
        item_name: firstItem?.name || "",
        category: firstItem?.category || "Elektronik",
        quantity: 1,
        unit: firstItem?.unit || "Unit",
        purpose: "Operasional Audit Lapangan",
        target_location: locations[0]?.name || "Ruang Irban I",
        recipient_name: "",
        recipient_nip: "",
        officer_name: "Budi Santoso, S.Kom",
        status: "Didistribusikan",
        document_number: "",
        notes: "",
        proofImageFile: null,
        proofImageUrl: null,
      });
      setAvailableStock(firstItem?.stock || 0);
      setImagePreview(null);
      setErrorMsg("");
    }
  }, [isOpen, items, locations]);

  const handleItemSelect = (itemId: string) => {
    const it = items.find((i) => i.id === itemId);
    if (it) {
      setFormData((prev) => ({
        ...prev,
        item_id: it.id,
        item_code: it.code,
        item_name: it.name,
        category: it.category,
        unit: it.unit,
      }));
      setAvailableStock(it.stock || 0);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, proofImageFile: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateTxNumber = () => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    setFormData((prev) => ({ ...prev, transaction_number: `BK-2026-${randomNum}` }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.item_id) {
      setErrorMsg("Silakan pilih barang yang akan dikeluarkan.");
      return;
    }
    if (formData.quantity <= 0) {
      setErrorMsg("Jumlah barang keluar harus minimal 1.");
      return;
    }
    if (formData.quantity > availableStock) {
      setErrorMsg(`Stok tidak mencukupi! Sisa stok yang tersedia saat ini hanya ${availableStock} ${formData.unit}.`);
      return;
    }
    if (!formData.recipient_name.trim()) {
      setErrorMsg("Nama pegawai penerima wajib diisi.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg("");
      await onSubmit(formData);
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal mencatat transaksi barang keluar.");
    } finally {
      setSubmitting(false);
    }
  };

  // Dropdown Options
  const itemOptions: DropdownOption[] = items.map((it) => ({
    value: it.id,
    label: `${it.name} (${it.code}) - Sisa Stok: ${it.stock} ${it.unit}`,
    icon: Boxes,
  }));

  const locationOptions: DropdownOption[] = locations.map((loc) => ({
    value: loc.name,
    label: `${loc.name} ${loc.floor ? `(${loc.floor})` : ""}`,
    icon: Building2,
  }));

  const purposeOptions: DropdownOption[] = purposes.map((p) => ({
    value: p.name,
    label: p.name,
    icon: p.name.includes("Audit") ? Briefcase : p.name.includes("Servis") ? RefreshCw : Send,
  }));

  const statusOptions: DropdownOption[] = statuses.map((s) => ({
    value: s.name,
    label: s.name,
    icon: s.name.includes("Pinjam") ? Clock : s.name.includes("Servis") ? RefreshCw : ShieldCheck,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Catat Pengeluaran / Distribusi Barang"
      description="Catat penyerahan, peminjaman, atau distribusi barang kepada pegawai dan ruangan."
      maxWidth="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 pt-1">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2.5 shadow-lg">
            <XCircle size={17} className="text-red-400 shrink-0" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}

        {/* 2-COLUMN ENTERPRISE GRID (Opsi A) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* ================= KOLOM KIRI: RINCIAN BARANG & DISTRIBUSI ================= */}
          <div className="space-y-3.5 p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/40 border border-stone-200/80 dark:border-white/5 shadow-inner">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-200/80 dark:border-white/5 text-amber-500">
              <ArrowUpFromLine size={15} />
              <h4 className="text-xs font-black uppercase tracking-wider text-stone-800 dark:text-stone-200">
                1. Rincian Barang & Pengeluaran
              </h4>
            </div>

            {/* 1. No. Bukti / Transaksi (Lega & Full Width) */}
            <div>
              <label className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-1.5 whitespace-nowrap">
                No. Bukti Pengeluaran / BAST *
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  value={formData.transaction_number}
                  onChange={(e) => setFormData({ ...formData, transaction_number: e.target.value.toUpperCase() })}
                  className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-white/10 text-xs sm:text-sm font-mono font-bold text-amber-600 dark:text-amber-400 focus:ring-1 focus:ring-amber-500 outline-none shadow-inner"
                />
                <button
                  type="button"
                  onClick={generateTxNumber}
                  title="Generate No Transaksi Otomatis"
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-amber-600 dark:text-amber-400 border border-stone-300 dark:border-white/10 hover:border-amber-500/30 text-xs font-bold transition-all shrink-0 cursor-pointer shadow-sm"
                >
                  <Sparkles size={14} />
                  <span>Auto</span>
                </button>
              </div>
            </div>

            {/* 2. Tanggal Pengeluaran (CustomDatePicker) */}
            <div>
              <CustomDatePicker
                label="Tanggal Pengeluaran / Distribusi"
                showLabel={true}
                required={true}
                value={formData.date}
                onChange={(val) => setFormData({ ...formData, date: val })}
                placeholder="Pilih Tanggal Pengeluaran"
              />
            </div>

            {/* 3. Pilihan Barang dari Master */}
            <div>
              <CustomDropdown
                label="Pilih Barang yang Dikeluarkan *"
                showLabel={true}
                value={formData.item_id}
                onChange={handleItemSelect}
                options={itemOptions}
                placeholder="Pilih Barang dari Master Aset"
                icon={Boxes}
              />
            </div>

            {/* 4. Jumlah Keluar & Keperluan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider truncate">
                    Jumlah Keluar *
                  </label>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    Sisa: {availableStock} {formData.unit}
                  </span>
                </div>
                <input
                  type="number"
                  min="1"
                  max={availableStock}
                  required
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-white/10 text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 focus:ring-1 focus:ring-amber-500 outline-none text-center shadow-inner"
                />
              </div>

              <div>
                <CustomDropdown
                  label="Keperluan Distribusi *"
                  showLabel={true}
                  value={formData.purpose}
                  onChange={(val) => setFormData({ ...formData, purpose: val as DistributionPurpose })}
                  options={purposeOptions}
                  placeholder="Pilih Keperluan"
                  icon={Briefcase}
                />
              </div>
            </div>
          </div>

          {/* ================= KOLOM KANAN: PENERIMA & BUKTI ================= */}
          <div className="space-y-3.5 p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/40 border border-stone-200/80 dark:border-white/5 shadow-inner flex flex-col justify-between">
            <div className="space-y-3.5">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-200/80 dark:border-white/5 text-amber-500">
                <Building2 size={15} />
                <h4 className="text-xs font-black uppercase tracking-wider text-stone-800 dark:text-stone-200">
                  2. Penerima, Ruangan & Status
                </h4>
              </div>

              {/* Ruangan Tujuan */}
              <div>
                <CustomDropdown
                  label="Ruangan / Unit Kerja Tujuan *"
                  showLabel={true}
                  value={formData.target_location}
                  onChange={(val) => setFormData({ ...formData, target_location: val })}
                  options={locationOptions}
                  placeholder="Pilih Ruangan"
                  icon={Building2}
                />
              </div>

              {/* Pegawai Penerima (PJ) & NIP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-1.5 whitespace-nowrap">
                    Pegawai Penerima (PJ) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.recipient_name}
                    onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
                    placeholder="Nama Lengkap Pegawai"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-white/10 text-xs sm:text-sm font-medium text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:ring-1 focus:ring-amber-500 outline-none shadow-inner"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-1.5 whitespace-nowrap">
                    NIP Pegawai Penerima
                  </label>
                  <input
                    type="text"
                    value={formData.recipient_nip}
                    onChange={(e) => setFormData({ ...formData, recipient_nip: e.target.value })}
                    placeholder="19890214 201201 1 004"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-white/10 text-xs sm:text-sm font-medium text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:ring-1 focus:ring-amber-500 outline-none shadow-inner"
                  />
                </div>
              </div>

              {/* Status Pengeluaran & Petugas Penyerah */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <CustomDropdown
                    label="Status Pengeluaran *"
                    showLabel={true}
                    value={formData.status}
                    onChange={(val) => setFormData({ ...formData, status: val as OutgoingStatus })}
                    options={statusOptions}
                    placeholder="Pilih Status"
                    icon={ShieldCheck}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-1.5 whitespace-nowrap">
                    Petugas Penyerah (Logistik)
                  </label>
                  <input
                    type="text"
                    value={formData.officer_name}
                    onChange={(e) => setFormData({ ...formData, officer_name: e.target.value })}
                    placeholder="Budi Santoso, S.Kom"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-white/10 text-xs sm:text-sm font-medium text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:ring-1 focus:ring-amber-500 outline-none shadow-inner"
                  />
                </div>
              </div>

              {/* No Surat Tugas / Dokumen & Catatan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-1.5">
                    No. Surat Tugas / BAST
                  </label>
                  <input
                    type="text"
                    value={formData.document_number}
                    onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
                    placeholder="ST/08/IRBAN-I/2026"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-white/10 text-xs sm:text-sm font-medium text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:ring-1 focus:ring-amber-500 outline-none shadow-inner"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-1.5">
                    Catatan Distribusi
                  </label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Keterangan keperluan..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-white/10 text-xs sm:text-sm font-medium text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:ring-1 focus:ring-amber-500 outline-none shadow-inner"
                  />
                </div>
              </div>
            </div>

            {/* Upload Bukti Serah Terima */}
            <div className="pt-1">
              <label className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-1.5">
                Foto Bukti Serah Terima / Surat Jalan (Opsional)
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />

              {imagePreview ? (
                <div className="relative w-full h-24 rounded-xl overflow-hidden border border-stone-200 dark:border-white/15 bg-stone-100 dark:bg-stone-900 group shadow-inner">
                  <img src={imagePreview} alt="Preview Bukti" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 border border-white/10 cursor-pointer shadow-md"
                    >
                      Ganti Foto
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, proofImageFile: null, proofImageUrl: null }));
                        setImagePreview(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="p-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 cursor-pointer shadow-md"
                      title="Hapus Foto"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 px-4 border-2 border-dashed border-stone-300 dark:border-white/10 hover:border-amber-500/40 rounded-xl flex items-center justify-center gap-3 text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-all bg-stone-100 dark:bg-stone-900/40 hover:bg-stone-200/60 dark:hover:bg-stone-900/80 cursor-pointer shadow-inner group"
                >
                  <div className="w-8 h-8 rounded-lg bg-stone-200 dark:bg-stone-800 group-hover:bg-amber-500/10 flex items-center justify-center text-stone-500 dark:text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    <Upload size={16} />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-stone-700 dark:text-stone-300 group-hover:text-stone-900 dark:group-hover:text-white">
                      Unggah Bukti Serah Terima
                    </p>
                    <p className="text-[10px] text-stone-400 dark:text-stone-500">PNG, JPG, WEBP maks 5MB</p>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200/80 dark:border-white/10">
          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 transition-all shadow-xl shadow-amber-500/20 disabled:opacity-50 cursor-pointer active:scale-98"
          >
            {submitting ? "Menyimpan..." : "Simpan Barang Keluar"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
