import { OrderStatus } from "../types/delivery.types";

export const DELIVERY_STATUS_LABELS: Record<OrderStatus, string> = {
  new: "Perlu Konfirmasi",
  processing: "Sedang Disiapkan",
  ready: "Sedang Diantar",
  completed: "Selesai",
  cancelled: "Dibatalkan",
} as const;

export const DELIVERY_STATUS_COLORS: Record<OrderStatus, string> = {
  new: "bg-blue-100 text-blue-700",
  processing: "bg-amber-100 text-amber-700",
  ready: "bg-indigo-100 text-indigo-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export const DELIVERY_STATUS_SUCCESS_MESSAGES: Partial<
  Record<OrderStatus, string>
> = {
  processing: "Pesanan sedang disiapkan",
  ready: "Pesanan dalam pengiriman",
  completed: "Pesanan telah diterima",
};
