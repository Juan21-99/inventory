"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Minus, Plus, ShoppingBag, Loader2 } from "lucide-react";
import { Product } from "../../types";
import Modal from "../../../components/ui/Modal";
import { supabase } from "@/lib/supabase";

interface ProductDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onAddToCart: (product: Product, quantity: number, note?: string) => void;
}

interface OptionItem {
  id: string;
  name: string;
  price: number;
}

interface OptionGroup {
  id: string;
  name: string;
  selection_type: "single" | "multiple";
  is_required: boolean;
  items: OptionItem[];
}

export default function ProductDetailSheet({
  isOpen,
  onClose,
  product,
  onAddToCart,
}: Readonly<ProductDetailSheetProps>) {
  // Base State
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  // Dynamic Options State
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [groups, setGroups] = useState<OptionGroup[]>([]);
  const [selections, setSelections] = useState<Record<string, string[]>>({});

  // Reset state when product changes
  useEffect(() => {
    if (isOpen && product) {
      setQuantity(1);
      setNotes("");
      setSelections({});
      fetchOptions(product.id);
    }
  }, [isOpen, product]);

  const fetchOptions = async (productId: string) => {
    try {
      setLoadingOptions(true);
      // 1. Get linked groups
      const { data: links } = await supabase
        .from("product_options")
        .select("group_id")
        .eq("product_id", productId);

      if (!links || links.length === 0) {
        setGroups([]);
        return;
      }

      const groupIds = links.map((l) => l.group_id);

      // 2. Get Groups
      const { data: groupsData } = await supabase
        .from("option_groups")
        .select("*")
        .in("id", groupIds)
        .order("created_at");

      if (!groupsData) return;

      // 3. Get Items
      const { data: itemsData } = await supabase
        .from("option_items")
        .select("*")
        .in("group_id", groupIds)
        .order("price");

      // 4. Combine
      const fullGroups = groupsData.map((g) => ({
        ...g,
        items: itemsData ? itemsData.filter((i) => i.group_id === g.id) : [],
      }));

      setGroups(fullGroups);

      // Initialize Defaults (Optional: Auto-select first item for required single groups)
      const initialSelections: Record<string, string[]> = {};
      fullGroups.forEach((g) => {
        if (
          g.is_required &&
          g.selection_type === "single" &&
          g.items.length > 0
        ) {
          // Auto select first one or none? Let's leave empty but validation will block
          initialSelections[g.id] = [g.items[0].id]; // Auto-select first for UX
        } else {
          initialSelections[g.id] = [];
        }
      });
      setSelections(initialSelections);
    } catch (err) {
      console.error("Error fetching options", err);
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleSelection = (
    groupId: string,
    itemId: string,
    type: "single" | "multiple",
  ) => {
    setSelections((prev) => {
      const current = prev[groupId] || [];
      if (type === "single") {
        return { ...prev, [groupId]: [itemId] };
      }
      if (current.includes(itemId)) {
        return { ...prev, [groupId]: current.filter((id) => id !== itemId) };
      }
      return { ...prev, [groupId]: [...current, itemId] };
    });
  };

  // Helper: Calculate price for a single group
  const calculateGroupPrice = useCallback(
    (group: OptionGroup) => {
      const selectedIds = selections[group.id] || [];
      return selectedIds.reduce((sum, itemId) => {
        const item = group.items.find((i) => i.id === itemId);
        return sum + (item?.price || 0);
      }, 0);
    },
    [selections],
  );

  // Pricing Logic
  const optionsTotal = useMemo(() => {
    return groups.reduce(
      (total, group) => total + calculateGroupPrice(group),
      0,
    );
  }, [groups, calculateGroupPrice]);

  const unitPrice = (product?.price || 0) + optionsTotal;
  const totalPrice = unitPrice * quantity;

  // Helpers
  const isGroupValid = (group: OptionGroup) => {
    if (!group.is_required) return true;
    const selected = selections[group.id];
    return selected && selected.length > 0;
  };

  const canAdd = groups.every(isGroupValid);

  // Helper: Build options note for a single group
  const buildGroupNote = (group: OptionGroup) => {
    const selectedIds = selections[group.id] || [];
    if (selectedIds.length === 0) return null;

    const selectedNames = selectedIds
      .map((id) => group.items.find((i) => i.id === id)?.name)
      .filter(Boolean);
    return `[${group.name}: ${selectedNames.join(", ")}]`;
  };

  const handleAdd = () => {
    if (!product || !canAdd) return;

    const optionsNoteParts = groups
      .map(buildGroupNote)
      .filter((note): note is string => note !== null);

    const fullNote = [...optionsNoteParts, notes].filter(Boolean).join(" ");

    onAddToCart({ ...product, price: unitPrice }, quantity, fullNote);
    onClose();
  };

  if (!product) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product.name}
      description={product.category.toUpperCase()}
    >
      <div className="flex flex-col max-h-[75vh]">
        <div className="flex-1 overflow-y-auto space-y-8 pr-2 scrollbar-hide py-2">
          {/* Large Product Image */}
          <div className="aspect-[4/3] rounded-[2.5rem] bg-stone-950 overflow-hidden border border-white/5 relative group shrink-0">
            {product.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-800 bg-stone-900">
                <span className="text-3xl font-black tracking-tighter text-stone-800 select-none">
                  ALIN.<span className="text-amber-900/40">CO</span>
                </span>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />

            {/* Quick Price Indicator */}
            <div className="absolute bottom-6 left-6 flex flex-col">
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-1">
                Harga Dasar
              </span>
              <span className="text-2xl font-black text-white tracking-tighter italic">
                Rp {product.price.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          {/* Product Description */}
          {product.description && (
            <div className="px-1">
              <h4 className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] mb-2">
                Deskripsi
              </h4>
              <p className="text-sm text-stone-400 leading-relaxed font-medium">
                {product.description}
              </p>
            </div>
          )}

          {loadingOptions ? (
            <div className="py-10 text-center text-stone-500 flex flex-col items-center gap-2">
              <Loader2 className="animate-spin" />
              <span className="text-xs">Memuat opsi...</span>
            </div>
          ) : (
            <div className="space-y-8">
              {groups.length === 0 && (
                <p className="text-center text-stone-500 text-xs py-4">
                  Tidak ada opsi tambahan untuk menu ini.
                </p>
              )}
              {groups.map((group) => {
                const isValid = isGroupValid(group);
                return (
                  <section key={group.id}>
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className={`text-[10px] font-black uppercase tracking-[0.2em] ml-1 ${isValid ? "text-stone-500" : "text-amber-500 animate-pulse"}`}
                      >
                        {group.name} {group.is_required && "*"}
                      </span>
                      <span className="text-[9px] font-bold text-stone-600 bg-stone-800/50 px-2 py-0.5 rounded-md uppercase tracking-widest">
                        {group.selection_type === "single"
                          ? "Pilih 1"
                          : "Pilih Banyak"}
                      </span>
                    </div>
                    <div
                      className={`grid gap-3 ${group.items.length > 4 ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"}`}
                    >
                      {group.items.map((item) => {
                        const isSelected = (
                          selections[group.id] || []
                        ).includes(item.id);
                        return (
                          <button
                            key={item.id}
                            onClick={() =>
                              handleSelection(
                                group.id,
                                item.id,
                                group.selection_type,
                              )
                            }
                            className={`p-4 rounded-2xl border transition-all text-left relative overflow-hidden active:scale-95 cursor-pointer flex justify-between items-center ${
                              isSelected
                                ? "bg-amber-500 border-amber-500 text-stone-950 shadow-lg shadow-amber-500/10"
                                : "bg-stone-950/50 border-stone-800 text-stone-500 hover:border-stone-700"
                            }`}
                          >
                            <span className="font-black text-[10px] uppercase tracking-widest">
                              {item.name}
                            </span>
                            {item.price > 0 ? (
                              <span
                                className={`text-[8px] font-bold uppercase tracking-widest ${isSelected ? "text-stone-900/60" : "text-amber-500/80"}`}
                              >
                                +{item.price / 1000}rb
                              </span>
                            ) : (
                              <span
                                className={`text-[8px] font-bold uppercase tracking-widest ${isSelected ? "text-stone-900/60" : "text-stone-600"}`}
                              >
                                GRATIS
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                );
              })}

              {/* Notes Section */}
              <section className="pb-4">
                <label
                  htmlFor="order-notes"
                  className="block text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] mb-4 ml-1"
                >
                  Catatan Pesanan
                </label>
                <textarea
                  id="order-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Jangan terlalu manis..."
                  className="w-full bg-stone-950/50 border border-stone-800 rounded-2xl p-4 text-sm text-white focus:border-amber-500/50 outline-none transition-all resize-none min-h-[100px] placeholder:text-stone-700"
                />
              </section>
            </div>
          )}
        </div>

        {/* Bottom Action Bar */}
        <div className="border-t border-white/5 mt-6 pt-6 grid grid-cols-[1.2fr_2fr] gap-4 items-center">
          <div className="flex items-center justify-between bg-stone-950 rounded-2xl p-1.5 border border-white/5 h-[62px]">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-11 h-11 flex items-center justify-center bg-stone-900 rounded-xl text-stone-400 active:scale-90 transition-transform cursor-pointer"
            >
              <Minus size={18} />
            </button>
            <span className="text-xl font-black text-white">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-11 h-11 flex items-center justify-center bg-amber-500 rounded-xl text-stone-950 active:scale-90 shadow-lg shadow-amber-500/10 transition-transform cursor-pointer"
            >
              <Plus size={18} />
            </button>
          </div>

          <button
            onClick={handleAdd}
            disabled={!canAdd}
            className="w-full bg-stone-100 text-stone-950 h-[62px] rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-2xl hover:bg-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingBag size={20} strokeWidth={2.5} />
            {canAdd
              ? `Tambah - Rp ${totalPrice.toLocaleString("id-ID")}`
              : "Lengkapi Opsi"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
