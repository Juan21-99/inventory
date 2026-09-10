import React from "react";

export const OptionGroupSkeleton = () => {
  return (
    <div className="bg-stone-900/50 border border-white/5 rounded-3xl overflow-hidden p-6 space-y-6 animate-pulse">
      {/* Group Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2 w-full max-w-md">
          {/* Title Placeholder */}
          <div className="h-7 w-1/3 bg-stone-800/50 rounded-lg" />

          {/* Badges Placeholder */}
          <div className="flex gap-2">
            <div className="h-5 w-20 bg-stone-800/30 rounded" />
            <div className="h-5 w-16 bg-stone-800/30 rounded" />
          </div>
        </div>

        {/* Action Buttons Placeholder */}
        <div className="flex gap-2">
          <div className="w-8 h-8 bg-stone-800/50 rounded-lg" />
          <div className="w-8 h-8 bg-stone-800/50 rounded-lg" />
        </div>
      </div>

      {/* Items List Placeholder */}
      <div className="bg-stone-950/30 rounded-2xl border border-white/5 p-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 p-2">
          {/* Item Placeholders */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex justify-between items-center bg-stone-900/30 px-4 py-3 rounded-xl border border-white/5"
            >
              <div className="space-y-1.5 w-full">
                <div className="h-4 w-1/2 bg-stone-800/50 rounded" />
                <div className="h-3 w-1/4 bg-stone-800/30 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Add Item Button Placeholder */}
        <div className="p-2 pt-0 mt-2">
          <div className="w-full h-10 bg-stone-800/20 rounded-xl" />
        </div>
      </div>
    </div>
  );
};
