import { NextRequest, NextResponse } from "next/server";
import { verifyApiAuth, requireAdminAuth } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  // Verify authentication and admin role
  const authResult = await verifyApiAuth(request);
  const authError = requireAdminAuth(authResult);
  if (authError) return authError;
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_WA_API_URL}/api/qr`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(10000),
        cache: "no-store",
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.error || "Failed to fetch status" },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("WhatsApp status check failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
        connected: false,
      },
      { status: 500 },
    );
  }
}
