"use client";

interface OrderItemProps {
  readonly name: string;
  readonly detail: string;
  readonly price: number;
}

export function OrderItem({ name, detail, price }: OrderItemProps) {
  return (
    <div className="flex justify-between items-center group transition-transform duration-300 hover:translate-x-1">
      <div className="flex flex-col">
        <h4 className="font-black text-white tracking-tighter group-hover:text-amber-400 transition-all uppercase italic text-sm leading-none mb-1">
          {name}
        </h4>
        <p className="text-[9px] font-black text-stone-600 uppercase tracking-[0.2em]">
          {detail}
        </p>
      </div>

      <div className="flex flex-col items-end">
        <div className="font-black text-stone-200 text-sm tracking-tighter italic">
          Rp {price.toLocaleString()}
        </div>
        <div className="w-8 h-px bg-white/5 group-hover:bg-amber-500/30 transition-all mt-1" />
      </div>
    </div>
  );
}
