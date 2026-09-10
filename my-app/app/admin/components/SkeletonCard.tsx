export const SkeletonCard = () => (
  <div className="bg-stone-900/40 rounded-[2rem] p-0 border border-white/5 animate-pulse h-full overflow-hidden">
    {/* Visual Section */}
    <div className="aspect-square p-3">
      <div className="w-full h-full rounded-[1.5rem] bg-stone-900/80" />
    </div>

    {/* Info Section */}
    <div className="p-5 pt-2 space-y-4">
      <div className="space-y-2">
        {/* Category */}
        <div className="h-2 bg-stone-800 rounded w-1/3" />
        {/* Title */}
        <div className="h-6 bg-stone-800 rounded w-3/4" />
      </div>

      {/* Price */}
      <div className="flex items-end gap-2">
        <div className="h-7 bg-stone-800 rounded w-1/2" />
        <div className="h-4 bg-stone-800/50 rounded w-1/4 mb-1" />
      </div>

      {/* Actions */}
      <div className="grid grid-cols-[1fr,auto,auto] gap-2 pt-4 border-t border-white/5">
        <div className="h-10 bg-stone-800 rounded-xl" />
        <div className="w-10 h-10 bg-stone-800 rounded-xl" />
        <div className="w-10 h-10 bg-stone-800 rounded-xl" />
      </div>
    </div>
  </div>
);
