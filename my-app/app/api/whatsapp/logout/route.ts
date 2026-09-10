import { NextRequest, NextResponse } from "next/server";
import { verifyApiAuth, requireAdminAuth } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  // Verify authentication and admin role
  const authResult = await verifyApiAuth(request);
  const authError = requireAdminAuth(authResult);
  if (authError) return authError;
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_WA_API_URL}/api/logout`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(10000),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.error || "Logout failed" },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("WhatsApp logout failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
