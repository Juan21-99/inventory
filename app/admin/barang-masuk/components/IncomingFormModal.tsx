"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import {
  Upload,
  Sparkles,
  X,
  Boxes,
  Building2,
  User,
  Calendar,
  DollarSign,
  FileText,
  Truck,
  ArrowDownToLine,
  XCircle,
  Tag,
  Package,
  Layers,
  MapPin,
} from "lucide-react";
import Modal from "@/app/components/ui/Modal";
import { CustomDropdown, DropdownOption } from "@/app/components/ui/CustomDropdown";
import { CustomDatePicker } from "@/app/components/ui/CustomDatePicker";
import { IncomingFormData, ProcurementSource } from "../../types/incoming.types";
import { InventoryItem, LocationRoom } from "../../types/item.types";
import { useSources } from "../hooks/useSources";
import { useUnits } from "../../hooks/useUnits";

interface IncomingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: IncomingFormData) => Promise<void>;
  items: InventoryItem[];
  locations: LocationRoom[];
}

const IncomingFormContent: React.FC<Omit<IncomingFormModalProps, "isOpen">> = ({
  onClose,
  onSubmit,
  items,
  locations,
}) => {
  const { sources } = useSources();
  const { units } = useUnits();
  const [formData, setFormData] = useState<IncomingFormData>(() => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    const initialPrice = items[0]?.price || 0;
    return {
      transaction_number: `BM-2026-${randomNum}`,
      date: new Date().toISOString().split("T")[0],
      item_id: items[0]?.id || "",
      item_code: items[0]?.code || "",
      item_name: items[0]?.name || "",
      category: items[0]?.category || "Elektronik",
      quantity: 1,
      unit: items[0]?.unit || "Unit",
      unit_price: initialPrice,
      source: "Pengadaan APBD",
      supplier: "",
      target_location: items[0]?.location || locations[0]?.name || "Gudang Logistik & Arsip",
      received_by: items[0]?.person_in_charge || "",
      document_number: "",
      notes: "",
      proofImageFile: null,
      proofImageUrl: null,
    };
  });

  const [displayPrice, setDisplayPrice] = useState<string>(() => {
    const initialPrice = items[0]?.price || 0;
    return initialPrice ? initialPrice.toLocaleString("id-ID") : "";
  });
  const [selectedItemMode, setSelectedItemMode] = useState<"existing" | "manual">(() =>
    items.length > 0 ? "existing" : "manual"
  );
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleModeChange = (mode: "existing" | "manual") => {
    setSelectedItemMode(mode);
    if (mode === "manual") {
      const randomCode = `INV-BRG-${Math.floor(100 + Math.random() * 900)}`;
      setFormData((prev) => ({
        ...prev,
        item_id: "",
        item_code: randomCode,
        item_name: "",
        unit_price: 0,
      }));
      setDisplayPrice("");
    } else {
      if (items.length > 0) {
        const first = items[0];
        const p = first.price || 0;
        setFormData((prev) => ({
          ...prev,
          item_id: first.id,
          item_code: first.code,
          item_name: first.name,
          category: first.category,
          unit: first.unit,
          unit_price: p,
          target_location: first.location || prev.target_location,
          received_by: first.person_in_charge || prev.received_by,
        }));
        setDisplayPrice(p ? p.toLocaleString("id-ID") : "");
      }
    }
  };

  const handleItemSelect = (itemId: string) => {
    const it = items.find((i) => i.id === itemId);
    if (it) {
      const p = it.price || 0;
      setFormData((prev) => ({
        ...prev,
        item_id: it.id,
        item_code: it.code,
        item_name: it.name,
        category: it.category,
        unit: it.unit,
        unit_price: p,
        target_location: it.location || prev.target_location,
        received_by: it.person_in_charge || prev.received_by,
      }));
      setDisplayPrice(p ? p.toLocaleString("id-ID") : "");
    }
  };

  const handlePriceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    const num = raw ? parseInt(raw, 10) : 0;
    setFormData((prev) => ({ ...prev, unit_price: num }));
    setDisplayPrice(num ? num.toLocaleString("id-ID") : "");
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
    setFormData((prev) => ({ ...prev, transaction_number: `BM-2026-${randomNum}` }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.item_name.trim()) {
      setErrorMsg("Nama barang wajib diisi.");
      return;
    }
    if (!formData.supplier.trim()) {
      setErrorMsg("Nama penyedia / rekanan wajib diisi.");
      return;
    }
    if (!formData.received_by.trim()) {
      setErrorMsg("Pegawai penerima (PJ) wajib diisi.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg("");
      await onSubmit(formData);
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal mencatat transaksi barang masuk.");
    } finally {
      setSubmitting(false);
    }
  };

  // Dropdown Options
  const itemOptions: DropdownOption[] = items.map((it) => ({
    value: it.id,
    label: `${it.name} (${it.code})`,
    icon: Boxes,
  }));

  const sourceOptions: DropdownOption[] = sources.map((s) => ({
    value: s.name,
    label: s.name,
    icon: Truck,
  }));

  const locationOptions: DropdownOption[] = locations.map((loc) => ({
    value: loc.name,
    label: `${loc.name} ${loc.floor ? `(${loc.floor})` : ""}`,
    icon: Building2,
  }));

  const unitOptions: DropdownOption[] = units.map((u) => ({
    value: u.name,
    label: u.name,
    icon: Package,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pt-1">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2.5 shadow-lg">
            <XCircle size={17} className="text-red-400 shrink-0" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}

        {/* 2-COLUMN ENTERPRISE GRID (Opsi A) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* ================= KOLOM KIRI: RINCIAN TRANSAKSI & BARANG ================= */}
          <div className="space-y-3.5 p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/40 border border-stone-200/80 dark:border-white/5 shadow-inner">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-200/80 dark:border-white/5 text-amber-500">
              <ArrowDownToLine size={15} />
              <h4 className="text-xs font-black uppercase tracking-wider text-stone-800 dark:text-stone-200">
                1. Rincian Transaksi & Barang
              </h4>
            </div>

            {/* 1. No. Transaksi / BAST (Lega & Full Width) */}
            <div>
              <label className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-1.5 whitespace-nowrap">
                No. Transaksi / BAST *
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

            {/* 4. Tanggal Penerimaan (CustomDatePicker) */}
            <div className="pt-0.5">
              <CustomDatePicker
                label="Tanggal Penerimaan"
                showLabel={true}
                required={true}
                value={formData.date}
                onChange={(val) => setFormData({ ...formData, date: val })}
                placeholder="Pilih Tanggal Penerimaan"
              />
            </div>
            {/* 2. Pilihan Barang (Pilih Master / Input Manual) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider whitespace-nowrap">
                  Pilihan Barang / Aset *
                </label>
                <div className="flex items-center gap-1.5 text-[10px] bg-stone-200/80 dark:bg-stone-900/80 p-0.5 rounded-lg border border-stone-300 dark:border-white/5">
                  <button
                    type="button"
                    onClick={() => handleModeChange("existing")}
                    className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                      selectedItemMode === "existing"
                        ? "bg-amber-500 text-stone-950 shadow-sm"
                        : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
                    }`}
                  >
                    Pilih Master
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModeChange("manual")}
                    className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                      selectedItemMode === "manual"
                        ? "bg-amber-500 text-stone-950 shadow-sm"
                        : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
                    }`}
                  >
                    Input Manual
                  </button>
                </div>
              </div>

              {selectedItemMode === "existing" && items.length > 0 ? (
                <CustomDropdown
                  value={formData.item_id || items[0]?.id || ""}
                  onChange={handleItemSelect}
                  options={itemOptions}
                  placeholder="Pilih Barang dari Master Aset"
                  icon={Boxes}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Kode (INV-ELK-09)"
                    value={formData.item_code}
                    onChange={(e) => setFormData({ ...formData, item_code: e.target.value.toUpperCase() })}
                    className="px-3 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-white/10 text-xs font-mono text-amber-600 dark:text-amber-400 focus:ring-1 focus:ring-amber-500 outline-none shadow-inner"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Nama Barang Lengkap"
                    value={formData.item_name}
                    onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                    className="sm:col-span-2 px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-white/10 text-xs sm:text-sm text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:ring-1 focus:ring-amber-500 outline-none shadow-inner"
                  />
                </div>
              )}
            </div>

            {/* 3. Jumlah Kuantitas, Satuan & Harga Satuan */}
            <div className="grid grid-cols-12 gap-2.5 pt-1">
              <div className="col-span-4">
                <label className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-1.5 truncate" title="Jumlah Diterima">
                  Jumlah Masuk *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-white/10 text-xs sm:text-sm font-bold text-stone-900 dark:text-white focus:ring-1 focus:ring-amber-500 outline-none text-center shadow-inner"
                />
              </div>

              <div className="col-span-4">
                <CustomDropdown
                  label="Satuan"
                  showLabel={true}
                  value={formData.unit}
                  onChange={(val) => setFormData({ ...formData, unit: val })}
                  options={unitOptions}
                  placeholder="Satuan"
                  icon={Package}
                />
              </div>

              <div className="col-span-4">
                <label className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-1.5 truncate" title="Harga Satuan (Rp)">
                  Harga Satuan (Rp)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={displayPrice}
                  onChange={handlePriceInputChange}
                  placeholder="0"
                  className="w-full px-3 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-white/10 text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 focus:ring-1 focus:ring-amber-500 outline-none shadow-inner"
                />
              </div>
            </div>
          </div>

          {/* ================= KOLOM KANAN: SUMBER, REKANAN & PENEMPATAN ================= */}
          <div className="space-y-3.5 p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/40 border border-stone-200/80 dark:border-white/5 shadow-inner flex flex-col justify-between">
            <div className="space-y-3.5">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-200/80 dark:border-white/5 text-amber-500">
                <Truck size={15} />
                <h4 className="text-xs font-black uppercase tracking-wider text-stone-800 dark:text-stone-200">
                  2. Sumber Pengadaan & Penempatan
                </h4>
              </div>

              {/* Sumber Pengadaan */}
              <div>
                <CustomDropdown
                  label="Sumber Pengadaan / Asal *"
                  showLabel={true}
                  value={formData.source}
                  onChange={(val) => setFormData({ ...formData, source: val as ProcurementSource })}
                  options={sourceOptions}
                  placeholder="Pilih Sumber Pengadaan"
                  icon={Truck}
                />
              </div>

              {/* Rekanan / Supplier */}
              <div>
                <label className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-1.5">
                  Penyedia / Supplier / Rekanan *
                </label>
                <input
                  type="text"
                  required
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  placeholder="Contoh: PT Sumber Teknologi Mandiri"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-white/10 text-xs sm:text-sm font-medium text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:ring-1 focus:ring-amber-500 outline-none shadow-inner"
                />
              </div>

              {/* Ruangan Tujuan & Pegawai Penerima */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <CustomDropdown
                    label="Ruangan Tujuan *"
                    showLabel={true}
                    value={formData.target_location}
                    onChange={(val) => setFormData({ ...formData, target_location: val })}
                    options={locationOptions}
                    placeholder="Pilih Ruangan"
                    icon={Building2}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-1.5">
                    Pegawai Penerima (PJ) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.received_by}
                    onChange={(e) => setFormData({ ...formData, received_by: e.target.value })}
                    placeholder="Nama Pegawai"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-white/10 text-xs sm:text-sm font-medium text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:ring-1 focus:ring-amber-500 outline-none shadow-inner"
                  />
                </div>
              </div>

              {/* No Dokumen BAST & Catatan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-1.5">
                    No. BAST / Dokumen
                  </label>
                  <input
                    type="text"
                    value={formData.document_number}
                    onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
                    placeholder="BAST/08/INSP/2026/042"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-white/10 text-xs sm:text-sm font-medium text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:ring-1 focus:ring-amber-500 outline-none shadow-inner"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-1.5">
                    Catatan
                  </label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Keterangan transaksi..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-white/10 text-xs sm:text-sm font-medium text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:ring-1 focus:ring-amber-500 outline-none shadow-inner"
                  />
                </div>
              </div>
            </div>

            {/* Upload Bukti Serah Terima */}
            <div className="pt-1">
              <label className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-1.5">
                Foto Bukti Serah Terima / Nota (Opsional)
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
                      Unggah Bukti Nota / BAST
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
            {submitting ? "Menyimpan..." : "Simpan Barang Masuk"}
          </button>
        </div>
    </form>
  );
};

export const IncomingFormModal: React.FC<IncomingFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  items,
  locations,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Catat Penerimaan Barang Masuk"
      description="Catat pengadaan atau mutasi penerimaan barang baru ke dalam inventaris Inspektorat."
      maxWidth="4xl"
    >
      {isOpen && (
        <IncomingFormContent
          onClose={onClose}
          onSubmit={onSubmit}
          items={items}
          locations={locations}
        />
      )}
    </Modal>
  );
};
