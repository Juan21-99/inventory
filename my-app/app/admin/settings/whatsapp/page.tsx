"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { RefreshCw, CheckCircle, Smartphone, Loader2 } from "lucide-react";
import Modal from "../../../components/ui/Modal";

const POLLING_INTERVAL = 3000;
const MAX_LOGS = 5;
const FETCH_TIMEOUT = 10000;
const API_BASE_URL = process.env.NEXT_PUBLIC_WA_API_URL;

type ConnectionStatus = "disconnected" | "connected" | "loading";

interface ApiResponse {
  connected?: boolean;
  message?: string;
  success?: boolean;
  qr?: string;
}

export default function WhatsAppSettingsPage() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("loading");
  const [lastCheck, setLastCheck] = useState<Date>(new Date());
  const [logs, setLogs] = useState<string[]>([]);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Helper: Add log with size limit
  const addLog = useCallback((msg: string) => {
    setLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] ${msg}`,
      ...prev.slice(0, MAX_LOGS - 1),
    ]);
  }, []);

  // Helper: Validate base64 QR code
  const isValidBase64 = (str: string): boolean => {
    try {
      return str.startsWith("data:image/") && str.length > 100;
    } catch {
      return false;
    }
  };

  // Helper: Fetch with timeout
  const fetchWithTimeout = async (
    url: string,
    options: RequestInit = {},
    timeout: number = FETCH_TIMEOUT,
  ): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  };

  const handleConnectedResponse = useCallback(() => {
    setQrCode(null);
    setStatus("connected");
    setLogs([]);
  }, []);

  const handleQrCodeResponse = useCallback(
    (qr: string) => {
      if (isValidBase64(qr)) {
        setQrCode(qr);
        setStatus("disconnected");
        setLogs([]);
      } else {
        addLog("QR code tidak valid dari server");
      }
    },
    [addLog],
  );

  const handleLoadingResponse = useCallback(
    (message?: string) => {
      setStatus("loading");
      if (message === "QR not ready yet") {
        addLog("Menunggu generate QR dari Server...");
      } else if (message) {
        addLog(`API Response: ${message}`);
      }
    },
    [addLog],
  );

  const handleConnectionError = useCallback(
    (error: unknown) => {
      console.error("Gagal connect:", error);
      setStatus("loading");

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          addLog("Request timeout (10s)");
        } else {
          addLog(error.message || "Network/CORS Error");
        }
      } else {
        addLog("Unknown error occurred");
      }
    },
    [addLog],
  );

  const checkConnection = useCallback(async () => {
    try {
      // Use internal Next.js API route
      const res = await fetchWithTimeout("/api/whatsapp/qr");

      if (!res.ok) {
        throw new Error(`HTTP Error: ${res.status}`);
      }

      const data: ApiResponse = await res.json();
      setLastCheck(new Date());

      // Early returns to reduce nesting
      if (data.connected === true || data.message === "Already connected") {
        handleConnectedResponse();
        return;
      }

      if (data.success && data.qr) {
        handleQrCodeResponse(data.qr);
        return;
      }

      handleLoadingResponse(data.message);
    } catch (error: unknown) {
      handleConnectionError(error);
    }
  }, [
    handleConnectedResponse,
    handleQrCodeResponse,
    handleLoadingResponse,
    handleConnectionError,
  ]);

  // Logout handler
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Use internal Next.js API route
      await fetchWithTimeout("/api/whatsapp/logout", {
        method: "POST",
      });

      setQrCode(null);
      setStatus("loading");
      addLog("Logout berhasil. Meminta QR baru...");
      toast.success("Berhasil logout dari WhatsApp");
      setIsLogoutModalOpen(false);

      setTimeout(() => checkConnection(), 500);
    } catch (error: unknown) {
      console.error(error);
      toast.error("Gagal logout. Cek koneksi backend.");
      if (error instanceof Error) {
        addLog(`Logout error: ${error.message}`);
      }
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Polling with cleanup
  useEffect(() => {
    checkConnection();

    const interval = setInterval(() => {
      checkConnection();
    }, POLLING_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, [checkConnection]);

  return (
    <div className="px-6 pt-2 pb-32 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="bg-stone-900/60 backdrop-blur-xl p-6 rounded-[2rem] shadow-xl border border-white/5 mb-8 sticky top-2 z-10">
        <h1 className="text-2xl font-black text-white tracking-tight">
          Integrasi WhatsApp
        </h1>
        <p className="text-stone-400 text-sm mt-2">
          Hubungkan bot WhatsApp untuk notifikasi otomatis pesanan
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* KOLOM KIRI: STATUS & QR */}
        <section
          className="bg-stone-900/50 backdrop-blur-md rounded-[2.5rem] shadow-xl border border-white/5 p-8 flex flex-col items-center justify-center min-h-[500px]"
          aria-label="Status koneksi WhatsApp"
        >
          {status === "loading" && (
            <div className="text-center animate-in fade-in duration-500">
              <div className="relative mb-8 flex items-center justify-center">
                <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-3xl animate-pulse" />
                <Loader2
                  className="w-16 h-16 text-amber-500 animate-spin relative z-10"
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
              </div>
              <p className="font-black text-white text-lg tracking-tight">
                Mencari Robot WA...
              </p>
              <p className="text-xs text-stone-500 mt-3 font-medium uppercase tracking-wider">
                Pastikan backend sudah running
              </p>
            </div>
          )}

          {status === "disconnected" && qrCode && (
            <div className="text-center animate-in fade-in zoom-in duration-500">
              <div className="relative inline-block p-5 bg-white rounded-[2rem] shadow-2xl shadow-amber-500/10 mb-8 border-4 border-amber-500/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrCode}
                  alt="QR Code untuk menghubungkan WhatsApp"
                  className="w-72 h-72 object-contain"
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/30 animate-pulse border-4 border-white">
                  <Smartphone
                    className="text-white"
                    size={28}
                    strokeWidth={2.5}
                    aria-hidden="true"
                  />
                </div>
              </div>
              <h2 className="text-2xl font-black text-white mb-3 tracking-tight">
                Scan QR Code
              </h2>
              <p className="text-stone-400 max-w-sm mx-auto mb-6 text-sm leading-relaxed">
                Buka <span className="text-white font-bold">WhatsApp</span> di
                HP → Perangkat Tertaut → Tautkan Perangkat
              </p>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/20">
                <RefreshCw
                  size={14}
                  className="animate-spin"
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
                <span className="uppercase tracking-wider">
                  Auto-refresh 3s
                </span>
              </div>
            </div>
          )}

          {status === "connected" && (
            <div className="text-center animate-in fade-in zoom-in duration-700">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-green-500/30 rounded-full blur-3xl animate-pulse" />
                <output
                  className="relative z-10 block w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-green-500/30 border-4 border-white/10"
                  aria-label="WhatsApp terhubung"
                >
                  <CheckCircle size={72} strokeWidth={2} aria-hidden="true" />
                </output>
              </div>
              <h2 className="text-3xl font-black text-white mb-3 tracking-tight">
                Terhubung!
              </h2>
              <p className="text-stone-400 mb-8 text-sm">
                Robot WA{" "}
                <span className="text-amber-500 font-bold">Alin Coffee</span>{" "}
                siap bekerja
              </p>
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(true)}
                className="px-6 py-3 bg-white/5 backdrop-blur-sm border border-red-400/30 text-red-400 rounded-xl hover:bg-red-500/10 hover:border-red-400/50 transition-all text-sm font-black uppercase tracking-wider cursor-pointer active:scale-95 shadow-lg"
                aria-label="Putuskan koneksi WhatsApp"
              >
                Putuskan Koneksi
              </button>
            </div>
          )}
        </section>

        {/* KOLOM KANAN: PANDUAN & LOG */}
        <div className="space-y-6">
          {/* Panduan */}
          <section className="bg-gradient-to-br from-amber-500/10 to-stone-900/50 backdrop-blur-md p-6 rounded-[2rem] shadow-xl border border-amber-500/20">
            <h2 className="font-black text-lg mb-5 flex items-center gap-3 text-white uppercase tracking-wider">
              <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                <Smartphone
                  size={20}
                  className="text-amber-500"
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
              </div>
              Panduan Koneksi
            </h2>
            <ol className="space-y-4 text-sm text-stone-300 list-decimal list-inside">
              <li className="pl-2 leading-relaxed">
                Tunggu sampai{" "}
                <span className="text-white font-bold">QR Code</span> muncul di
                sebelah kiri
              </li>
              <li className="pl-2 leading-relaxed">
                Scan menggunakan aplikasi{" "}
                <span className="text-white font-bold">WhatsApp resmi</span>
              </li>
              <li className="pl-2 leading-relaxed">
                Setelah terhubung, notifikasi order akan{" "}
                <span className="text-amber-400 font-bold">
                  otomatis terkirim
                </span>
              </li>
            </ol>
          </section>

          {/* Status Jaringan & Logs */}
          <section
            className="bg-stone-900/50 backdrop-blur-md border border-white/5 p-6 rounded-[2rem] shadow-xl"
            aria-label="Informasi status jaringan"
          >
            <h3 className="text-[10px] font-black text-stone-500 mb-5 uppercase tracking-[0.2em]">
              Status Jaringan
            </h3>
            <dl className="space-y-4">
              <div className="flex justify-between items-center">
                <dt className="text-sm text-stone-400 font-medium">
                  Backend API
                </dt>
                <dd className="font-mono text-xs text-amber-500 bg-stone-950 px-3 py-1.5 rounded-lg border border-white/5">
                  {API_BASE_URL || "Not Set"}
                </dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-sm text-stone-400 font-medium">
                  Last Check
                </dt>
                <dd className="font-mono text-xs text-green-400 font-bold">
                  {lastCheck.toLocaleTimeString()}
                </dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-sm text-stone-400 font-medium">Status</dt>
                <dd
                  className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-wider ${
                    status === "connected"
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : status === "disconnected"
                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  }`}
                >
                  {status}
                </dd>
              </div>
            </dl>

            {/* LOGS DISPLAY */}
            <div className="mt-6 pt-6 border-t border-white/5">
              <h4 className="text-[10px] font-black text-stone-500 mb-3 uppercase tracking-[0.2em]">
                Activity Log
              </h4>
              <output
                className="block bg-stone-950 rounded-xl p-4 text-xs font-mono text-stone-400 space-y-2 h-32 overflow-y-auto border border-white/5 scrollbar-thin scrollbar-thumb-stone-700 scrollbar-track-transparent"
                aria-live="polite"
                aria-label="Log aktivitas"
              >
                {logs.length > 0 ? (
                  logs.map((log, idx) => (
                    <div
                      key={`log-${idx}-${log.slice(1, 10)}`}
                      className="border-b border-white/5 pb-2 last:border-0"
                    >
                      {log}
                    </div>
                  ))
                ) : (
                  <p className="text-stone-600 italic text-center py-4">
                    Belum ada aktivitas
                  </p>
                )}
              </output>
            </div>
          </section>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => !isLoggingOut && setIsLogoutModalOpen(false)}
        title="Putuskan Koneksi WhatsApp?"
        description="Anda akan logout dari sesi WhatsApp saat ini. Bot tidak akan bisa mengirim notifikasi sampai Anda scan QR ulang."
        isDraggable={false}
      >
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={() => setIsLogoutModalOpen(false)}
            disabled={isLoggingOut}
            className="px-5 py-2.5 bg-stone-800 text-white rounded-xl hover:bg-stone-700 transition-all font-bold text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="px-5 py-2.5 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-black shadow-2xl shadow-red-500/30 flex items-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed border border-red-400/20 uppercase tracking-wider text-sm"
          >
            {isLoggingOut && (
              <Loader2
                size={16}
                className="animate-spin"
                strokeWidth={2.5}
                aria-hidden="true"
              />
            )}
            {isLoggingOut ? "Memproses..." : "Ya, Putuskan"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
