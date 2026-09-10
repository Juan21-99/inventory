import Image from "next/image";
import { Edit, Trash2, Power } from "lucide-react";
import { Product } from "../types/product.types";

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
}

export const ProductCard = ({
  product,
  onEdit,
  onDelete,
  onToggleStatus,
}: ProductCardProps) => {
  const isInactive = !product.is_active;
  const hasDiscount =
    (product.original_price ?? 0) > 0 &&
    (product.original_price ?? 0) > product.price;

  return (
    <div
      className={`relative group overflow-hidden rounded-[2rem] border transition-all duration-300 ${
        isInactive
          ? "border-stone-800 opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
          : "border-white/5 bg-stone-900/40 hover:bg-stone-900/80 hover:border-amber-500/30 hover:shadow-[0_20px_40px_-12px_rgba(245,158,11,0.1)]"
      }`}
    >
      {/* Visual Section */}
      <div className="aspect-square relative p-3">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent" />
        <div className="w-full h-full relative rounded-[1.5rem] overflow-hidden bg-stone-950/50 flex items-center justify-center">
          {product.image_url && product.image_url.trim() !== "" ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-stone-900/50">
              <span className="text-2xl font-black tracking-tighter text-stone-700 select-none">
                ALIN.<span className="text-amber-700/50">CO</span>
              </span>
            </div>
          )}

          {/* Stock Badges */}
          <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5 z-10">
            {hasDiscount && (
              <span className="px-2.5 py-1 rounded-lg bg-red-500/90 text-white text-[9px] font-black uppercase tracking-widest shadow-lg border border-white/10 backdrop-blur-md">
                Sale
              </span>
            )}
            <span className="px-2.5 py-1 rounded-lg bg-black/60 text-white/90 text-[9px] font-black uppercase tracking-widest shadow-lg border border-white/10 backdrop-blur-md">
              Stock: {product.stock}
            </span>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-5 pt-2">
        <div className="flex justify-between items-start gap-4 mb-4">
          <div>
            <span className="text-[9px] font-black text-amber-500 uppercase tracking-[0.2em] mb-1 block">
              {product.category}
            </span>
            <h3 className="text-lg font-black text-white tracking-tight uppercase italic leading-none line-clamp-2">
              {product.name}
            </h3>
          </div>
        </div>

        {/* Price Block */}
        <div className="flex items-end gap-2 mb-5">
          <div className="text-xl font-black text-white tracking-tighter">
            Rp {product.price.toLocaleString("id-ID")}
          </div>
          {hasDiscount && (
            <div className="text-xs font-bold text-stone-600 line-through decoration-stone-600 mb-1">
              Rp {(product.original_price ?? 0).toLocaleString("id-ID")}
            </div>
          )}
        </div>

        {/* Actions Toolbar */}
        <div className="flex items-center gap-2 pt-4 border-t border-white/5 mt-auto">
          <button
            onClick={() => onToggleStatus(product.id, product.is_active)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer border shadow-sm active:scale-[0.98] ${
              product.is_active
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20 hover:border-emerald-500/30"
                : "bg-stone-900 border-white/5 text-stone-600 hover:text-white hover:border-white/10"
            }`}
            type="button"
          >
            <Power
              size={12}
              strokeWidth={3}
              className={
                product.is_active
                  ? "drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                  : ""
              }
            />
            {product.is_active ? "Aktif" : "Nonaktif"}
          </button>

          <div className="flex items-center gap-1.5 p-1 bg-stone-950/50 rounded-2xl border border-white/5 shadow-inner">
            <button
              onClick={() => onEdit(product)}
              className="w-10 h-10 flex items-center justify-center bg-stone-900 text-stone-500 hover:text-amber-500 hover:bg-amber-500/10 rounded-xl border border-white/5 transition-all cursor-pointer hover:border-amber-500/20 active:scale-90"
              title="Edit Produk"
              type="button"
            >
              <Edit size={16} strokeWidth={2.5} />
            </button>

            <button
              onClick={() => onDelete(product)}
              className="w-10 h-10 flex items-center justify-center bg-stone-900 text-stone-500 hover:text-red-500 hover:bg-red-400/10 rounded-xl border border-white/5 transition-all cursor-pointer hover:border-red-400/20 active:scale-90"
              title="Hapus Produk"
              type="button"
            >
              <Trash2 size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
