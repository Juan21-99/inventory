"use client";

import { useState, useEffect } from "react";
import { ANIMATION } from "../components/constants";
import { motion } from "framer-motion";

interface StatCardProps {
  label: string;
  value: string;
  numericValue?: number;
  prefix?: string;
  duration?: number;
  animationType?: "smooth" | "step";
  icon: React.ElementType;
  trend?: string;
  index?: number;
  centerValue?: boolean;
}

export function StatCard({
  label,
  value,
  numericValue,
  prefix = "",
  duration = ANIMATION.SMOOTH_DURATION,
  animationType = "smooth",
  icon: Icon,
  trend,
  index = 0,
  centerValue = false,
}: Readonly<StatCardProps>) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (typeof numericValue !== "number") return;
    const start = 0;
    const end = numericValue;
    const startTime = performance.now();
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      let ease = progress;
      if (animationType === "smooth") {
        ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      }
      const current = start + (end - start) * ease;
      setDisplayValue(current);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [numericValue, duration, animationType]);

  const formattedValue =
    typeof numericValue === "number"
      ? `${prefix}${Math.floor(displayValue).toLocaleString("id-ID")}`
      : value;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.1,
      }}
      className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-stone-900 to-stone-800 text-white shadow-xl shadow-stone-900/20 border border-stone-800 hover:-translate-y-1 transition-transform duration-200 contain-content will-change-transform"
      aria-label={`${label}: ${formattedValue}`}
    >
      <div className="relative z-10">
        <div className="flex flex-col h-full justify-between">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-white/10 text-amber-400 shrink-0">
                <Icon size={20} aria-hidden="true" />
              </div>
              <span className="text-[10px] font-black tracking-widest uppercase text-stone-500">
                {label}
              </span>
            </div>
            {trend && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20 whitespace-nowrap">
                {trend}
              </div>
            )}
          </div>

          <h3
            className={`text-xl sm:text-2xl xl:text-3xl font-black tracking-tighter font-mono leading-none break-all ${centerValue ? "text-center" : ""}`}
          >
            {formattedValue}
          </h3>
        </div>
      </div>

      {/* Decorative glow */}
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-amber-500/10 blur-2xl rounded-full" />

      {/* Decorative pattern */}
      <svg
        className="absolute bottom-0 right-0 w-32 h-32 text-white/5 pointer-events-none"
        viewBox="0 0 100 100"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M0 100C30 100 30 50 100 50"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M0 100C30 100 30 70 100 70"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M0 100C30 100 30 90 100 90"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    </motion.article>
  );
}
