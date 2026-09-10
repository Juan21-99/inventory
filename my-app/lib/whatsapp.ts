import { formatPhoneNumber, validatePhoneNumber } from "./utils/phone";

interface WhatsAppResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

/**
 * Send WhatsApp message via Next.js API Route (SECURE)
 * @param phone - Phone number (format: 08xxx atau 628xxx)
 * @param message - Message to send
 * @returns Promise<boolean> - Success status
 */
export const sendWhatsAppMessage = async (
  phone: string,
  message: string,
): Promise<boolean> => {
  try {
    const formattedPhone = formatPhoneNumber(phone);

    if (!validatePhoneNumber(formattedPhone)) {
      console.error(" Invalid phone number format:", phone);
      return false;
    }

    const response = await fetch("/api/whatsapp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: formattedPhone, message }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn(" WhatsApp API error:", errorData);
      return false;
    }

    const data: WhatsAppResponse = await response.json();

    if (data.success) {
      console.log(" WhatsApp sent successfully");
      return true;
    } else {
      console.warn(" WhatsApp send failed:", data.error);
      return false;
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        console.error(" WhatsApp request timeout");
      } else {
        console.error(" WhatsApp error:", error.message);
      }
    }
    return false;
  }
};

/**
 * Check WhatsApp connection status & get QR
 */
export const getWhatsAppStatus = async (): Promise<{
  connected: boolean;
  qr?: string;
  message?: string;
}> => {
  try {
    const response = await fetch("/api/whatsapp/qr", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });

    if (!response.ok) return { connected: false, message: "Server error" };

    const data = await response.json();
    return {
      connected: data.connected || false,
      qr: data.qr,
      message: data.message,
    };
  } catch (error) {
    console.error("Failed to check WA status:", error);
    return { connected: false, message: "Network error" };
  }
};

/**
 * Logout from WhatsApp
 */
export const logoutWhatsApp = async (): Promise<boolean> => {
  try {
    const response = await fetch("/api/whatsapp/logout", {
      method: "POST",
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to logout WA:", error);
    return false;
  }
};

/**
 * Generate pickup ready notification message
 */
export const getPickupReadyMessage = (customerName: string): string => {
  return `*ALIN COFFEE PICKUP* 🥡\n\nHalo Kak ${customerName}, pesanan kamu sudah SIAP! Silakan ambil di kasir ya.\n\nTerima kasih! ☕`;
};

/**
 * Generate delivery in progress message
 */
export const getDeliveryInProgressMessage = (customerName: string): string => {
  return `*ALIN COFFEE DELIVERY* 🛵\n\nHalo Kak ${customerName}, pesanan kamu sedang DIANTAR oleh kurir kami! Mohon ditunggu ya.\n\nTerima kasih! ☕`;
};

/**
 * Generate cancellation message
 */
export const getCancellationMessage = (
  customerName: string,
  orderId: string,
  reason: string,
  orderType: "pickup" | "delivery",
): string => {
  const typeLabel = orderType === "pickup" ? "PICKUP" : "DELIVERY";

  return `*ALIN COFFEE - ${typeLabel}*\n\nMohon maaf Kak ${customerName},\n\nPesanan ${orderType === "pickup" ? "pickup" : "delivery"} kamu (#${orderId.slice(0, 6)}) terpaksa kami batalkan dengan alasan:\n\n"${reason.trim()}"\n\nKami tunggu orderan berikutnya ya! ☕\n\nTerima kasih atas pengertiannya 🙏`;
};
