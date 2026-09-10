import { Truck } from "lucide-react";
import { OrderStatus } from "../types/delivery.types";

interface DeliveryCardHeaderProps {
  orderId: string;
  customer_name: string;
  status: OrderStatus;
  paymentMethod?: string;
  getStatusColor: (status: OrderStatus) => string;
  getStatusLabel: (status: OrderStatus) => string;
}

export const DeliveryCardHeader = ({
  orderId,
  customer_name,
  status,
  paymentMethod,
  getStatusColor,
  getStatusLabel,
}: DeliveryCardHeaderProps) => {
  return (
    <div className="flex justify-between items-start mb-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
          <Truck size={22} strokeWidth={2.5} />
        </div>
        <div>
          <h3 className="font-black text-white text-lg tracking-tight uppercase italic">
            {customer_name}
          </h3>
          <p className="text-[10px] font-bold text-stone-500 font-mono tracking-widest bg-stone-950 px-2 py-1 rounded-lg border border-white/5 inline-block mt-1">
            #{orderId.slice(0, 6)}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <span
          className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-lg ${getStatusColor(status)}`}
        >
          {getStatusLabel(status)}
        </span>
        {paymentMethod &&
          ["processing", "ready", "completed"].includes(status) && (
            <span
              className={`px-2 py-1 rounded-lg text-[9px] uppercase font-black tracking-widest border border-white/5 ${
                paymentMethod === "cod"
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-blue-500/10 text-blue-500"
              }`}
            >
              {paymentMethod === "cod" ? "COD/CASH" : "QRIS"}
            </span>
          )}
      </div>
    </div>
  );
};
