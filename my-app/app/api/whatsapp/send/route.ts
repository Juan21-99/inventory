import { NextRequest, NextResponse } from "next/server";
import { verifyApiAuth, requireAdminAuth } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  // Verify authentication and admin role
  const authResult = await verifyApiAuth(request);
  const authError = requireAdminAuth(authResult);
  if (authError) return authError;
  try {
    const { phone, message } = await request.json();

    if (!phone || !message) {
      return NextResponse.json(
        { success: false, error: "Phone and message are required" },
        { status: 400 },
      );
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_WA_API_URL}/api/send`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone, message }),
        signal: AbortSignal.timeout(10000), // 10s timeout
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.error || "Failed to send message" },
        { status: response.status },
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("WhatsApp API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
