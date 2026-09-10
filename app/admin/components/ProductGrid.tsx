import { Package } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { SkeletonCard } from "./SkeletonCard";
import { Product } from "../types/product.types";

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
}

export const ProductGrid = ({
  products,
  loading,
  onEdit,
  onDelete,
  onToggleStatus,
}: ProductGridProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((id) => (
          <SkeletonCard key={`skeleton-${id}`} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-stone-900/40 rounded-[2.5rem] border border-dashed border-white/5 mx-auto max-w-2xl w-full">
        <div className="w-16 h-16 bg-stone-900 rounded-[1.5rem] flex items-center justify-center mb-6 border border-white/5 shadow-[0_0_30px_-10px_rgba(245,158,11,0.3)]">
          <Package className="text-amber-500" size={32} strokeWidth={1.5} />
        </div>
        <p className="text-white font-black uppercase tracking-widest text-sm mb-1">
          Tidak ada produk
        </p>
        <p className="text-stone-500 text-xs font-bold text-center px-4">
          Belum ada produk yang sesuai dengan pencarian Anda
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 contain-layout">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
        />
      ))}
    </div>
  );
};
