"use client";

import React from "react";
import { Coffee, CupSoda, UtensilsCrossed } from "lucide-react";
import Hero from "../Hero";
import PromoBanner from "../PromoBanner";
import ProductGrid from "../ProductGrid";
import { Product, Promo, Category } from "../../types";

interface MenuTabProps {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  filteredProducts: Product[];
  loading: boolean;
  addToCart: (product: Product) => void;
  promos: Promo[];
  categories: Category[];
  customerName: string;
  onPromoClick?: (promo: Promo) => void;
}

export default function MenuTab({
  activeCategory,
  setActiveCategory,
  filteredProducts,
  loading,
  addToCart,
  promos,
  categories: apiCategories,
  customerName,
  onPromoClick,
}: Readonly<MenuTabProps>) {
  // Helper to get icon based on category name (case-insensitive)
  const getCategoryIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("coffee") && !lowerName.includes("non"))
      return Coffee;
    if (
      lowerName.includes("non-coffee") ||
      lowerName.includes("tea") ||
      lowerName.includes("soda")
    )
      return CupSoda;
    if (
      lowerName.includes("makan") ||
      lowerName.includes("snack") ||
      lowerName.includes("food")
    )
      return UtensilsCrossed;
    return null; // Default fallback if needed
  };

  // Merge "All" with API categories
  const categories = [
    { id: "all", label: "Semua", icon: null },
    ...apiCategories.map((cat) => ({
      id: cat.name, // Using name as ID for filtering since products use category name
      label: cat.name,
      icon: getCategoryIcon(cat.name),
    })),
  ];

  return (
    <div className="animate-in fade-in duration-300">
      <Hero customerName={customerName} />
      <PromoBanner promos={promos} onPromoClick={onPromoClick} />

      {/* Category Tabs (Non-Sticky - Scrolls with Content) */}
      <div className="bg-stone-950 pt-6 pb-4 px-4 sticky top-[72px] z-30 backdrop-blur-md bg-stone-950/80">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all active:scale-95 cursor-pointer border
                ${
                  activeCategory === cat.id
                    ? "bg-amber-500 text-stone-950 border-amber-500 shadow-lg shadow-amber-500/10"
                    : "bg-stone-900/50 text-stone-500 border-stone-800 active:bg-stone-900"
                }
              `}
            >
              {cat.icon && <cat.icon size={16} />}
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="mt-4 relative">
        <h2 className="px-5 mb-4 text-xl font-black tracking-tight text-white uppercase">
          {activeCategory === "all" ? "Semua Menu" : "Pilihan Menu"}
        </h2>
        <ProductGrid
          products={filteredProducts}
          loading={loading}
          onAddToCart={addToCart}
        />
      </div>
    </div>
  );
}
