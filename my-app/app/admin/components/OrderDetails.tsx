import { OrderItem } from "../types/order.types";
import { ShoppingBag, Clock } from "lucide-react"; // Added ShoppingBag and Clock imports

interface OrderDetailsProps {
  orderId: string;
  items: OrderItem[];
  total_amount: number;
  created_at: string | undefined;
  formatDate: (dateString: string | undefined) => string;
  children: React.ReactNode; // For action buttons
}

export const OrderDetails = ({
  orderId,
  items,
  total_amount,
  created_at,
  formatDate,
  children,
}: OrderDetailsProps) => {
  return (
    <section
      id={`order-details-${orderId}`}
      className="px-6 pb-6 pt-4 animate-in slide-in-from-top-2 duration-300"
      aria-label={`Detail pesanan ${orderId}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Order Items */}
        <div>
          <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <ShoppingBag
              size={14}
              className="text-stone-500"
              strokeWidth={2.5}
            />
            Detail Pesanan
          </h4>
          <div className="space-y-4 bg-stone-950/50 p-5 rounded-2xl border border-white/5">
            {items.map((item, idx) => (
              <div
                key={`${orderId}-${item.id}-${idx}`}
                className="flex justify-between text-sm group"
              >
                <div className="flex gap-4">
                  <span className="font-black text-amber-500 w-6">
                    {item.quantity}x
                  </span>
                  <div className="flex flex-col">
                    <span className="text-white font-bold tracking-wide group-hover:text-amber-500 transition-colors">
                      {item.name}
                    </span>
                    {item.note && (
                      <span className="text-[10px] text-stone-500 italic mt-0.5">
                        &ldquo;{item.note}&rdquo;
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-stone-500 font-mono text-xs">
                  Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                </span>
              </div>
            ))}
            <div className="border-t border-white/10 pt-4 flex justify-between font-black text-white mt-2 text-base">
              <span className="text-stone-500 text-xs uppercase tracking-widest font-bold self-center">
                Total
              </span>
              <span>Rp {total_amount.toLocaleString("id-ID")}</span>
            </div>
          </div>
        </div>

        {/* Time & Actions */}
        <div className="flex flex-col justify-between h-full bg-stone-950/30 rounded-2xl p-5 border border-white/5">
          <div>
            <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <Clock size={14} className="text-stone-500" strokeWidth={2.5} />{" "}
              Waktu Pesanan
            </h4>
            <div className="bg-stone-950 p-4 rounded-xl border border-white/5 inline-block">
              <p className="text-sm font-bold text-white tracking-wide">
                {formatDate(created_at)}
              </p>
            </div>
          </div>

          <div className="mt-8">{children}</div>
        </div>
      </div>
    </section>
  );
};
