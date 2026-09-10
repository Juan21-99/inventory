import { Coffee, Truck, Store, CheckCircle, X, Clock } from "lucide-react";

export const getStatusInfo = (status: string, type: string) => {
  switch (status) {
    case "new":
      return {
        label: "Menunggu Pembayaran",
        color: "bg-blue-100 text-blue-700",
        icon: Clock,
      };
    case "processing":
      return {
        label: "Sedang Dibuat",
        color: "bg-amber-100 text-amber-700",
        icon: Coffee,
      };
    case "ready":
      return type === "delivery"
        ? {
            label: "Sedang Diantar 🛵",
            color: "bg-indigo-100 text-indigo-700",
            icon: Truck,
          }
        : {
            label: "Siap Diambil ✅",
            color: "bg-green-100 text-green-700",
            icon: Store,
          };
    case "completed":
      return {
        label: "Selesai",
        color: "bg-stone-100 text-stone-600",
        icon: CheckCircle,
      };
    case "cancelled":
      return {
        label: "Dibatalkan",
        color: "bg-red-100 text-red-700",
        icon: X,
      };
    default:
      return { label: status, color: "bg-stone-100", icon: Clock };
  }
};
