import { MapPin, Phone } from "lucide-react";

interface DeliveryAddressProps {
  address?: string;
  customer_phone?: string;
}

export const DeliveryAddress = ({
  address,
  customer_phone,
}: DeliveryAddressProps) => {
  return (
    <div className="bg-stone-950/50 p-4 rounded-2xl border border-white/5 mb-6">
      <div className="flex items-start gap-3">
        <MapPin
          className="text-amber-500 mt-0.5 shrink-0"
          size={16}
          strokeWidth={2.5}
        />
        <p className="text-sm font-medium text-stone-300 leading-relaxed tracking-wide">
          {address || "Alamat tidak dicantumkan"}
        </p>
      </div>
      {customer_phone && (
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5">
          <Phone size={14} className="text-amber-500" strokeWidth={2.5} />
          <span className="text-xs font-bold text-stone-400 font-mono tracking-wider">
            {customer_phone}
          </span>
        </div>
      )}
    </div>
  );
};
