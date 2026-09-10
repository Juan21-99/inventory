"use client";

import { useState, useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Order, DateRangeType, ChartData, DATE_RANGE } from "./constants";
import { calculateDailyRevenue } from "../utils/utils";

interface RevenueChartProps {
  orders: Order[];
}

export function RevenueChart({ orders }: Readonly<RevenueChartProps>) {
  const [dateRange, setDateRange] = useState<DateRangeType>(DATE_RANGE.WEEK);

  const revenueData = useMemo<ChartData[]>(() => {
    if (orders.length === 0) return [];
    return calculateDailyRevenue(orders, dateRange);
  }, [orders, dateRange]);

  return (
    <div className="bg-gradient-to-br from-stone-900 to-stone-800 p-8 rounded-3xl shadow-2xl shadow-stone-900/20 border border-stone-800 text-white flex flex-col flex-1 h-full contain-content">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white">Analisis Pendapatan</h2>
          <p className="text-sm text-stone-400 mt-1">
            Tren penjualan {dateRange === DATE_RANGE.WEEK ? "7" : "30"} hari
            terakhir
          </p>
        </div>

        <fieldset className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/5">
          <legend className="sr-only">Filter rentang waktu</legend>
          <button
            type="button"
            onClick={() => setDateRange(DATE_RANGE.WEEK)}
            aria-pressed={dateRange === DATE_RANGE.WEEK}
            aria-label="Filter 7 hari terakhir"
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              dateRange === DATE_RANGE.WEEK
                ? "text-stone-900 bg-amber-500 shadow-sm"
                : "text-stone-400 hover:text-white"
            }`}
          >
            7 Hari
          </button>
          <button
            type="button"
            onClick={() => setDateRange(DATE_RANGE.MONTH)}
            aria-pressed={dateRange === DATE_RANGE.MONTH}
            aria-label="Filter 30 hari terakhir"
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              dateRange === DATE_RANGE.MONTH
                ? "text-stone-900 bg-amber-500 shadow-sm"
                : "text-stone-400 hover:text-white"
            }`}
          >
            30 Hari
          </button>
        </fieldset>
      </div>

      {/* Chart */}
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={revenueData}
            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
          >
            <defs>
              <linearGradient
                id="colorRevenuePremium"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#44403c"
            />

            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#d6d3d1", fontSize: 11, fontWeight: 500 }}
              dy={15}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#d6d3d1", fontSize: 11, fontWeight: 500 }}
              tickFormatter={(value: number) => `${(value / 1000).toFixed(0)}k`}
              dx={-10}
            />

            <Tooltip
              cursor={{
                stroke: "#f59e0b",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
              contentStyle={{
                backgroundColor: "#1c1917",
                borderRadius: "12px",
                border: "1px solid #44403c",
                padding: "12px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
              }}
              itemStyle={{
                color: "#fbbf24",
                fontWeight: "600",
                fontSize: "12px",
              }}
              labelStyle={{
                color: "#a8a29e",
                marginBottom: "4px",
                fontSize: "10px",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
              // ✅ FIX 3: Handle undefined value
              formatter={(value: number | undefined) => {
                if (value === undefined) return ["Rp 0", "Pendapatan"];
                return [`Rp ${value.toLocaleString("id-ID")}`, "Pendapatan"];
              }}
            />

            {/* ✅ FIX 1: Remove extra 'Q' character */}
            <Area
              type="monotone"
              dataKey="total"
              stroke="#f59e0b"
              strokeWidth={3}
              activeDot={{
                r: 6,
                strokeWidth: 2,
                stroke: "#fff",
                fill: "#f59e0b",
              }}
              fillOpacity={1}
              fill="url(#colorRevenuePremium)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
