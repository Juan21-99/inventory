"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";

interface NavbarProps {
  cartCount: number;
  cartTotal?: number;
  onOpenCart: () => void;
  brandLink?: string;
}

const smoothTransition = {
  type: "tween" as const,
  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
  duration: 0.6,
};

export default function Navbar({
  cartCount,
  cartTotal = 0,
  onOpenCart,
  brandLink,
}: Readonly<NavbarProps>) {
  const [isAtTop, setIsAtTop] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    const atTop = currentScrollY < 10;

    setIsAtTop(atTop);

    // Set visibility based on top position
    if (atTop) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }

    // Clear previous timeout
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    // Show navbar after scrolling stops (if not at top, where it's already visible)
    if (!atTop) {
      scrollTimeout.current = setTimeout(() => {
        setIsVisible(true);
      }, 600);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, [handleScroll]);

  /**
   * Resolve brand URL safely for client-side environments.
   * - Prefer explicit prop (recommended)
   * - Fallback to NEXT_PUBLIC env if available
   * - Finally fallback to '#'
   */
  const resolvedBrandLink = useMemo(() => {
    if (brandLink) return brandLink;
    if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_BRAND_LINK) {
      return process.env.NEXT_PUBLIC_BRAND_LINK;
    }
    return "#";
  }, [brandLink]);

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 px-4 py-4"
      animate={{
        y: isVisible ? 0 : -100,
        opacity: isVisible ? 1 : 0,
      }}
      initial={{ y: 0, opacity: 0 }}
      transition={smoothTransition}
    >
      <div className="max-w-xl mx-auto flex justify-end">
        <AnimatePresence mode="wait">
          <motion.div
            key={`container-${isAtTop ? "top" : "scroll"}`}
            className={`bg-stone-900/60 backdrop-blur-xl border border-white/10 rounded-full flex items-center shadow-2xl shadow-stone-950/40 ${
              isAtTop ? "w-full px-5 py-3" : "w-auto p-2"
            }`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              duration: 0.4,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            <AnimatePresence>
              {isAtTop && (
                <motion.a
                  key="logo"
                  href={resolvedBrandLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center active:opacity-80 active:scale-95 overflow-hidden flex-1 opacity-100"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "auto", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  title="Kunjungi Instagram Alin Coffee"
                >
                  <span className="font-black text-xl tracking-tighter text-white drop-shadow-sm whitespace-nowrap">
                    ALIN.<span className="text-amber-400">CO</span>
                  </span>
                </motion.a>
              )}
            </AnimatePresence>

            <motion.button
              key="cart"
              layout
              onClick={onOpenCart}
              className={`relative rounded-full bg-white/10 active:bg-white/20 text-white transition-all cursor-pointer active:scale-95 shrink-0 flex items-center gap-2 ${
                isAtTop ? "p-2.5 px-4" : "p-3"
              }`}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <ShoppingBag size={isAtTop ? 18 : 22} />

              <AnimatePresence>
                {isAtTop && cartCount > 0 && (
                  <motion.span
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "auto", opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="text-sm font-bold whitespace-nowrap overflow-hidden"
                  >
                    Rp {cartTotal.toLocaleString("id-ID")}
                  </motion.span>
                )}
              </AnimatePresence>

              {cartCount > 0 && (
                <motion.span
                  className={`absolute bg-amber-500 rounded-full border-2 border-stone-900 ${
                    isAtTop
                      ? "-top-1 -right-1 w-5 h-5 flex items-center justify-center text-[10px] font-black text-stone-900"
                      : "top-0 right-0 w-5 h-5 flex items-center justify-center text-[10px] font-bold text-white"
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {cartCount}
                </motion.span>
              )}
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
