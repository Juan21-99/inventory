import { OrderStatus } from "../types/order.types";

export const STATUS_LABELS: Record<OrderStatus, string> = {
  new: "Baru",
  processing: "Diproses",
  ready: "Siap Diambil",
  completed: "Selesai",
  cancelled: "Batal",
} as const;

export const STATUS_SUCCESS_MESSAGES: Partial<Record<OrderStatus, string>> = {
  processing: "Pesanan sedang diproses",
  ready: "Pesanan siap diambil",
  completed: "Pesanan selesai",
};

export const STATUS_COLORS: Record<OrderStatus, string> = {
  new: "bg-blue-100 text-blue-700 border-blue-200",
  processing: "bg-amber-100 text-amber-700 border-amber-200",
  ready: "bg-purple-100 text-purple-700 border-purple-200",
  completed: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

export const CANCELLATION_REASONS = [
  "Stok habis mendadak",
  "Tidak bisa memenuhi pesanan",
  "Customer tidak merespon",
  "Kesalahan sistem",
  "Alasan lainnya",
] as const;
