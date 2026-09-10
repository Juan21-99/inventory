import { Truck } from "lucide-react";
import { Order, OrderStatus } from "../types/delivery.types";
import { DeliveryCard } from "./DeliveryCard";
import { DeliverySkeleton } from "./DeliverySkeleton";

interface DeliveryListProps {
  orders: Order[];
  loading: boolean;
  updatingOrder: string | null;
  getStatusColor: (status: OrderStatus) => string;
  getStatusLabel: (status: OrderStatus) => string;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onCancel: (orderId: string) => void;
}

export const DeliveryList = ({
  orders,
  loading,
  updatingOrder,
  getStatusColor,
  getStatusLabel,
  onUpdateStatus,
  onCancel,
}: DeliveryListProps) => {
  if (loading) {
    return (
      <output
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 block"
        aria-busy="true"
      >
        {[1, 2, 3, 4, 5, 6].map((id) => (
          <DeliverySkeleton key={id} />
        ))}
      </output>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-stone-900/40 rounded-[2.5rem] border border-dashed border-white/5 mx-auto max-w-2xl w-full">
        <div className="w-16 h-16 bg-stone-900 rounded-[1.5rem] flex items-center justify-center mb-6 border border-white/5 shadow-[0_0_30px_-10px_rgba(245,158,11,0.3)]">
          <Truck className="text-amber-500" size={32} strokeWidth={1.5} />
        </div>
        <p className="text-white font-black uppercase tracking-widest text-sm mb-1">
          Tidak ada pengiriman
        </p>
        <p className="text-stone-500 text-xs font-bold">
          Pesanan delivery akan muncul di sini
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {orders.map((order) => (
        <DeliveryCard
          key={order.id}
          order={order}
          isUpdating={updatingOrder === order.id}
          getStatusColor={getStatusColor}
          getStatusLabel={getStatusLabel}
          onUpdateStatus={onUpdateStatus}
          onCancel={onCancel}
        />
      ))}
    </div>
  );
};
