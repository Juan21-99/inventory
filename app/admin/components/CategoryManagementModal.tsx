"use client";

import { useState } from "react";
import { Plus, Trash2, Loader2, Tag } from "lucide-react";
import { toast } from "sonner";
import Modal from "../../components/ui/Modal";
import { Category } from "../products/hooks/useCategories";

interface CategoryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  addCategory: (name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

export const CategoryManagementModal = ({
  isOpen,
  onClose,
  categories,
  addCategory,
  deleteCategory,
}: CategoryManagementModalProps) => {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setIsSubmitting(true);
    try {
      await addCategory(newCategoryName.trim());
      setNewCategoryName("");
      toast.success("Kategori berhasil ditambahkan");
    } catch {
      toast.error("Gagal menambahkan kategori");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteCategory(id);
      toast.success("Kategori berhasil dihapus");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Gagal menghapus kategori";
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Kelola Kategori"
      description="Tambah atau hapus kategori menu Anda."
      isDraggable={false}
    >
      <div className="space-y-6 pt-2">
        {/* Add Category Form */}
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            type="text"
            required
            placeholder="Nama kategori baru..."
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="flex-1 bg-stone-900 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500/50 outline-none transition-all placeholder:text-stone-700 shadow-inner font-bold"
          />
          <button
            type="submit"
            disabled={isSubmitting || !newCategoryName.trim()}
            className="bg-amber-500 text-stone-950 px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-400 active:scale-95 transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-amber-500/10 flex items-center justify-center min-w-[100px]"
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <Plus size={14} className="mr-1.5" strokeWidth={3} /> Tambah
              </>
            )}
          </button>
        </form>

        {/* Categories List */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
          <div className="text-[10px] font-black text-stone-600 uppercase tracking-[0.2em] mb-3 ml-1">
            Daftar Kategori Saat Ini
          </div>

          {categories.length === 0 ? (
            <div className="text-center py-8 bg-stone-900/40 rounded-2xl border border-dashed border-white/5">
              <p className="text-stone-600 text-xs font-bold uppercase tracking-widest">
                Belum ada kategori
              </p>
            </div>
          ) : (
            categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-4 bg-stone-900/60 rounded-2xl border border-white/5 group hover:border-white/10 transition-all shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-stone-950 flex items-center justify-center text-stone-600 group-hover:text-amber-500 transition-colors">
                    <Tag size={16} />
                  </div>
                  <span className="font-bold text-white text-sm uppercase tracking-wide">
                    {cat.name}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={deletingId === cat.id}
                  onClick={() => handleDelete(cat.id)}
                  className="p-2.5 text-stone-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all active:scale-90 cursor-pointer"
                  title="Hapus Kategori"
                >
                  {deletingId === cat.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};
