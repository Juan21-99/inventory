export const OrderSkeleton = () => {
  return (
    <div className="bg-stone-900/40 rounded-[2rem] border border-white/5 p-6 animate-pulse flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
      <div className="flex items-center gap-5 flex-1">
        {/* Icon placeholder */}
        <div className="w-14 h-14 bg-stone-900 rounded-2xl shrink-0 border border-white/5" />

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {/* Customer name placeholder */}
            <div className="h-5 w-40 bg-stone-800 rounded" />
            {/* ID placeholder */}
            <div className="h-4 w-16 bg-stone-900 rounded" />
          </div>
          <div className="flex items-center gap-2">
            {/* Metadata placeholders */}
            <div className="h-3 w-16 bg-stone-800/50 rounded" />
            <div className="w-1 h-1 rounded-full bg-stone-700" />
            <div className="h-3 w-12 bg-stone-800/50 rounded" />
            <div className="w-1 h-1 rounded-full bg-stone-700" />
            <div className="h-3 w-20 bg-amber-500/20 rounded" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-5 w-full md:w-auto justify-between md:justify-end pl-20 md:pl-0">
        {/* Status badge placeholder */}
        <div className="h-6 w-24 bg-stone-900 rounded-xl" />
        {/* Expand button placeholder */}
        <div className="w-9 h-9 bg-stone-800 rounded-full" />
      </div>
    </div>
  );
};
