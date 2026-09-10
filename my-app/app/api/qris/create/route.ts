import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, order_id, customer_name, customer_phone } = body;

    // 1. Validasi Input
    if (!amount || !order_id || !customer_name) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    // 2. Ambil Credentials dari Env (Server-Side Only)
    const apiKey = process.env.QRIS_API_KEY;
    const apiSecret = process.env.QRIS_API_SECRET;
    const apiUrl = process.env.QRIS_API_URL;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (!apiKey || !apiSecret || !apiUrl) {
      console.error("QRIS Credentials missing in .env");
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 },
      );
    }

    // 3. Siapkan Request ke 3rd Party QRIS Provider
    // Docs: /api/create-payment.php
    const endpoint = `${apiUrl}/create-payment.php`;
    const callbackUrl = `${appUrl}/api/qris/webhook`; // Webhook handler (future)

    // Note: Some providers use FormData, some use JSON. Docs say JSON + Headers.
    const payload = {
      amount: Math.max(amount, 1000), // Min 1000 to prevent API rejection
      order_id,
      customer_name,
      customer_phone: customer_phone || "",
      callback_url: callbackUrl,
    };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
        "X-API-Secret": apiSecret,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("QRIS API Error:", data);
      return NextResponse.json(
        { success: false, error: data.error || "Failed to create payment" },
        { status: res.status },
      );
    }

    // 4. Return Data ke Frontend (QR String / URL)
    return NextResponse.json(data);
  } catch (error) {
    console.error("Create QRIS Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
