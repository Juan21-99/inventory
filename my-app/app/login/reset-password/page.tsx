"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  ArrowRight,
  Coffee,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const smoothTransition = {
  type: "tween" as const,
  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
  duration: 0.6,
};

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Password tidak cocok!");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setSuccess(true);
      toast.success("Password berhasil diperbarui!");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Terjadi kesalahan";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-white font-sans flex flex-col overflow-x-hidden">
      {/* Top Decoration */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-amber-600/10 to-transparent pointer-events-none" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-8 pt-16 pb-10 relative z-10 w-full max-w-xl mx-auto">
        {/* Branding Area */}
        <header className="mb-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-16 h-16 bg-amber-500 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-amber-500/20"
          >
            <Coffee className="text-stone-950 w-8 h-8" strokeWidth={2.5} />
          </motion.div>

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success-header"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6">
                  <CheckCircle2 className="text-green-500 w-10 h-10" />
                </div>
                <h1 className="text-3xl font-black tracking-tighter mb-3 text-green-500">
                  Berhasil!
                </h1>
                <p className="text-stone-400 font-medium text-lg leading-tight">
                  Password kamu sudah diperbarui. Mengalihkan ke halaman
                  login...
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="reset-header"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <h1 className="text-4xl font-black tracking-tighter mb-3">
                  Password <span className="text-amber-400">Baru</span>
                </h1>
                <p className="text-stone-400 font-medium text-lg leading-tight">
                  Silakan buat password baru yang aman untuk akunmu.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {!success && (
          <motion.form
            layout
            onSubmit={handleSubmit}
            className="space-y-6 flex-1"
          >
            <motion.div
              layout
              transition={smoothTransition}
              className="space-y-2"
            >
              <label
                htmlFor="new-password"
                title="password"
                className="text-xs font-bold text-stone-500 uppercase tracking-[0.2em] ml-1"
              >
                Password Baru
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-stone-900/30 border border-white/5 rounded-2xl py-4 px-6 text-white placeholder:text-stone-700 focus:bg-stone-900/50 focus:border-amber-500/30 outline-none transition-all text-base font-medium"
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6">
                  <AnimatePresence mode="wait" initial={false}>
                    {password.length > 0 ? (
                      <motion.button
                        key="eye-icon"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
                        transition={{ duration: 0.2 }}
                        className="text-amber-400 hover:text-amber-300 focus:outline-none touch-manipulation"
                      >
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </motion.button>
                    ) : (
                      <motion.div
                        key="lock-icon"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Lock className="text-stone-700 w-5 h-5 pointer-events-none" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            <motion.div
              layout
              transition={smoothTransition}
              className="space-y-2"
            >
              <label
                htmlFor="confirm-password"
                title="confirm-password"
                className="text-xs font-bold text-stone-500 uppercase tracking-[0.2em] ml-1"
              >
                Konfirmasi Password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-stone-900/30 border border-white/5 rounded-2xl py-4 px-6 text-white placeholder:text-stone-700 focus:bg-stone-900/50 focus:border-amber-500/30 outline-none transition-all text-base font-medium"
                />
                <Lock className="absolute right-5 top-1/2 -translate-y-1/2 text-stone-700 w-5 h-5 pointer-events-none" />
              </div>
            </motion.div>

            <motion.button
              layout
              transition={smoothTransition}
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-black py-4.5 rounded-2xl shadow-xl shadow-amber-500/10 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 mt-8 relative"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-stone-950" />
              ) : (
                <div className="flex items-center justify-center gap-3 w-full">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                    Update Password
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </motion.button>
          </motion.form>
        )}

        <footer className="mt-10 text-center">
          <p className="text-[10px] font-black text-stone-800 uppercase tracking-[0.5em] select-none">
            ALIN CREATIVE STUDIO
          </p>
        </footer>
      </div>
    </div>
  );
}
