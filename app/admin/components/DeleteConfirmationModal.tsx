import { Coffee, Loader2, Trash2 } from "lucide-react";
import Modal from "../../components/ui/Modal";
import { Product } from "../types/product.types";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  product: Product | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmationModal = ({
  isOpen,
  product,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteConfirmationModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Hapus Produk"
      description="Tindakan ini tidak dapat dibatalkan"
      isDraggable={false}
    >
      <div className="space-y-6 pt-2">
        {product && (
          <div className="flex items-center gap-4 p-4 bg-stone-900 rounded-2xl border border-white/5">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-950 flex-shrink-0 border border-white/5 relative">
              {product.image_url && product.image_url.trim() !== "" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-stone-900">
                  <Coffee className="text-stone-700" size={24} />
                </div>
              )}
            </div>
            <div>
              <h4 className="font-black text-white text-lg tracking-tight uppercase italic mb-1">
                {product.name}
              </h4>
              <p className="text-xs font-bold text-amber-500">
                Rp {product.price.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        )}

        <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/20">
          <p className="text-red-400 text-xs font-bold leading-relaxed text-center">
            ⚠️ PERINGATAN: Tindakan ini tidak dapat dibatalkan. Produk akan
            dihapus secara permanen dari database.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-3 bg-stone-900 text-stone-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-stone-800 hover:text-white transition-all cursor-pointer disabled:opacity-50 border border-white/5"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-3 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 active:scale-95"
          >
            {isDeleting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Menghapus...
              </>
            ) : (
              <>
                <Trash2 size={14} />
                Hapus Permanen
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
