import { Coffee, Store, ChevronDown } from "lucide-react";
import { Order, OrderStatus } from "../types/order.types";
import { STATUS_COLORS, STATUS_LABELS } from "../constants/order.constants";

interface OrderCardProps {
  order: Order;
  isExpanded: boolean;
  onToggleExpand: (orderId: string) => void;
  children?: React.ReactNode; // For OrderDetails component
}

export const OrderCard = ({
  order,
  isExpanded,
  onToggleExpand,
  children,
}: OrderCardProps) => {
  const getStatusColor = (status: OrderStatus): string => {
    return STATUS_COLORS[status] || STATUS_COLORS.cancelled;
  };

  const getStatusLabel = (status: OrderStatus): string => {
    return STATUS_LABELS[status] || status;
  };

  return (
    <div
      className={`relative rounded-[2rem] border transition-all duration-300 overflow-hidden ${
        isExpanded
          ? "border-amber-500/30 bg-stone-900 shadow-[0_20px_40px_-12px_rgba(245,158,11,0.1)] ring-1 ring-amber-500/20"
          : "border-white/5 bg-stone-900/40 hover:bg-stone-900/60 hover:border-white/10"
      }`}
    >
      <button
        type="button"
        className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between cursor-pointer w-full text-left"
        onClick={() => onToggleExpand(order.id)}
        aria-expanded={isExpanded}
        aria-controls={`order-details-${order.id}`}
      >
        <div className="flex items-center gap-5 flex-1">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${
              getStatusColor(order.status).includes("amber")
                ? "bg-amber-500/10 border-amber-500/20 text-amber-500 shadow-lg shadow-amber-500/10"
                : getStatusColor(order.status).includes("emerald")
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-lg shadow-emerald-500/10"
                  : "bg-stone-800 border-white/5 text-stone-400"
            }`}
          >
            <Coffee size={24} strokeWidth={2} />
          </div>

          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <h3 className="font-black text-xl text-white tracking-tight uppercase italic">
                {order.customer_name}
              </h3>
              <span className="text-[10px] font-black tracking-widest text-stone-500 bg-stone-950 px-2 py-1 rounded-lg border border-white/5">
                #{order.id.slice(0, 6)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-stone-500 flex-wrap uppercase tracking-wide">
              <div className="flex items-center gap-1.5 bg-stone-950/50 px-2 py-1 rounded-lg border border-white/5">
                <Store size={12} strokeWidth={2.5} />
                <span>Pickup</span>
              </div>

              <div className="w-1 h-1 rounded-full bg-stone-700" />

              <span>{order.items.length} Item</span>

              <div className="w-1 h-1 rounded-full bg-stone-700" />

              <span className="text-amber-500">
                Rp {order.total_amount.toLocaleString("id-ID")}
              </span>

              <div className="w-1 h-1 rounded-full bg-stone-700" />

              {order.payment_method &&
                ["processing", "ready", "completed"].includes(order.status) && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-black tracking-widest border border-white/5 ${
                      order.payment_method === "cod"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-blue-500/10 text-blue-500"
                    }`}
                  >
                    {order.payment_method === "cod" ? "COD/CASH" : "QRIS"}
                  </span>
                )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-5 w-full md:w-auto justify-between md:justify-end pl-20 md:pl-0">
          <span
            className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-lg backdrop-blur-md ${getStatusColor(order.status)}`}
          >
            {getStatusLabel(order.status)}
          </span>
          <span
            className={`p-2 rounded-full transition-all duration-300 ${isExpanded ? "bg-amber-500 text-stone-950 rotate-180" : "bg-stone-800 text-stone-400 hover:text-white"}`}
          >
            <ChevronDown size={18} strokeWidth={3} />
          </span>
        </div>
      </button>

      {/* Animated Content Expansion */}
      <div
        className={`grid transition-all duration-300 ease-out ${
          isExpanded
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-white/5 bg-stone-950/30">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
