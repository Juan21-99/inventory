"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image_url: string;
  is_active: boolean;
  stock: number;
  original_price?: number;
  description?: string;
}

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  onAddToCart: (product: Product) => void;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

function ProductCard({ product, onAddToCart }: Readonly<ProductCardProps>) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const isSoldOut = !product.stock || product.stock <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSoldOut) {
      onAddToCart(product);
    }
  };

  const ariaLabel = isSoldOut
    ? `${product.name} - Habis`
    : `${product.name} - Rp ${product.price.toLocaleString("id-ID")}`;

  return (
    <div
      onClick={() => !isSoldOut && onAddToCart(product)}
      className={`bg-stone-900/50 rounded-3xl p-3 shadow-xl border border-white/5 transition-all duration-200 relative group w-full text-left
        ${isSoldOut ? "opacity-60 grayscale cursor-not-allowed" : "cursor-pointer active:scale-[0.98] active:bg-stone-900 active:border-amber-500/20"}`}
      aria-label={ariaLabel}
      role="button"
      tabIndex={isSoldOut ? -1 : 0}
      onKeyDown={(e) => {
        if (!isSoldOut && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onAddToCart(product);
        }
      }}
    >
      {/* Image Container */}
      <div className="aspect-square rounded-2xl overflow-hidden mb-3 relative bg-stone-50">
        {product.image_url && !imageError ? (
          <>
            {imageLoading && (
              <div className="absolute inset-0 bg-stone-200 animate-pulse" />
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.image_url}
              alt={product.name}
              className={`w-full h-full object-cover transition-all duration-300 ${
                imageLoading
                  ? "opacity-0"
                  : "opacity-100 group-active:scale-105"
              }`}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageError(true);
                setImageLoading(false);
              }}
              loading="lazy"
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-stone-800/50">
            <span className="text-xs font-black tracking-tighter text-stone-600 select-none">
              ALIN.<span className="text-amber-600/50">CO</span>
            </span>
          </div>
        )}

        {isSoldOut && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
              Habis
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="px-1">
        <h3 className="font-bold text-white text-sm leading-snug line-clamp-2 mb-1 min-h-[2.5rem]">
          {product.name}
        </h3>

        <div className="flex items-center justify-between mt-2">
          <div className="flex flex-col">
            {(product.original_price ?? 0) > product.price && (
              <span className="text-[10px] text-stone-500 line-through">
                Rp {product.original_price?.toLocaleString("id-ID")}
              </span>
            )}
            <p className="font-bold text-amber-400 text-sm drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">
              Rp {product.price.toLocaleString("id-ID")}
            </p>
            {!isSoldOut && (
              <span className="text-[10px] text-stone-400 font-medium">
                Stok: {product.stock}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isSoldOut}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-90 disabled:cursor-not-allowed
              ${
                isSoldOut
                  ? "bg-stone-800 text-stone-600"
                  : "bg-amber-500 text-stone-950 active:bg-amber-400 shadow-lg shadow-amber-500/10"
              }`}
            aria-label={
              isSoldOut
                ? `${product.name} habis`
                : `Tambah ${product.name} ke keranjang`
            }
          >
            <Plus size={16} strokeWidth={2.5} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductGrid({
  products,
  loading,
  onAddToCart,
}: Readonly<ProductGridProps>) {
  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      const aInStock = a.stock > 0;
      const bInStock = b.stock > 0;

      if (aInStock && !bInStock) return -1;
      if (!aInStock && bInStock) return 1;

      return 0;
    });
  }, [products]);

  if (loading) {
    return (
      <div
        className="grid grid-cols-2 gap-4 px-4 pb-24"
        aria-label="Memuat produk"
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-stone-900/50 border border-white/5 rounded-3xl p-4 h-64 animate-pulse"
            aria-hidden="true"
          >
            <div className="w-full h-32 bg-stone-800 rounded-2xl mb-3" />
            <div className="h-4 bg-stone-800 rounded w-3/4 mb-2" />
            <div className="h-4 bg-stone-800 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!loading && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="w-20 h-20 bg-stone-900/50 rounded-full flex items-center justify-center mb-6 text-stone-700 border border-white/5 shadow-2xl shadow-black/20">
          <span className="text-xl font-black tracking-tighter select-none">
            ALIN.<span className="text-amber-800/60">CO</span>
          </span>
        </div>
        <h3 className="text-stone-300 font-bold text-lg mb-2">
          Menu Belum Tersedia
        </h3>
        <p className="text-stone-500 text-sm max-w-[250px] leading-relaxed">
          Kami sedang menyiapkan menu terbaik untuk Anda. Silakan cek kembali
          nanti.
        </p>
      </div>
    );
  }

  return (
    <ul
      className="grid grid-cols-2 gap-4 px-4 pb-32 list-none"
      aria-label="Daftar produk"
    >
      {sortedProducts.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} onAddToCart={onAddToCart} />
        </li>
      ))}
    </ul>
  );
}
