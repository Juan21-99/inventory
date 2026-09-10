"use client";

import React, { useState } from "react";
import { Plus, Trash2, Tag, AlertCircle } from "lucide-react";
import Modal from "@/app/components/ui/Modal";
import { Category } from "../../types/item.types";

interface CategoryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onAddCategory: (name: string, description?: string) => void;
  onDeleteCategory: (id: string) => void;
}

export const CategoryManagementModal: React.FC<CategoryManagementModalProps> = ({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onDeleteCategory,
}) => {
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      setErrorMsg("Nama kategori tidak boleh kosong.");
      return;
    }
    if (categories.some((c) => c.name.toLowerCase() === newCatName.trim().toLowerCase())) {
      setErrorMsg("Kategori tersebut sudah ada.");
      return;
    }

    onAddCategory(newCatName, newCatDesc);
    setNewCatName("");
    setNewCatDesc("");
    setErrorMsg("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Kelola Kategori Barang"
      description="Tambah atau hapus pengelompokan jenis barang inventaris."
    >
      <div className="space-y-5 pt-2">
        {/* Form Tambah Kategori */}
        <form onSubmit={handleAdd} className="p-4 rounded-2xl bg-stone-950 border border-white/10 space-y-3">
          <h4 className="text-xs font-bold text-stone-300 uppercase tracking-wider">
            Tambah Kategori Baru
          </h4>
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          <div className="grid grid-cols-1">
            <input
              type="text"
              required
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Nama Kategori (cth: Kendaraan)"
              className="px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-xs text-white placeholder:text-stone-600 focus:ring-1 focus:ring-amber-500 outline-none"
            />
          
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md"
          >
            <Plus size={15} strokeWidth={2.5} />
            <span>Tambah Kategori</span>
          </button>
        </form>

        {/* List Kategori Saat Ini */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
            Daftar Kategori Aktif ({categories.length})
          </h4>
          <div className="max-h-60 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-stone-800">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-3 rounded-xl bg-stone-950/60 border border-white/5 text-xs group hover:border-white/10 transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Tag size={15} className="text-amber-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-bold text-white truncate">{cat.name}</p>
                    {cat.description && (
                      <p className="text-[11px] text-stone-500 truncate">{cat.description}</p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onDeleteCategory(cat.id)}
                  className="p-1.5 rounded-lg text-stone-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Hapus Kategori"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:bg-white/5 transition-colors cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </Modal>
  );
};
