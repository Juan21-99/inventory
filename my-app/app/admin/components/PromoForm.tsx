"use client";

import { Upload, Sparkles, Wand2, Tag } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Modal from "../../components/ui/Modal";
import { PromoFormData, COLOR_PRESETS } from "../types/promo.types";

interface Product {
  id: string;
  name: string;
}

interface PromoFormProps {
  isOpen: boolean;
  isEditing: boolean;
  isSubmitting: boolean;
  formData: PromoFormData;
  imagePreview: string | null;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFieldChange: (field: keyof PromoFormData, value: string) => void;
  onFileChange: (file: File | null) => void;
}

export const PromoForm = ({
  isOpen,
  isEditing,
  isSubmitting,
  formData,
  imagePreview,
  onClose,
  onSubmit,
  onFieldChange,
  onFileChange,
}: PromoFormProps) => {
  const [products, setProducts] = useState<Product[]>([]);

  // Fetch products for dropdown
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name")
        .select("id, name")
        .eq("is_active", true) // Only show active products
        .order("name");

      console.log("PromoForm Fetch Products:", { data, error });

      if (!error && data) {
        setProducts(data);
      } else {
        console.error("Failed to fetch products for promo form", error);
      }
    };

    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  const getSubmitButtonText = () => {
    if (isSubmitting) return "Menyimpan...";
    return isEditing ? "Simpan Perubahan" : "Buat Banner";
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Banner Promo" : "Tambah Banner Baru"}
      description="Banner ini akan tampil di bagian atas aplikasi pelanggan."
      isDraggable={false}
    >
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Title & Description */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="promo-title"
              className="text-[10px] font-black text-stone-500 uppercase tracking-widest ml-1"
            >
              Judul Banner
            </label>
            <input
              id="promo-title"
              type="text"
              required
              value={formData.title}
              onChange={(e) => onFieldChange("title", e.target.value)}
              placeholder="Contoh: Sruput Keberuntungan!"
              className="w-full bg-stone-950 border border-white/5 rounded-2xl px-5 py-3.5 text-sm text-white focus:border-amber-500/50 outline-none transition-all placeholder:text-stone-700"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="promo-description"
              className="text-[10px] font-black text-stone-500 uppercase tracking-widest ml-1"
            >
              Deskripsi Singkat
            </label>
            <textarea
              id="promo-description"
              required
              value={formData.description}
              onChange={(e) => onFieldChange("description", e.target.value)}
              placeholder="Contoh: Diskon 20% untuk semua Mocktail hari ini."
              className="w-full bg-stone-950 border border-white/5 rounded-2xl px-5 py-3.5 text-sm text-white focus:border-amber-500/50 outline-none transition-all placeholder:text-stone-700 min-h-[80px] resize-none"
            />
          </div>

          {/* Product Link (Optional) */}
          <div className="space-y-1.5">
            <label
              htmlFor="promo-product"
              className="text-[10px] font-black text-amber-500 uppercase tracking-widest ml-1 flex items-center gap-2"
            >
              <Tag size={12} strokeWidth={2.5} />
              Tautkan Produk (Opsional)
            </label>
            <div className="relative">
              <select
                id="promo-product"
                value={formData.product_id || ""}
                onChange={(e) => onFieldChange("product_id", e.target.value)}
                className="w-full bg-stone-900 border border-white/5 rounded-2xl px-5 py-3.5 text-sm font-medium text-white focus:border-amber-500/50 outline-none appearance-none transition-all cursor-pointer placeholder:text-stone-600"
              >
                <option value="" className="text-stone-500">
                  -- Tidak menautkan produk --
                </option>
                {products.map((p) => (
                  <option key={p.id} value={p.id} className="text-white">
                    {p.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                <Tag size={14} className="text-stone-600" />
              </div>
            </div>
            <p className="text-[10px] text-stone-500 ml-1">
              Jika dipilih, klik banner akan membuka popup detail produk
              tersebut.
            </p>
          </div>
        </div>

        {/* Badge & Color Picker */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label
              htmlFor="promo-badge"
              className="text-[10px] font-black text-stone-500 uppercase tracking-widest ml-1"
            >
              Lencana (Badge)
            </label>
            <input
              id="promo-badge"
              type="text"
              required
              value={formData.badge}
              onChange={(e) => onFieldChange("badge", e.target.value)}
              placeholder="PROMO"
              className="w-full bg-stone-950 border border-white/5 rounded-2xl px-5 py-3.5 text-sm text-white focus:border-amber-500/50 outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="promo-color"
              className="text-[10px] font-black text-stone-500 uppercase tracking-widest ml-1"
            >
              Warna Tema
            </label>
            <div className="relative group">
              <select
                id="promo-color"
                value={formData.color_gradient}
                onChange={(e) =>
                  onFieldChange("color_gradient", e.target.value)
                }
                className="w-full bg-stone-950 border border-white/5 rounded-2xl px-5 py-3.5 text-xs font-bold text-white focus:border-amber-500/50 outline-none appearance-none transition-all cursor-pointer"
              >
                {COLOR_PRESETS.map((p) => (
                  <option
                    key={p.value}
                    value={p.value}
                    className="bg-stone-900"
                  >
                    {p.label}
                  </option>
                ))}
              </select>
              <Wand2
                size={14}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-stone-600 pointer-events-none group-hover:text-amber-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Image Upload & Live Preview */}
        <div className="space-y-4">
          <label className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
            <Sparkles size={12} />
            Live Preview
          </label>

          {/* Card Preview Area */}
          <div
            className={`aspect-[16/8] rounded-[2.5rem] bg-gradient-to-br ${formData.color_gradient} p-7 relative overflow-hidden shadow-2xl border border-white/10 group transition-all duration-500`}
          >
            {/* Background Image if available */}
            {imagePreview && (
              <div className="absolute inset-0 z-0">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-cover opacity-60 mix-blend-overlay"
                />
              </div>
            )}

            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />

            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white">
                    <Sparkles size={20} />
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] bg-black/20 backdrop-blur-md px-2 py-1 rounded-lg text-white/80 border border-white/5">
                    {formData.badge || "PREVIEW"}
                  </span>
                </div>
                <h3 className="text-xl font-black text-white tracking-tighter uppercase italic leading-none mb-1">
                  {formData.title || "Judul Banner Anda"}
                </h3>
                <p className="text-[10px] font-medium text-white/70 max-w-[200px] leading-relaxed line-clamp-2">
                  {formData.description || "Tulis deskripsi menarik di sini..."}
                </p>
              </div>
            </div>

            {/* Upload Hover Overlay */}
            <label
              htmlFor="promo-image-upload"
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center cursor-pointer z-20"
            >
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-stone-950 shadow-xl mb-3">
                <Upload size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-white">
                Ganti Gambar
              </span>
              <input
                id="promo-image-upload"
                type="file"
                accept="image/*"
                onChange={(e) => onFileChange(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="grid grid-cols-2 gap-4 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-stone-500 hover:text-white transition-all border border-white/5 hover:bg-stone-900 active:scale-95 cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="py-4 rounded-2xl bg-amber-500 text-stone-950 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-amber-500/20 hover:bg-amber-400 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {getSubmitButtonText()}
          </button>
        </div>
      </form>
    </Modal>
  );
};
