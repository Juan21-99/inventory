"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  Users,
  Search,
  Loader2,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  TrendingUp,
  LayoutGrid,
  List,
} from "lucide-react";
import { StatCard } from "../../customer/components/StatCard";
import { ANIMATION } from "../../customer/components/constants";

// Types
interface CustomerProfile {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: string;
  created_at?: string;
}

interface CustomerStats {
  totalOrders: number;
  totalSpend: number;
  lastOrderDate: string | null;
}

interface Customer extends CustomerProfile, CustomerStats {}

// Security Helpers
const sanitizeEmail = (email: string): string => {
  return email.replaceAll(/[^a-zA-Z0-9@.\-_]/g, "");
};

const sanitizePhone = (phone: string): string => {
  return phone.replaceAll(/\D/g, "");
};

const isValidImageUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      (parsed.hostname.includes("supabase.co") ||
        parsed.hostname.includes("supabase"))
    );
  } catch {
    return false;
  }
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Customer;
    direction: "asc" | "desc";
  }>({ key: "totalSpend", direction: "desc" });

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Fetch Profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "customer");

      if (profilesError) throw profilesError;

      // 2. Fetch Orders
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("user_id, total_amount, created_at, status")
        .neq("status", "cancelled");

      if (ordersError) throw ordersError;

      // 3. Process Data
      const processedCustomers: Customer[] = (profiles || []).map((profile) => {
        const userOrders =
          orders?.filter((o) => o.user_id === profile.id) || [];

        const totalOrders = userOrders.length;
        const totalSpend = userOrders.reduce(
          (sum, order) => sum + (order.total_amount || 0),
          0,
        );

        // Find last order date
        const lastOrder = userOrders.toSorted(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )[0];

        return {
          ...profile,
          totalOrders,
          totalSpend,
          lastOrderDate: lastOrder ? lastOrder.created_at : null,
        };
      });

      setCustomers(processedCustomers);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Sorting Logic
  const handleSort = (key: keyof Customer) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "desc" ? "asc" : "desc",
    }));
  };

  const sortedCustomers = [...customers]
    .filter(
      (c) =>
        c.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone?.includes(searchQuery),
    )
    .sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      const comparison = aValue > bValue ? 1 : -1;
      return sortConfig.direction === "asc" ? comparison : -comparison;
    });

  // Action Handlers (SECURE)
  const handleEmailClick = (e: React.MouseEvent, email: string | null) => {
    e.stopPropagation();
    if (!email) {
      alert("Email tidak tersedia");
      return;
    }

    const sanitized = sanitizeEmail(email);
    if (!sanitized.includes("@")) {
      alert("Format email tidak valid");
      return;
    }

    globalThis.location.href = `mailto:${sanitized}`;
  };

  const handleWhatsAppClick = (e: React.MouseEvent, phone: string | null) => {
    e.stopPropagation();
    if (!phone) {
      alert("Nomor telepon tidak tersedia");
      return;
    }

    let formattedPhone = sanitizePhone(phone);

    if (formattedPhone.length < 10 || formattedPhone.length > 15) {
      alert("Format nomor telepon tidak valid");
      return;
    }

    if (formattedPhone.startsWith("0")) {
      formattedPhone = "62" + formattedPhone.slice(1);
    }

    globalThis.open(
      `https://wa.me/${formattedPhone}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <div className="px-6 pt-2 pb-32 max-w-7xl mx-auto">
      {/* Header Toolbar */}
      <div className="bg-stone-900/60 backdrop-blur-xl p-4 rounded-[2rem] shadow-sm border border-white/5 mb-8 sticky top-2 z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            <div className="relative group w-full flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 group-focus-within:text-amber-500 transition-colors"
                size={18}
              />
              <input
                type="text"
                placeholder="Cari nama, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-stone-950 border border-white/5 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 transition-all outline-none font-medium text-white placeholder:text-stone-600 shadow-inner"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex bg-stone-950 border border-white/5 rounded-xl p-1 gap-1">
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all cursor-pointer ${
                    viewMode === "list"
                      ? "bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/20"
                      : "text-stone-600 hover:text-white hover:bg-white/10 active:text-white active:bg-white/5"
                  }`}
                >
                  <List size={18} strokeWidth={viewMode === "list" ? 2.5 : 2} />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/20"
                      : "text-stone-600 hover:text-white hover:bg-white/10 active:text-white active:bg-white/5"
                  }`}
                >
                  <LayoutGrid
                    size={18}
                    strokeWidth={viewMode === "grid" ? 2.5 : 2}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          label="Total Pelanggan"
          value={customers.length.toString()}
          numericValue={customers.length}
          duration={ANIMATION.STEP_DURATION}
          animationType="step"
          icon={Users}
          trend="Aktif"
          index={0}
        />
        <StatCard
          label="Total Transaksi"
          value={`Rp ${customers
            .reduce((sum, c) => sum + c.totalSpend, 0)
            .toLocaleString("id-ID")}`}
          numericValue={customers.reduce((sum, c) => sum + c.totalSpend, 0)}
          prefix="Rp "
          duration={ANIMATION.SMOOTH_DURATION}
          animationType="smooth"
          icon={TrendingUp}
          trend="Lifetime"
          index={1}
        />
        <StatCard
          label="Rata-rata Belanja"
          value={`Rp ${
            customers.length > 0
              ? Math.round(
                  customers.reduce((sum, c) => sum + c.totalSpend, 0) /
                    customers.length,
                ).toLocaleString("id-ID")
              : "0"
          }`}
          numericValue={
            customers.length > 0
              ? Math.round(
                  customers.reduce((sum, c) => sum + c.totalSpend, 0) /
                    customers.length,
                )
              : 0
          }
          prefix="Rp "
          duration={ANIMATION.SMOOTH_DURATION}
          animationType="smooth"
          icon={ShoppingBag}
          trend="Per User"
          index={2}
        />
      </div>

      {/* Content Switcher */}
      {viewMode === "list" ? (
        <div className="bg-stone-900/50 backdrop-blur-md rounded-[2.5rem] border border-white/5 overflow-hidden shadow-xl">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
              <p className="text-stone-500 text-xs font-bold uppercase tracking-widest">
                Mengambil Data...
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="p-6 text-[10px] font-black text-stone-500 uppercase tracking-[0.2em]">
                      Pelanggan
                    </th>
                    <th className="p-6 text-[10px] font-black text-stone-500 uppercase tracking-[0.2em]">
                      Kontak
                    </th>
                    <th
                      className="p-6 text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] cursor-pointer active:text-amber-500 transition-colors"
                      onClick={() => handleSort("totalOrders")}
                    >
                      Total Order
                    </th>
                    <th
                      className="p-6 text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] cursor-pointer active:text-amber-500 transition-colors"
                      onClick={() => handleSort("totalSpend")}
                    >
                      Total Belanja
                    </th>
                    <th className="p-6 text-[10px] font-black text-stone-500 uppercase tracking-[0.2em]">
                      Tanggal Bergabung
                    </th>
                    <th className="p-6 text-right text-[10px] font-black text-stone-500 uppercase tracking-[0.2em]">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sortedCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="active:bg-white/[0.02] transition-colors group"
                    >
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center shadow-inner transition-colors ${
                              customer.avatar_url &&
                              isValidImageUrl(customer.avatar_url)
                                ? "bg-stone-950 border border-white/10"
                                : "bg-amber-500/10 border border-amber-500/20"
                            }`}
                          >
                            {customer.avatar_url &&
                            isValidImageUrl(customer.avatar_url) ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={customer.avatar_url}
                                alt={customer.full_name || "Avatar"}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <span className="text-amber-500 font-bold text-lg">
                                {customer.full_name?.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm">
                              {customer.full_name}
                            </div>
                            <div className="text-[10px] text-stone-500 font-medium uppercase tracking-wider mt-0.5">
                              {customer.role}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="space-y-1">
                          {customer.email && (
                            <button
                              onClick={(e) =>
                                handleEmailClick(e, customer.email)
                              }
                              className="flex items-center gap-2 text-xs text-stone-400 hover:text-white transition-colors cursor-pointer"
                            >
                              <Mail size={12} />
                              {customer.email}
                            </button>
                          )}
                          {customer.phone && (
                            <button
                              onClick={(e) =>
                                handleWhatsAppClick(e, customer.phone)
                              }
                              className="flex items-center gap-2 text-xs text-stone-400 hover:text-emerald-400 active:text-emerald-500 transition-colors cursor-pointer"
                            >
                              <Phone size={12} />
                              {customer.phone}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="inline-flex px-3 py-1 rounded-lg bg-stone-800 border border-white/5 text-xs font-bold text-white">
                          {customer.totalOrders} Pesanan
                        </div>
                      </td>
                      <td className="p-6">
                        <span className="font-black text-amber-500 tracking-tight">
                          Rp {customer.totalSpend.toLocaleString("id-ID")}
                        </span>
                      </td>
                      <td className="p-6">
                        {customer.created_at ? (
                          <div className="flex items-center gap-2 text-xs text-stone-400">
                            <Calendar size={12} />
                            {new Date(customer.created_at).toLocaleDateString(
                              "id-ID",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </div>
                        ) : (
                          <span className="text-stone-600 text-[10px] italic">
                            -
                          </span>
                        )}
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={(e) => handleEmailClick(e, customer.email)}
                            className="p-2 hover:bg-stone-700 active:bg-stone-800 rounded-lg text-stone-400 hover:text-white active:text-white transition-colors cursor-pointer"
                            title="Kirim Email"
                          >
                            <Mail size={18} />
                          </button>
                          <button
                            onClick={(e) =>
                              handleWhatsAppClick(e, customer.phone)
                            }
                            className="p-2 hover:bg-stone-700 active:bg-stone-800 rounded-lg text-stone-400 hover:text-emerald-400 active:text-emerald-500 transition-colors cursor-pointer"
                            title="Chat WhatsApp"
                          >
                            <Phone size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedCustomers.map((customer) => (
            <div
              key={customer.id}
              className="relative rounded-[2rem] border border-white/5 bg-stone-900/40 active:bg-stone-900/60 active:border-amber-500/30 active:shadow-2xl active:shadow-amber-500/5 transition-all duration-500 overflow-hidden group p-6 flex flex-col items-center text-center"
            >
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-active:opacity-100 transition-opacity" />

              <div
                className={`w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center mb-4 relative z-10 shadow-xl group-active:scale-110 group-active:rotate-3 transition-all duration-300 ${
                  customer.avatar_url && isValidImageUrl(customer.avatar_url)
                    ? "bg-stone-800 border-2 border-white/5"
                    : "bg-amber-500/10 border-2 border-amber-500/20"
                }`}
              >
                {customer.avatar_url && isValidImageUrl(customer.avatar_url) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={customer.avatar_url}
                    alt={customer.full_name || "Avatar"}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-amber-500 font-bold text-xl">
                    {customer.full_name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <h3 className="font-black text-white text-lg tracking-tight mb-1 relative z-10">
                {customer.full_name}
              </h3>
              <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-6 relative z-10 bg-stone-950 px-3 py-1 rounded-full border border-white/5">
                {customer.role}
              </p>

              <div className="grid grid-cols-2 gap-3 w-full mb-6 relative z-10">
                <div className="bg-stone-950/50 rounded-2xl p-3 border border-white/5">
                  <p className="text-[10px] text-stone-500 font-bold uppercase mb-1">
                    Order
                  </p>
                  <p className="text-white font-bold">{customer.totalOrders}</p>
                </div>
                <div className="bg-stone-950/50 rounded-2xl p-3 border border-white/5">
                  <p className="text-[10px] text-stone-500 font-bold uppercase mb-1">
                    Total
                  </p>
                  <p className="text-amber-500 font-bold text-xs truncate">
                    {customer.totalSpend >= 1000
                      ? `${(customer.totalSpend / 1000).toFixed(1)}k`
                      : customer.totalSpend.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 w-full pt-4 border-t border-white/5 relative z-10">
                <button
                  onClick={(e) => handleEmailClick(e, customer.email)}
                  className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 active:bg-amber-500 hover:text-white active:text-stone-950 text-stone-200 transition-all duration-300 transform hover:scale-105 active:scale-105 cursor-pointer"
                  title="Kirim Email"
                >
                  <Mail size={16} strokeWidth={2.5} />
                </button>
                <button
                  onClick={(e) => handleWhatsAppClick(e, customer.phone)}
                  className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 active:bg-emerald-500 hover:text-emerald-400 active:text-white text-stone-200 transition-all duration-300 transform hover:scale-105 active:scale-105 cursor-pointer"
                  title="Chat WhatsApp"
                >
                  <Phone size={16} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
