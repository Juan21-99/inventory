"use client";

import { MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { Promo } from "../types";

interface HeroProps {
  promos: Promo[];
  customerName: string;
}

export default function Hero({
  customerName,
}: Readonly<Omit<HeroProps, "promos">>) {
  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 300, damping: 24 },
    },
  };

  const badgeVariants = {
    hidden: { y: -20, opacity: 0, scale: 0.8 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: { type: "spring" as const, stiffness: 400, damping: 20 },
    },
  };

  return (
    <div className="relative h-[45vh] min-h-[400px] w-full overflow-hidden rounded-b-3xl shadow-xl">
      {/* Background Image with Zoom Animation */}
      <motion.div
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/foto.avif')`,
        }}
      />

      {/* Gradient Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-black/20"
      />

      {/* Content */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 p-8 text-white"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="max-w-xl mx-auto">
          {/* Location Badge */}
          <motion.div
            variants={badgeVariants}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/10 text-xs font-medium mb-4"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <MapPin size={12} className="text-amber-400" />
            </motion.div>
            <span>Alin Coffee • OFFICIAL</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl font-black leading-tight mb-2 tracking-tighter"
          >
            Halo, <span className="text-amber-400">{customerName}</span>
            <br />
            Waktunya Ngopi!
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="text-stone-300 text-sm max-w-sm leading-relaxed"
          >
            Disajikan dengan biji kopi pilihan dan suasana yang menenangkan
            hati.
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
