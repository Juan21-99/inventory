"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { usePromos } from "./hooks/usePromos";
import { usePromoForm } from "./hooks/usePromoForm";
import { PromoGrid } from "../components/PromoGrid";
import { PromoForm } from "../components/PromoForm";
import { Promo } from "../types/promo.types";

export default function PromosPage() {
  const { promos, loading, togglePromoStatus, deletePromo } = usePromos();
  const promoForm = usePromoForm();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPromos = promos.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleOpenAddModal = () => {
    promoForm.resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (promo: Promo) => {
    promoForm.setEditMode(promo);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    promoForm.resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    promoForm.setIsSubmitting(true);

    try {
      const finalImageUrl = await promoForm.uploadImage();
      if (!finalImageUrl && promoForm.formData.imageFile) {
        promoForm.setIsSubmitting(false);
        return;
      }

      const promoData = {
        title: promoForm.formData.title,
        description: promoForm.formData.description,
        badge: promoForm.formData.badge,
        color_gradient: promoForm.formData.color_gradient,
        image_url: finalImageUrl || "",
        is_active: true,
        product_id: promoForm.formData.product_id || null,
      };

      if (promoForm.editingId) {
        const { error } = await supabase
          .from("promos")
          .update(promoData)
          .eq("id", promoForm.editingId);
        if (error) throw error;
        toast.success("Banner promo berhasil diperbarui");
      } else {
        const { error } = await supabase.from("promos").insert([promoData]);
        if (error) throw error;
        toast.success("Banner promo baru berhasil dibuat");
      }

      handleCloseModal();
    } catch (error) {
      console.error("Error saving promo:", error);
      toast.error("Gagal menyimpan promo");
    } finally {
      promoForm.setIsSubmitting(false);
    }
  };

  return (
    <div className="px-6 pt-4 pb-32 max-w-7xl mx-auto space-y-8">
      {/* Toolbar Section */}
      <div className="bg-stone-900/60 backdrop-blur-xl p-4 rounded-[2rem] shadow-sm border border-white/5 mb-8 sticky top-2 z-10">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Left Side: Search & Count */}
          <div className="flex flex-1 items-center gap-4 w-full">
            <div className="relative group flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 group-focus-within:text-amber-500 transition-colors"
                size={18}
              />
              <input
                type="text"
                placeholder="Cari promo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-stone-950 border border-white/5 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 transition-all outline-none font-medium text-white placeholder:text-stone-600 shadow-inner"
              />
            </div>

            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-stone-950 border border-white/5 rounded-xl">
              <span className="text-amber-500 font-bold text-xs">
                {promos.length}
              </span>
              <span className="text-stone-500 text-[10px] font-black uppercase tracking-widest">
                Banner
              </span>
            </div>
          </div>

          {/* Right Side: Add Button */}
          <button
            onClick={handleOpenAddModal}
            className="w-full sm:w-auto bg-amber-500 text-stone-950 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:bg-amber-400 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus size={16} strokeWidth={3} />
            Tambah Banner
          </button>
        </div>
      </div>

      {/* Promos Content */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-[10px] font-black text-stone-500 uppercase tracking-[0.3em]">
            Daftar Banner Aktif ({promos.length})
          </h2>
        </div>

        <PromoGrid
          promos={filteredPromos}
          loading={loading}
          onEdit={handleEdit}
          onDelete={deletePromo}
          onToggleStatus={togglePromoStatus}
        />
      </div>

      {/* Form Modal */}
      <PromoForm
        isOpen={isModalOpen}
        isEditing={!!promoForm.editingId}
        isSubmitting={promoForm.isSubmitting}
        formData={promoForm.formData}
        imagePreview={promoForm.imagePreview}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        onFieldChange={promoForm.updateField}
        onFileChange={promoForm.handleFileSelect}
      />
    </div>
  );
}
