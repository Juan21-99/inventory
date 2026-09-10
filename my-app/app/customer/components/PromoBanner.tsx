"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import Image from "next/image";
import { Promo } from "../types";

interface PromoBannerProps {
  readonly promos: Promo[];
  readonly onPromoClick?: (promo: Promo) => void;
}

export default function PromoBanner({
  promos,
  onPromoClick,
}: PromoBannerProps) {
  const [active, setActive] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, offsetWidth } = scrollRef.current;
      const newActive = Math.round(scrollLeft / (offsetWidth * 0.8));
      setActive(newActive);
    }
  };

  // Auto Scroll Effect
  useEffect(() => {
    if (isPaused || promos.length <= 1) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const nextIndex = (active + 1) % promos.length;
        const container = scrollRef.current;

        const child = container.children[0] as HTMLElement;
        const scrollAmount = child ? (child.offsetWidth + 16) * nextIndex : 0;

        container.scrollTo({
          left: nextIndex === 0 ? 0 : scrollAmount,
          behavior: "smooth",
        });

        setActive(nextIndex);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [active, isPaused, promos.length]);

  if (promos.length === 0) return null;

  return (
    <div className="w-full overflow-hidden py-4">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        className="flex gap-4 overflow-x-auto px-5 pb-4 scrollbar-hide snap-x snap-mandatory"
      >
        {promos.map((promo) => (
          <motion.div
            key={promo.id}
            onClick={() => promo.product_id && onPromoClick?.(promo)}
            whileTap={{ scale: 0.98 }}
            className={`
              relative flex-shrink-0 w-[85%] aspect-[16/8] rounded-[2rem] 
              bg-gradient-to-br ${promo.color} p-6 overflow-hidden snap-center
              shadow-xl shadow-black/20 border border-white/10
              ${promo.product_id ? "active:scale-95" : ""}
            `}
          >
            {promo.image && (
              <div className="absolute inset-0 z-0">
                <Image
                  src={promo.image}
                  alt={promo.title}
                  fill
                  className="object-cover opacity-60 mix-blend-overlay"
                />
              </div>
            )}

            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />

            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white">
                    <Sparkles size={20} strokeWidth={2.5} />
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] bg-black/20 backdrop-blur-md px-2 py-1 rounded-lg text-white/80 border border-white/5">
                    {promo.badge}
                  </span>
                </div>

                <h3 className="text-xl font-black text-white tracking-tighter uppercase italic leading-none mb-1">
                  {promo.title}
                </h3>
                <p className="text-[11px] font-medium text-white/70 max-w-[200px] leading-relaxed line-clamp-2">
                  {promo.description}
                </p>
              </div>

              {promo.product_id && (
                <div className="flex items-center gap-2 group w-fit">
                  <span className="text-[9px] font-black text-white uppercase tracking-widest group-active:mr-1 transition-all">
                    Lihat Produk
                  </span>
                  <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-white group-active:bg-white transition-all group-active:text-stone-900 shadow-lg">
                    <ArrowRight size={12} />
                  </div>
                </div>
              )}
            </div>

            <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          </motion.div>
        ))}
      </div>

      {/* Scroll Indicators */}
      <div className="flex justify-center gap-1.5 mt-1">
        {promos.map((p, idx) => (
          <button
            key={p.id}
            onClick={() => {
              if (scrollRef.current) {
                const container = scrollRef.current;
                const child = container.children[0] as HTMLElement;
                const scrollAmount = child ? (child.offsetWidth + 16) * idx : 0;
                container.scrollTo({
                  left: scrollAmount,
                  behavior: "smooth",
                });
                setActive(idx);
              }
            }}
            className={`h-1 rounded-full transition-all duration-300 ${
              idx === active ? "w-4 bg-amber-500" : "w-1 bg-stone-800"
            }`}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
