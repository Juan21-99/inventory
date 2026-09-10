"use client";

import { ShoppingBag, Coffee, TrendingUp, Clock } from "lucide-react";
import { useDashboardData } from "./hooks/useDashboardData";
import { StatCard } from "../customer/components/StatCard";
import { RevenueChart } from "../customer/components/RevenueChart";
import { ANIMATION } from "../customer/components/constants";

import { motion } from "framer-motion";

export default function AdminDashboard() {
  const { stats, allOrders } = useDashboardData();

  return (
    <div className="p-6 h-full flex flex-col gap-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        <StatCard
          label="Pendapatan Hari Ini"
          value={`Rp ${stats.totalRevenue.toLocaleString("id-ID")}`}
          numericValue={stats.totalRevenue}
          prefix="Rp "
          duration={ANIMATION.SMOOTH_DURATION}
          animationType="smooth"
          icon={TrendingUp}
          trend="Hari Ini"
          index={0}
        />

        <StatCard
          label="Pesanan Hari Ini"
          value={stats.ordersToday.toString()}
          numericValue={stats.ordersToday}
          duration={ANIMATION.STEP_DURATION}
          animationType="step"
          icon={ShoppingBag}
          trend={stats.ordersToday > 0 ? "Aktif" : undefined}
          index={1}
          centerValue={true}
        />

        <StatCard
          label="Menunggu Aksi"
          value={stats.pendingOrders.toString()}
          numericValue={stats.pendingOrders}
          duration={ANIMATION.STEP_DURATION}
          animationType="step"
          icon={Clock}
          trend={stats.pendingOrders > 0 ? "Baru" : "Aman"}
          index={2}
          centerValue={true}
        />

        <StatCard
          label="Menu Aktif"
          value={stats.activeMenu.toString()}
          numericValue={stats.activeMenu}
          duration={ANIMATION.STEP_DURATION}
          animationType="step"
          icon={Coffee}
          trend="Siap Jual"
          index={3}
          centerValue={true}
        />
      </div>

      {/* Chart Area - Takes remaining space */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          delay: 0.4,
        }}
        className="flex-1 min-h-0 w-full contain-content"
      >
        <RevenueChart orders={allOrders} />
      </motion.div>
    </div>
  );
}
