"use client";

import React from "react";
import { Minus, Plus, Truck, Store } from "lucide-react";
import { CartItem, Address } from "../../types";
import Modal from "../../../components/ui/Modal";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  cartTotal: number;
  onCheckout: () => void;
  orderType: "pickup" | "delivery";
  setOrderType: (type: "pickup" | "delivery") => void;
  addresses?: Address[];
  selectedAddressId?: string | null;
  onSelectAddress?: (id: string) => void;
  onManageAddresses?: () => void;
}

export default function CartModal({
  isOpen,
  onClose,
  cart,
  removeFromCart,
  updateQuantity,
  cartTotal,
  onCheckout,
  orderType,
  setOrderType,
  addresses = [],
  selectedAddressId,
  onSelectAddress,
  onManageAddresses,
}: Readonly<CartModalProps>) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Keranjang"
      description="Kelola pesanan pilihanmu sebelum lanjut."
    >
      <div className="flex flex-col max-h-[60vh]">
        <div className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-hide py-2">
          {cart.length === 0 ? (
            <div className="text-center py-16 flex flex-col items-center">
              <div className="w-20 h-20 bg-stone-900/50 rounded-full flex items-center justify-center mb-6 text-stone-700 border border-white/5 shadow-2xl shadow-black/20">
                <span className="text-xl font-black tracking-tighter select-none">
                  ALIN.<span className="text-amber-800/60">CO</span>
                </span>
              </div>
              <h3 className="text-stone-300 font-bold text-lg mb-2">
                Keranjang Kosong
              </h3>
              <p className="text-stone-500 text-sm max-w-[200px] leading-relaxed">
                Ayo pesan kopi favoritmu sekarang!
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="w-20 h-20 bg-stone-950 rounded-2xl shrink-0 overflow-hidden flex items-center justify-center border border-white/5">
                  {item.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-stone-600 text-[10px] font-black uppercase">
                      No Image
                    </span>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <h4 className="font-bold text-white line-clamp-1 text-sm">
                      {item.name}
                    </h4>
                    <p className="text-xs font-bold text-amber-500">
                      Rp {item.price.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-[10px] font-black text-red-500/80 hover:text-red-500 cursor-pointer uppercase tracking-widest"
                    >
                      Hapus
                    </button>
                    <div className="flex items-center gap-3 bg-stone-950 rounded-xl p-1 border border-white/5">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-7 h-7 flex items-center justify-center bg-stone-800 rounded-lg text-stone-400 active:scale-95 transition-transform cursor-pointer"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-xs font-bold text-white w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-7 h-7 flex items-center justify-center bg-amber-500 text-stone-950 rounded-lg active:scale-95 transition-transform cursor-pointer"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-white/5 mt-6 pt-6 space-y-6">
            {/* Order Type Selection */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setOrderType("pickup")}
                className={`py-3.5 px-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  orderType === "pickup"
                    ? "border-amber-500 bg-amber-500/10 text-amber-500 shadow-lg shadow-amber-500/5"
                    : "border-white/5 bg-stone-950/50 text-stone-500 hover:border-white/10"
                }`}
              >
                <Store size={16} /> Pickup
              </button>
              <button
                onClick={() => setOrderType("delivery")}
                className={`py-3.5 px-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  orderType === "delivery"
                    ? "border-amber-500 bg-amber-500/10 text-amber-500 shadow-lg shadow-amber-500/5"
                    : "border-white/5 bg-stone-950/50 text-stone-500 hover:border-white/10"
                }`}
              >
                <Truck size={16} /> Delivery
              </button>
            </div>

            {/* Address Selection (Only for Delivery) */}
            {orderType === "delivery" && (
              <div className="space-y-3 animate-in slide-in-from-bottom-8 fade-in duration-300">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-black text-stone-500 uppercase tracking-widest ml-1">
                    Alamat Pengiriman
                  </h4>
                  {onManageAddresses && (
                    <button
                      onClick={onManageAddresses}
                      className="text-[10px] font-black text-amber-500 uppercase tracking-widest hover:text-amber-400 cursor-pointer"
                    >
                      {addresses.length === 0 ? "Tambah" : "Ubah / Tambah"}
                    </button>
                  )}
                </div>

                {addresses.length === 0 ? (
                  <button
                    onClick={onManageAddresses}
                    className="w-full py-4 rounded-2xl border border-dashed border-stone-800 bg-stone-900/50 text-stone-400 text-xs font-bold hover:border-amber-500/50 hover:text-amber-500 transition-all cursor-pointer"
                  >
                    + Tambah Alamat Baru
                  </button>
                ) : (
                  <div className="space-y-2">
                    {addresses.map((addr) => (
                      <button
                        key={addr.id}
                        onClick={() => onSelectAddress?.(addr.id)}
                        className={`w-full text-left p-4 rounded-2xl border cursor-pointer transition-all ${
                          selectedAddressId === addr.id
                            ? "bg-amber-500/10 border-amber-500"
                            : "bg-stone-950/50 border-stone-800 hover:border-stone-700"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span
                            className={`text-xs font-bold ${
                              selectedAddressId === addr.id
                                ? "text-amber-500"
                                : "text-white"
                            }`}
                          >
                            {addr.label}
                          </span>
                          {selectedAddressId === addr.id && (
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                          )}
                        </div>
                        <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
                          {addr.detail}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4">
              <div className="flex justify-between text-base font-black text-white uppercase tracking-tighter">
                <span className="text-stone-500">Estimasi Total</span>
                <span className="text-amber-500">
                  Rp {cartTotal.toLocaleString("id-ID")}
                </span>
              </div>
              <button
                onClick={onCheckout}
                className="w-full bg-amber-500 text-stone-950 py-4.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-amber-500/10 hover:bg-amber-400 active:scale-95 transition-all cursor-pointer"
              >
                Lanjut ke Pembayaran
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
