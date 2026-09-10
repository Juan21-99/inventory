"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

export default function ThemeToggle({
  className = "",
  showLabel = false,
}: {
  className?: string;
  showLabel?: boolean;
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800/80 animate-pulse ${className}`}
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle tema"
      className={`relative inline-flex items-center justify-center gap-2 p-2 rounded-xl transition-colors duration-200 border cursor-pointer ${
        isDark
          ? "bg-stone-900 border-white/10 text-amber-400 hover:bg-stone-800 hover:text-amber-300"
          : "bg-white border-stone-200 text-stone-700 hover:bg-stone-100 hover:text-stone-900 shadow-sm"
      } ${className}`}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ rotate: -90, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Moon className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-amber-400/20 stroke-amber-400" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ rotate: 90, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: -90, scale: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Sun className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-500 stroke-[2.2]" />
          </motion.div>
        )}
      </div>

      {showLabel && (
        <span className="text-xs font-medium text-stone-700 dark:text-stone-300">
          {isDark ? "Mode Gelap" : "Mode Terang"}
        </span>
      )}
    </motion.button>
  );
}
