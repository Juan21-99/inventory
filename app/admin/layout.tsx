"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import AdminSidebar from "./components/Sidebar";
import Header from "./components/Header";
import PageLoading from "@/app/components/ui/PageLoading";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return <PageLoading isOpen={true} message="Memuat panel inventaris..." />;
  }

  if (!user) {
    return (
      <PageLoading
        isOpen={true}
        message="Mengalihkan ke halaman login..."
      />
    );
  }

  return (
    <div className="h-screen w-full bg-stone-50 dark:bg-stone-950 flex overflow-hidden text-stone-900 dark:text-stone-100 font-sans selection:bg-stone-200 dark:selection:bg-stone-800 selection:text-stone-900 dark:selection:text-white transition-colors duration-200">
      {/* Sidebar Navigation */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main
          className="flex-1 overflow-y-auto scroll-smooth p-6 sm:p-8"
          role="main"
          aria-label="Konten Admin"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
