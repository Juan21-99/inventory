import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const transactionId = searchParams.get("transaction_id");

    if (!transactionId) {
      return NextResponse.json(
        { success: false, error: "Missing transaction_id" },
        { status: 400 },
      );
    }

    // Credentials
    const apiKey = process.env.QRIS_API_KEY;
    const apiSecret = process.env.QRIS_API_SECRET;
    const apiUrl = process.env.QRIS_API_URL;

    if (!apiKey || !apiSecret || !apiUrl) {
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 },
      );
    }

    // Call 3rd Party Check Status
    const endpoint = `${apiUrl}/check-payment.php?transaction_id=${transactionId}`;

    const res = await fetch(endpoint, {
      method: "GET",
      headers: {
        "X-API-Key": apiKey,
        "X-API-Secret": apiSecret,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: data.error || "Failed to check status" },
        { status: res.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Check Status Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
