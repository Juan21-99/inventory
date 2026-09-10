"use client";

import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface QrisTimerProps {
  readonly expiresAt: string | null;
}

export function QrisTimer({ expiresAt }: QrisTimerProps) {
  const [timeLeft, setTimeLeft] = useState("00:00");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!expiresAt) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const expiry = new Date(expiresAt).getTime();
      const difference = expiry - now;

      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft("EXPIRED");
        setIsExpired(true);
      } else {
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60),
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft(
          `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <div
      className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase border ${
        isExpired
          ? "bg-stone-800 text-stone-500 border-stone-800"
          : "bg-red-500/10 text-red-500 border-red-500/20"
      }`}
    >
      <Clock size={14} className={isExpired ? "" : "animate-pulse"} />
      {timeLeft}
    </div>
  );
}
