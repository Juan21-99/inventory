import { OrderItem } from "../types/delivery.types";

interface DeliveryItemsProps {
  items: OrderItem[];
}

export const DeliveryItems = ({ items }: DeliveryItemsProps) => {
  return (
    <div className="space-y-3 mb-6 border-b border-white/5 pb-6">
      {items.slice(0, 2).map((item) => (
        <div
          key={item.id}
          className="flex justify-between text-sm group items-start"
        >
          <div className="flex flex-col">
            <span className="text-stone-400 group-hover:text-white transition-colors">
              <span className="font-black text-amber-500 mr-2">
                {item.quantity}x
              </span>
              {item.name}
            </span>
            {item.note && (
              <span className="text-[10px] text-stone-500 italic ml-6 mt-0.5">
                &ldquo;{item.note}&rdquo;
              </span>
            )}
          </div>
          <span className="font-bold text-stone-200 font-mono text-xs whitespace-nowrap ml-2">
            Rp {(item.price * item.quantity).toLocaleString("id-ID")}
          </span>
        </div>
      ))}
      {items.length > 2 && (
        <p className="text-[10px] text-stone-500 italic font-medium">
          + {items.length - 2} item lainnya
        </p>
      )}
    </div>
  );
};
