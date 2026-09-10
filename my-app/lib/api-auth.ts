import { createServerClient } from "@supabase/ssr";
import { type User } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

interface ApiAuthResult {
  user: User | null;
  role: string | null;
  isLoggedIn: boolean;
  error?: string;
}

export async function verifyApiAuth(
  request: NextRequest,
): Promise<ApiAuthResult> {
  try {
    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {
            // No-op for API routes
          },
        },
      },
    );

    // Get user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        user: null,
        role: null,
        isLoggedIn: false,
        error: "Not authenticated",
      };
    }

    const userRole = (user.user_metadata?.role as string) || null;

    return {
      user,
      role: userRole,
      isLoggedIn: true,
    };
  } catch (error) {
    console.error("[API Auth Error]:", error);
    return {
      user: null,
      role: null,
      isLoggedIn: false,
      error: "Authentication failed",
    };
  }
}

export function requireAuth(authResult: ApiAuthResult): NextResponse | null {
  if (!authResult.isLoggedIn) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        message: "Please log in to access this resource",
      },
      { status: 401 },
    );
  }

  return null; // No error, continue
}

export function requireAdminAuth(
  authResult: ApiAuthResult,
): NextResponse | null {
  // 1. Check if logged in
  const authError = requireAuth(authResult);
  if (authError) return authError;

  // 2. Check if admin
  if (authResult.role !== "admin") {
    return NextResponse.json(
      {
        error: "Forbidden",
        message: "Admin access required",
      },
      { status: 403 },
    );
  }

  return null;
}
