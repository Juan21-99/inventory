"use client";

import { Sparkles } from "lucide-react";

export const PromoSkeleton = () => {
  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-stone-900/40 animate-pulse">
      {/* Visual Preview Placeholder */}
      <div className="aspect-[16/8] p-7 relative overflow-hidden bg-stone-900/50">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full blur-[60px]" />

        <div className="relative z-10 h-full flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-3">
              {/* Icon placeholder */}
              <div className="w-11 h-11 bg-stone-800 rounded-2xl border border-white/5 flex items-center justify-center text-stone-700">
                <Sparkles size={22} />
              </div>
              {/* Badge placeholder */}
              <div className="h-6 w-16 bg-stone-800 rounded-xl" />
            </div>
            {/* Title placeholder */}
            <div className="h-8 w-3/4 bg-stone-800 rounded-lg mb-2" />
            {/* Description placeholder */}
            <div className="space-y-2">
              <div className="h-3 w-1/2 bg-stone-800/60 rounded" />
              <div className="h-3 w-1/3 bg-stone-800/60 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Admin Actions Placeholder */}
      <div className="bg-stone-950/40 p-5 flex items-center gap-3 border-t border-white/5">
        {/* Toggle button placeholder */}
        <div className="flex-1 h-11 bg-stone-900 rounded-2xl border border-white/5" />
        {/* Edit/Delete buttons placeholders */}
        <div className="flex gap-2">
          <div className="w-11 h-11 bg-stone-900 rounded-2xl border border-white/5" />
          <div className="w-11 h-11 bg-stone-900 rounded-2xl border border-white/5" />
        </div>
      </div>
    </div>
  );
};
