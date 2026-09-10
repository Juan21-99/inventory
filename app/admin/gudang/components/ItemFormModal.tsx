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
  DollarSign,
  FileText,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Tag,
  Package,
  Layers,
  MapPin,
} from "lucide-react";
import Modal from "@/app/components/ui/Modal";
import { CustomDropdown, DropdownOption } from "@/app/components/ui/CustomDropdown";
import { CustomDatePicker } from "@/app/components/ui/CustomDatePicker";
import {
  InventoryItem,
  ItemFormData,
  Category,
  LocationRoom,
  ItemCondition,
} from "../../types/item.types";
import { useUnits } from "../../hooks/useUnits";

interface ItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: ItemFormData) => Promise<void>;
  editItem?: InventoryItem | null;
  categories: Category[];
  locations: LocationRoom[];
}

export const ItemFormModal: React.FC<ItemFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editItem,
  categories,
  locations,
}) => {
  const { units } = useUnits();
  const [formData, setFormData] = useState<ItemFormData>({
    code: "",
    name: "",
    category: categories[0]?.name || "Elektronik",
    stock: 1,
    unit: "Unit",
    condition: "Baik",
    location: locations[0]?.name || "Ruang Inspektur",
    person_in_charge: "",
    received_at: new Date().toISOString().split("T")[0],
    price: 0,
    notes: "",
    imageFile: null,
    imageUrl: null,
  });

  const [displayPrice, setDisplayPrice] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync form data when editItem changes or modal opens
  useEffect(() => {
    if (editItem) {
      setFormData({
        code: editItem.code,
        name: editItem.name,
        category: editItem.category,
        stock: editItem.stock,
        unit: editItem.unit || "Unit",
        condition: editItem.condition,
        location: editItem.location,
        person_in_charge: editItem.person_in_charge,
        received_at: editItem.received_at || new Date().toISOString().split("T")[0],
        price: editItem.price || 0,
        notes: editItem.notes || "",
        imageFile: null,
        imageUrl: editItem.image_url || null,
      });
      setDisplayPrice(editItem.price ? editItem.price.toLocaleString("id-ID") : "");
      setImagePreview(editItem.image_url || null);
    } else {
      setFormData({
        code: `INV-${Date.now().toString().slice(-4)}`,
        name: "",
        category: categories[0]?.name || "Elektronik",
        stock: 1,
        unit: "Unit",
        condition: "Baik",
        location: locations[0]?.name || "Ruang Sekretariat",
        person_in_charge: "",
        received_at: new Date().toISOString().split("T")[0],
        price: 0,
        notes: "",
        imageFile: null,
        imageUrl: null,
      });
      setDisplayPrice("");
      setImagePreview(null);
    }
    setErrorMsg("");
  }, [editItem, isOpen, categories, locations]);

  const handlePriceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    const num = raw ? parseInt(raw, 10) : 0;
    setFormData((prev) => ({ ...prev, price: num }));
    setDisplayPrice(num ? num.toLocaleString("id-ID") : "");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, imageFile: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, imageFile: null, imageUrl: null }));
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const generateCode = () => {
    const prefix = (formData.category || "INV").slice(0, 3).toUpperCase();
    const randomNum = Math.floor(100 + Math.random() * 900);
    setFormData((prev) => ({ ...prev, code: `INV-${prefix}-${randomNum}` }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg("Nama barang wajib diisi.");
      return;
    }
    if (!formData.code.trim()) {
      setErrorMsg("Kode barang wajib diisi.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg("");
      await onSubmit(formData);
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal menyimpan data barang.");
    } finally {
      setSubmitting(false);
    }
  };

  // Dropdown Options
  const categoryOptions: DropdownOption[] = categories.map((c) => ({
    value: c.name,
    label: c.name,
    icon: Tag,
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editItem ? "Edit Data Barang / Aset" : "Tambah Barang / Aset Baru"}
      description="Lengkapi formulir pencatatan inventaris dan logistik aset Inspektorat."
      maxWidth="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 pt-1">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-300 text-xs flex items-center gap-2.5 shadow-sm">
            <XCircle size={17} className="text-red-500 dark:text-red-400 shrink-0" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}

        {/* 2-COLUMN ENTERPRISE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* ================= KOLOM KIRI: IDENTITAS & KONDISI BARANG ================= */}
          <div className="space-y-3.5 p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/40 border border-stone-200/80 dark:border-white/5 shadow-xs dark:shadow-inner">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-200/80 dark:border-white/5 text-amber-600 dark:text-amber-500">
              <Layers size={15} />
              <h4 className="text-xs font-black uppercase tracking-wider text-stone-800 dark:text-stone-200">
                1. Identitas & Nilai Barang
              </h4>
            </div>

            {/* Kode Barang & Auto-Generate */}
            <div>
              <label className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-1.5 whitespace-nowrap">
                Kode Barang *
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="INV-ELK-001"
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-white/10 text-xs sm:text-sm font-mono font-bold text-amber-600 dark:text-amber-400 focus:ring-1 focus:ring-amber-500 outline-none shadow-xs"
                />
                <button
                  type="button"
                  onClick={generateCode}
                  title="Generate Kode Otomatis"
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-amber-600 dark:text-amber-400 border border-stone-200 dark:border-white/10 text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs"
                >
                  <Sparkles size={14} />
                  <span>Auto</span>
                </button>
              </div>
            </div>

            {/* Nama Barang / Aset */}
            <div>
              <label className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-1.5 whitespace-nowrap">
                Nama Barang / Aset *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Laptop Lenovo ThinkPad T14 Gen 4"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-white/10 text-xs sm:text-sm font-medium text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:ring-1 focus:ring-amber-500 outline-none shadow-xs"
              />
            </div>

            {/* Kategori Barang (Dropdown Lega) */}
            <div>
              <CustomDropdown
                label="Kategori Barang"
                showLabel={true}
                value={formData.category}
                onChange={(val) => setFormData({ ...formData, category: val })}
                options={categoryOptions}
                placeholder="Pilih Kategori"
                icon={Tag}
              />
            </div>

            {/* Kondisi Fisik Barang (Pill Buttons) */}
            <div>
              <label className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-1.5 whitespace-nowrap">
                Kondisi Fisik Barang *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["Baik", "Rusak Ringan", "Rusak Berat"] as ItemCondition[]).map((cond) => {
                  const isActive = formData.condition === cond;
                  return (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => setFormData({ ...formData, condition: cond })}
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer flex items-center justify-center gap-1.5 ${
                        isActive
                          ? cond === "Baik"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/50 shadow-xs"
                            : cond === "Rusak Ringan"
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/50 shadow-xs"
                            : "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/50 shadow-xs"
                          : "bg-white dark:bg-stone-900/60 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-white/5 hover:bg-stone-100 dark:hover:bg-stone-800"
                      }`}
                    >
                      {cond === "Baik" && <ShieldCheck size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />}
                      {cond === "Rusak Ringan" && <AlertTriangle size={13} className="text-amber-600 dark:text-amber-400 shrink-0" />}
                      {cond === "Rusak Berat" && <XCircle size={13} className="text-red-600 dark:text-red-400 shrink-0" />}
                      <span className="truncate">{cond}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Jumlah Stok, Satuan & Harga Aset */}
            <div className="grid grid-cols-12 gap-2.5 pt-1">
              <div className="col-span-4">
                <label className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-1.5 truncate" title="Jumlah Stok">
                  Jumlah Stok *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-white/10 text-xs sm:text-sm font-bold text-stone-900 dark:text-white focus:ring-1 focus:ring-amber-500 outline-none text-center shadow-xs"
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
                <label className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-1.5 truncate" title="Nilai Aset (Rp)">
                  Nilai Aset (Rp)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={displayPrice}
                  onChange={handlePriceInputChange}
                  placeholder="0"
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-white/10 text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 focus:ring-1 focus:ring-amber-500 outline-none shadow-xs text-center"
                />
              </div>
            </div>
          </div>

          {/* ================= KOLOM KANAN: PENEMPATAN & LOGISTIK ================= */}
          <div className="space-y-3.5 p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/40 border border-stone-200/80 dark:border-white/5 shadow-xs dark:shadow-inner flex flex-col justify-between">
            <div className="space-y-3.5">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-200/80 dark:border-white/5 text-amber-600 dark:text-amber-500">
                <MapPin size={15} />
                <h4 className="text-xs font-black uppercase tracking-wider text-stone-800 dark:text-stone-200">
                  2. Penempatan & Riwayat Logistik
                </h4>
              </div>

              {/* Lokasi Ruangan Penyimpanan */}
              <div>
                <CustomDropdown
                  label="Lokasi Ruangan Penyimpanan"
                  showLabel={true}
                  value={formData.location}
                  onChange={(val) => setFormData({ ...formData, location: val })}
                  options={locationOptions}
                  placeholder="Pilih Ruangan Penyimpanan"
                  icon={Building2}
                />
              </div>

              {/* Pegawai Penanggung Jawab (PJ) */}
              <div>
                <label className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-1.5 whitespace-nowrap">
                  Pegawai Penanggung Jawab (PJ) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.person_in_charge}
                  onChange={(e) => setFormData({ ...formData, person_in_charge: e.target.value })}
                  placeholder="Nama Pegawai (cth: Drs. H. Ahmad Fauzi)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-white/10 text-xs sm:text-sm font-medium text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:ring-1 focus:ring-amber-500 outline-none shadow-xs"
                />
              </div>

              {/* Custom Date Picker & Catatan / No. Seri */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <CustomDatePicker
                    label="Tanggal Masuk / Beli"
                    showLabel={true}
                    required={true}
                    value={formData.received_at}
                    onChange={(val) => setFormData({ ...formData, received_at: val })}
                    placeholder="Pilih Tanggal Masuk"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-1.5 whitespace-nowrap">
                    No. Seri / Sumber Dana
                  </label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="APBD 2026 / S/N: TP-884"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-white/10 text-xs sm:text-sm font-medium text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:ring-1 focus:ring-amber-500 outline-none shadow-xs"
                  />
                </div>
              </div>
            </div>

            {/* Area Upload Foto Barang */}
            <div className="pt-1">
              <label className="text-[10px] font-black text-stone-600 dark:text-stone-400 uppercase tracking-wider block mb-1.5 whitespace-nowrap">
                Foto Dokumentasi Aset (Opsional)
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />

              {imagePreview ? (
                <div className="relative w-full h-28 rounded-xl overflow-hidden border border-stone-200 dark:border-white/15 bg-stone-100 dark:bg-stone-900 group shadow-xs">
                  <img
                    src={imagePreview}
                    alt="Preview Aset"
                    className="w-full h-full object-cover"
                  />
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
                      onClick={handleRemoveImage}
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
                  className="w-full py-3.5 px-4 border-2 border-dashed border-stone-300 dark:border-white/10 hover:border-amber-500/50 rounded-xl flex items-center justify-center gap-3 text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-all bg-white dark:bg-stone-900/40 hover:bg-stone-50 dark:hover:bg-stone-900/80 cursor-pointer shadow-xs group"
                >
                  <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 group-hover:bg-amber-500/10 flex items-center justify-center text-stone-500 dark:text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    <Upload size={16} />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-stone-700 dark:text-stone-300 group-hover:text-stone-900 dark:group-hover:text-white">
                      Unggah Foto Dokumentasi
                    </p>
                    <p className="text-[10px] text-stone-400 dark:text-stone-500">PNG, JPG, WEBP maks 5MB</p>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200 dark:border-white/10">
          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/5 hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 transition-all shadow-xl shadow-amber-500/20 disabled:opacity-50 cursor-pointer active:scale-98"
          >
            {submitting ? "Menyimpan..." : editItem ? "Simpan Perubahan" : "Tambah Barang"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
