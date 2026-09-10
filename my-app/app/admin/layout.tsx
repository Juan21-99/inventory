"use client";

import { useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import AdminSidebar from "./components/Sidebar";
import Header from "./components/Header";
import PageLoading from "@/app/components/ui/PageLoading";
import { ArrowLeft, Monitor, Smartphone } from "lucide-react";
import Link from "next/link";

const LOGIN_PATH = "/admin/login";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = useMemo(() => pathname === LOGIN_PATH, [pathname]);

  useEffect(() => {
    if (!loading) {
      if (!user && !isLoginPage) {
        router.push(LOGIN_PATH);
      } else if (user && profile && profile.role !== "admin" && !isLoginPage) {
        // Logged in but not an admin -> kick to home
        router.push("/");
      }
    }
  }, [user, profile, loading, isLoginPage, router]);

  if (loading) {
    return <PageLoading isOpen={true} message="Memuat..." />;
  }

  if (isLoginPage) {
    return (
      <>
        {/* --- MOBILE BLOCKER (Width + Height Check) --- */}
        <div className="admin-blocker fixed inset-0 z-[9999] bg-stone-950 text-white flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
          <div className="relative mb-8">
            <Monitor className="text-stone-700 w-32 h-32" strokeWidth={1} />
            <div className="absolute -bottom-2 -right-2 bg-stone-800 p-2 rounded-full border-4 border-stone-950">
              <Smartphone className="text-amber-500 w-8 h-8 animate-pulse" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">
            Desktop / Tablet Only
          </h1>
          <p className="text-stone-400 mb-8 max-w-xs leading-relaxed">
            Admin Dashboard butuh layar luas.
            <br />
            Silakan buka di <strong>Laptop, PC, atau Tablet</strong>.
          </p>
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 bg-white text-stone-950 rounded-full font-bold text-sm hover:bg-stone-200 transition-colors active:scale-95"
          >
            <ArrowLeft size={16} /> Kembali ke Menu
          </Link>
        </div>

        {/* LOGIN CONTENT (Desktop Only) */}
        <div className="admin-content min-h-screen w-full">{children}</div>
      </>
    );
  }

  if (!user) {
    return (
      <PageLoading isOpen={true} message="Mengalihkan ke halaman login..." />
    );
  }

  return (
    <>
      {/* --- MOBILE BLOCKER (Width + Height Check) --- */}
      <div className="admin-blocker fixed inset-0 z-[9999] bg-stone-950 text-white flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
        <div className="relative mb-8">
          <Monitor className="text-stone-700 w-32 h-32" strokeWidth={1} />
          <div className="absolute -bottom-2 -right-2 bg-stone-800 p-2 rounded-full border-4 border-stone-950">
            <Smartphone className="text-amber-500 w-8 h-8 animate-pulse" />
          </div>
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">
          Desktop / Tablet Only
        </h1>
        <p className="text-stone-400 mb-8 max-w-xs leading-relaxed">
          Admin Dashboard butuh layar luas.
          <br />
          Silakan buka di <strong>Laptop, PC, atau Tablet</strong>.
        </p>
        <Link
          href="/"
          className="flex items-center gap-2 px-6 py-3 bg-white text-stone-950 rounded-full font-bold text-sm hover:bg-stone-200 transition-colors active:scale-95"
        >
          <ArrowLeft size={16} /> Kembali ke Menu
        </Link>
      </div>

      {/* --- DESKTOP CONTENT (Valid Screen Only) --- */}
      <div className="admin-content h-screen bg-stone-950 hidden">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header />
          <main
            className="flex-1 overflow-y-auto scroll-smooth"
            role="main"
            aria-label="Konten admin"
          >
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
