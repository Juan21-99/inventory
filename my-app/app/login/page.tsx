"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  ArrowRight,
  Coffee,
  Loader2,
  User,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { DesktopBlocker } from "../components/DesktopBlocker";

const smoothTransition = {
  type: "tween" as const,
  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
  duration: 0.6,
};

export default function LoginPage() {
  const { signIn, signUp, sendPasswordReset, signInWithProvider } = useAuth();
  const [view, setView] = useState<"login" | "register" | "forgot">("login");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (view === "login") {
        await signIn(email, password);
        toast.success("Selamat datang kembali!");
        router.push("/");
      } else if (view === "register") {
        await signUp(email, password, fullName);
        toast.success("Berhasil daftar! Silakan login.");
        setView("login");
      } else if (view === "forgot") {
        await sendPasswordReset(email);
        toast.success("Link reset password telah dikirim ke email kamu!");
        setView("login");
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Terjadi kesalahan";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "apple") => {
    try {
      setLoading(true);
      await signInWithProvider(provider);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal masuk";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-white font-sans flex flex-col overflow-x-hidden">
      <DesktopBlocker />
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
          <motion.h1
            layout="position"
            className="text-4xl font-black tracking-tighter mb-3"
          >
            ALIN.<span className="text-amber-400">CO</span>
          </motion.h1>
          <div className="h-14">
            {" "}
            {/* Fixed height to prevent jump */}
            <AnimatePresence mode="wait">
              <motion.p
                key={view}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3 }}
                className="text-stone-400 font-medium text-lg leading-tight"
              >
                {view === "login" && "Masuk untuk melanjutkan pesananmu."}
                {view === "register" &&
                  "Daftar sekarang dan nikmati kemudahannya."}
                {view === "forgot" &&
                  "Jangan khawatir, kami bantu akses akunmu."}
              </motion.p>
            </AnimatePresence>
          </div>
        </header>

        {/* Auth Form */}
        <motion.form
          layout
          onSubmit={handleSubmit}
          className="space-y-6 flex-1"
        >
          <AnimatePresence mode="popLayout">
            {view === "register" && (
              <motion.div
                key="name-field"
                layout
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={smoothTransition}
                className="space-y-2 origin-top"
              >
                <label
                  htmlFor="full-name"
                  className="text-xs font-bold text-stone-500 uppercase tracking-[0.2em] ml-1"
                >
                  Nama Lengkap
                </label>
                <div className="relative">
                  <input
                    id="full-name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Input nama kamu"
                    className="w-full bg-stone-900/30 border border-white/5 rounded-2xl py-4 px-6 text-white placeholder:text-stone-700 focus:bg-stone-900/50 focus:border-amber-500/30 outline-none transition-all text-base font-medium"
                  />
                  <User className="absolute right-5 top-1/2 -translate-y-1/2 text-stone-700 w-5 h-5 pointer-events-none" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            layout
            transition={smoothTransition}
            className="space-y-2"
          >
            <label
              htmlFor="email"
              className="text-xs font-bold text-stone-500 uppercase tracking-[0.2em] ml-1"
            >
              Email
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full bg-stone-900/30 border border-white/5 rounded-2xl py-4 px-6 text-white placeholder:text-stone-700 focus:bg-stone-900/50 focus:border-amber-500/30 outline-none transition-all text-base font-medium"
              />
              <Mail className="absolute right-5 top-1/2 -translate-y-1/2 text-stone-700 w-5 h-5 pointer-events-none" />
            </div>
          </motion.div>

          <AnimatePresence mode="popLayout">
            {view !== "forgot" && (
              <motion.div
                key="password-field"
                layout
                transition={smoothTransition}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 overflow-hidden"
              >
                <div className="flex justify-between items-center ml-1">
                  <label
                    htmlFor="password"
                    title="password"
                    className="text-xs font-bold text-stone-500 uppercase tracking-[0.2em]"
                  >
                    Password
                  </label>
                  {view === "login" && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      type="button"
                      onClick={() => setView("forgot")}
                      className="text-xs font-bold text-amber-500/80 uppercase"
                    >
                      Lupa?
                    </motion.button>
                  )}
                </div>
                <div className="relative">
                  <input
                    id="password"
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
            )}
          </AnimatePresence>

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
              <AnimatePresence mode="wait">
                <motion.div
                  key={view}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  className="flex items-center justify-center gap-3 w-full"
                >
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                    {view === "login" && "Masuk Sekarang"}
                    {view === "register" && "Daftar Akun"}
                    {view === "forgot" && "Kirim Link Reset"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
              </AnimatePresence>
            )}
          </motion.button>
        </motion.form>

        {/* Footer Actions */}
        <motion.footer
          layout
          transition={smoothTransition}
          className="mt-10 space-y-6"
        >
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-900"></div>
            </div>
            <span className="relative px-4 bg-stone-950 text-[10px] font-bold text-stone-600 uppercase tracking-[0.3em]">
              Atau masuk dengan
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleSocialLogin("google")}
              disabled={loading}
              className="flex items-center justify-center gap-3 bg-white/[0.03] border border-white/5 text-stone-400 py-4 rounded-2xl transition-all active:scale-95 hover:bg-white/[0.07] hover:text-white group disabled:opacity-50"
            >
              <svg
                className="w-5 h-5 opacity-80 group-hover:opacity-100 transition-opacity"
                viewBox="0 0 24 24"
              >
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-xs font-black uppercase tracking-widest">
                Google
              </span>
            </button>
            <button
              onClick={() => handleSocialLogin("apple")}
              disabled={loading}
              className="flex items-center justify-center gap-3 bg-white/[0.03] border border-white/5 text-stone-400 py-4 rounded-2xl transition-all active:scale-95 hover:bg-white/[0.07] hover:text-white group disabled:opacity-50"
            >
              <svg
                className="w-5 h-5 opacity-80 group-hover:opacity-100 transition-opacity"
                viewBox="0 0 384 512"
              >
                <path
                  fill="currentColor"
                  d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"
                />
              </svg>
              <span className="text-xs font-black uppercase tracking-widest">
                Apple
              </span>
            </button>
          </div>

          <div className="text-center pt-4">
            <AnimatePresence mode="wait">
              {view === "forgot" ? (
                <motion.button
                  key="back-login"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  onClick={() => setView("login")}
                  className="text-amber-400 text-sm font-bold uppercase tracking-widest border border-amber-400/20 px-6 py-2 rounded-full"
                >
                  Kembali ke Login
                </motion.button>
              ) : (
                <motion.button
                  key="toggle-auth"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  onClick={() =>
                    setView(view === "login" ? "register" : "login")
                  }
                  className="text-stone-500 text-sm font-medium w-full"
                >
                  {view === "login" ? (
                    <>
                      Belum punya akun?{" "}
                      <span className="text-amber-400 font-bold ml-1">
                        Daftar Sekarang
                      </span>
                    </>
                  ) : (
                    <>
                      Sudah punya akun?{" "}
                      <span className="text-amber-400 font-bold ml-1">
                        Masuk Disini
                      </span>
                    </>
                  )}
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.footer>
      </div>
      <footer className="mt-10 text-center">
        <p className="text-[10px] font-black text-stone-800 uppercase tracking-[0.5em] select-none">
          ALIN CREATIVE STUDIO
        </p>
      </footer>
    </div>
  );
}
