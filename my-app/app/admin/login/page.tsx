"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  Coffee,
  Mail,
  Lock,
  Loader2,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [emailValid, setEmailValid] = useState<boolean | null>(null);

  const router = useRouter();
  const { signIn } = useAuth();

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateForm = () => {
    if (!validateEmail(email)) {
      setError("Format email tidak valid");
      return false;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter");
      return false;
    }

    return true;
  };

  const getEmailIcon = () => {
    if (emailValid === true) {
      return <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />;
    }
    if (emailValid === false) {
      return <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />;
    }
    return <Mail className="w-4 h-4 sm:w-5 sm:h-5" />;
  };

  const getEmailBorderClass = () => {
    if (emailValid === true) {
      return "border-green-500 focus:border-green-500 focus:ring-green-500/20";
    }
    if (emailValid === false) {
      return "border-red-500 focus:border-red-500 focus:ring-red-500/20";
    }
    return "border-stone-200 focus:border-amber-700 focus:ring-amber-700/20";
  };

  const getEmailIconColor = () => {
    if (focusedField === "email") return "text-amber-700";
    if (emailValid === true) return "text-green-500";
    if (emailValid === false) return "text-red-500";
    return "text-stone-400";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setError("");
    setLoading(true);

    try {
      await signIn(email, password);
      router.push("/admin");
    } catch {
      setError("Email atau Password salah");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (value) {
      setEmailValid(validateEmail(value));
    } else {
      setEmailValid(null);
    }
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 300, damping: 24 },
    },
  };

  const imageSectionVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, ease: "easeOut" as const, delay: 0.2 },
    },
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-stone-50 font-sans selection:bg-amber-100 selection:text-amber-900 overflow-hidden">
      {/* LEFT SIDE: FORM SECTION */}
      <motion.div
        className="w-full lg:w-1/2 flex flex-col justify-center items-center p-4 sm:p-6 md:p-8 lg:p-16 xl:p-24 relative z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md space-y-8">
          {/* Brand / Logo */}
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-3"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-amber-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-900/20">
              <Coffee strokeWidth={2.5} className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="text-base sm:text-lg md:text-xl font-bold text-stone-900 tracking-tight">
              Alin Coffee
            </span>
          </motion.div>

          {/* Headline */}
          <motion.div variants={itemVariants} className="space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-stone-900">
              Selamat Datang
            </h1>
            <p className="text-stone-500 text-sm sm:text-base md:text-lg">
              Silakan masuk untuk mengelola toko.
            </p>
          </motion.div>

          {/* Error State */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-red-50 text-red-600 text-sm flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {/* Email Field */}
            <motion.div variants={itemVariants} className="space-y-2">
              <label
                htmlFor="email"
                className={`text-xs sm:text-sm font-semibold transition-colors duration-200 ${focusedField === "email" ? "text-amber-700" : "text-stone-600"}`}
              >
                Email Address
              </label>
              <div className="relative group">
                <div
                  className={`absolute left-0 top-0 bottom-0 w-8 sm:w-10 flex items-center justify-center transition-colors duration-200 ${getEmailIconColor()}`}
                >
                  {getEmailIcon()}
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  onChange={handleEmailChange}
                  className={`w-full pl-8 pr-4 py-2.5 sm:py-3 bg-white border rounded-lg sm:rounded-xl focus:ring-1 outline-none transition-all duration-200 placeholder:text-stone-300 text-stone-800 ${getEmailBorderClass()}`}
                  placeholder="name@company.com"
                  required
                />
              </div>
            </motion.div>

            {/* Password Field */}
            <motion.div variants={itemVariants} className="space-y-2">
              <label
                htmlFor="password"
                className={`text-xs sm:text-sm font-semibold transition-colors duration-200 ${focusedField === "password" ? "text-amber-700" : "text-stone-600"}`}
              >
                Password
              </label>
              <div className="relative group">
                <div
                  className={`absolute left-0 top-0 bottom-0 w-8 sm:w-10 flex items-center justify-center transition-colors duration-200 ${focusedField === "password" ? "text-amber-700" : "text-stone-400"}`}
                >
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-8 pr-12 py-2.5 sm:py-3 bg-white border border-stone-200 rounded-lg sm:rounded-xl focus:border-amber-700 focus:ring-1 focus:ring-amber-700 outline-none transition-all duration-200 placeholder:text-stone-300 text-stone-800"
                  placeholder="Masukan password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-2 rounded-lg transition-colors focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  ) : (
                    <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  )}
                </button>
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.div variants={itemVariants}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="group w-full bg-stone-900 hover:bg-black text-white font-medium py-2.5 sm:py-3 px-4 rounded-lg sm:rounded-xl transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-stone-900/10 hover:shadow-stone-900/20 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 sm:w-5 h-4 sm:h-5 animate-spin text-stone-400" />
                    <span>Sedang Masuk...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk Dashboard</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </motion.div>

            {/* Footer Text */}
            <motion.p
              variants={itemVariants}
              className="text-center text-xs sm:text-sm text-stone-500 pt-3 sm:pt-4"
            >
              Butuh bantuan akses?{" "}
              <a
                href="https://www.instagram.com/natliinn/"
                className="font-medium text-stone-900 hover:underline decoration-amber-700 underline-offset-4"
              >
                Hubungi Admin
              </a>
            </motion.p>
          </form>
        </div>

        {/* Footer Copyright (Absolute Bottom) */}
        <motion.div
          variants={itemVariants}
          className="absolute bottom-4 sm:bottom-8 text-xs text-stone-400"
        >
          © {new Date().getFullYear()} Alin Coffee
        </motion.div>
      </motion.div>

      {/* RIGHT SIDE: IMAGE SECTION */}
      <motion.div
        className="hidden lg:flex w-full lg:w-1/2 relative bg-stone-900 overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={imageSectionVariants}
      >
        {/* Coffee Image */}
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <Image
            src="/foto.avif"
            alt="Alin Coffee"
            fill
            className="object-cover opacity-80"
            priority
          />
        </motion.div>

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/40 to-transparent" />

        {/* Content on Right Side */}
        <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 md:p-16 text-white space-y-4 sm:space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center mb-3"
          >
            <Coffee className="text-white w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
          </motion.div>

          <motion.blockquote
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium leading-tight max-w-lg"
          >
            &quot;Kopi yang baik bukan sekadar minuman, tapi sebuah
            pengalaman.&quot;
          </motion.blockquote>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-xs sm:text-sm md:text-base text-stone-300 pt-3 sm:pt-4 border-t border-white/10"
          >
            Admin Panel - Kelola menu, pesanan, dan laporan dengan mudah
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
