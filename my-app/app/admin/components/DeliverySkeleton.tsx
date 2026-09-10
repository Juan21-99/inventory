export const DeliverySkeleton = () => {
  return (
    <div className="bg-stone-900/40 rounded-[2rem] border border-white/5 p-5 shadow-sm animate-pulse flex flex-col h-full min-h-[320px]">
      {/* Header: Icon + Name + Badge */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          {/* Icon Circle */}
          <div className="w-10 h-10 bg-stone-900 rounded-full shrink-0 border border-white/5" />
          <div className="space-y-2">
            {/* Name */}
            <div className="h-4 w-32 bg-stone-800 rounded" />
            {/* ID */}
            <div className="h-3 w-16 bg-stone-800/50 rounded" />
          </div>
        </div>
        {/* Status Badge */}
        <div className="h-6 w-20 bg-stone-900 rounded-full" />
      </div>

      {/* Address Box Placeholder */}
      <div className="bg-stone-900/50 p-3 rounded-2xl border border-white/5 mb-4 space-y-2">
        <div className="flex gap-2">
          <div className="w-4 h-4 bg-stone-800 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-full bg-stone-800 rounded" />
            <div className="h-3 w-2/3 bg-stone-800 rounded" />
          </div>
        </div>
        <div className="h-px bg-stone-800/50 w-full my-2" />
        <div className="flex gap-2">
          <div className="w-4 h-4 bg-stone-800 rounded-full shrink-0" />
          <div className="h-3 w-24 bg-stone-800 rounded" />
        </div>
      </div>

      {/* Items Summary Placeholder */}
      <div className="space-y-3 mb-4 flex-1">
        <div className="flex justify-between items-center">
          <div className="h-3 w-24 bg-stone-800 rounded" />
          <div className="h-3 w-16 bg-stone-800/50 rounded" />
        </div>
        <div className="flex justify-between items-center">
          <div className="h-3 w-20 bg-stone-800 rounded" />
          <div className="h-3 w-16 bg-stone-800/50 rounded" />
        </div>
      </div>

      {/* Footer: Price + Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
        <div className="h-5 w-28 bg-stone-800 rounded" /> {/* Total Price */}
        <div className="flex gap-2">
          <div className="h-9 w-20 bg-stone-800 rounded-xl" />
          <div className="h-9 w-20 bg-stone-800 rounded-xl" />
        </div>
      </div>
    </div>
  );
};
