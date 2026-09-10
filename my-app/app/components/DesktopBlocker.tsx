"use client";

import { useSyncExternalStore } from "react";
import { Smartphone, Laptop } from "lucide-react";

const QR_CONFIG = {
  SIZE: 200,
  MARGIN: 10,
  BG_COLOR: "1c1917",
  FG_COLOR: "ffffff",
} as const;

function QRCodeDisplay({
  qrUrl,
  qrError,
  onError,
}: Readonly<{
  qrUrl: string;
  qrError: boolean;
  onError: () => void;
}>) {
  if (qrError) {
    return (
      <div className="w-40 h-40 bg-stone-800 rounded-xl flex flex-col items-center justify-center gap-2 p-4">
        <Smartphone className="w-12 h-12 text-amber-500" />
        <p className="text-xs text-stone-400 text-center">
          Buka halaman ini di perangkat mobile Anda
        </p>
      </div>
    );
  }

  if (!qrUrl) {
    return (
      <div
        className="w-40 h-40 bg-stone-800 rounded-xl animate-pulse flex items-center justify-center"
        aria-label="Membuat QR Code"
      >
        <span className="text-xs text-stone-600">Generating QR...</span>
      </div>
    );
  }

  const currentUrl = globalThis.location?.href;

  return (
    <div className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={qrUrl}
        alt={`QR Code untuk membuka ${currentUrl} di perangkat mobile`}
        className="relative rounded-xl w-40 h-40 object-contain shadow-inner mix-blend-screen"
        onError={onError}
        loading="eager"
      />

      <div className="absolute inset-0 border-2 border-amber-500/0 group-hover:border-amber-500/50 rounded-xl transition-all duration-300 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1 bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.8)] animate-scan opacity-50" />
      </div>
    </div>
  );
}

// Custom hook untuk detect client-side
function useIsClient() {
  const isClient = useSyncExternalStore(
    () => () => {}, // subscribe (no-op)
    () => true, // getSnapshot (client)
    () => false, // getServerSnapshot (server)
  );
  return isClient;
}

// Generate QR URL
function generateQrUrl(): string {
  try {
    const currentUrl = globalThis.location?.href;
    if (!currentUrl) return "";

    return `https://api.qrserver.com/v1/create-qr-code/?size=${QR_CONFIG.SIZE}x${QR_CONFIG.SIZE}&data=${encodeURIComponent(
      currentUrl,
    )}&bgcolor=${QR_CONFIG.BG_COLOR}&color=${QR_CONFIG.FG_COLOR}&margin=${QR_CONFIG.MARGIN}`;
  } catch (error) {
    console.error("Failed to generate QR URL:", error);
    return "";
  }
}

export function DesktopBlocker() {
  const isClient = useIsClient();
  const qrUrl = isClient ? generateQrUrl() : "";

  return (
    <dialog
      open
      aria-labelledby="desktop-blocker-title"
      aria-describedby="desktop-blocker-description"
      className="customer-blocker fixed inset-0 z-[9999] w-screen h-screen bg-stone-950 text-white flex flex-col items-center justify-center p-8 text-center border-0 max-w-none max-h-none m-0"
    >
      <div className="relative mb-8">
        <div className="relative" aria-hidden="true">
          <Laptop className="text-stone-800 w-32 h-32" strokeWidth={1} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-24 h-1 bg-red-500 rounded-full rotate-45 shadow-lg shadow-red-500/50" />
          </div>
        </div>

        <div className="absolute -bottom-4 -right-4 bg-stone-900 p-3 rounded-2xl border-4 border-stone-950 shadow-xl">
          <Smartphone className="text-amber-500 w-10 h-10 animate-bounce" />
        </div>
      </div>

      <h1
        id="desktop-blocker-title"
        className="text-3xl font-bold tracking-tight mb-3"
      >
        Mobile Experience
      </h1>
      <p
        id="desktop-blocker-description"
        className="text-stone-400 mb-8 max-w-sm leading-relaxed text-lg"
      >
        Aplikasi pelanggan didesain khusus untuk <br />
        <span className="text-amber-400 font-semibold">
          Smartphone & Tablet
        </span>
      </p>

      <div className="flex flex-col items-center gap-4 bg-stone-900 p-6 rounded-3xl border border-stone-800 shadow-2xl">
        <QRCodeDisplay
          qrUrl={qrUrl}
          qrError={!qrUrl && isClient}
          onError={() => {
            console.error("QR Code image failed to load");
          }}
        />

        <p className="text-sm text-stone-500 font-medium uppercase tracking-widest flex items-center gap-2">
          Scan untuk Membuka
        </p>
      </div>
    </dialog>
  );
}
