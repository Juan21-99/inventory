import { createServerClient } from "@supabase/ssr";
import { type User } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export interface ApiAuthResult {
  user: User | null;
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
        isLoggedIn: false,
        error: "Not authenticated",
      };
    }

    return {
      user,
      isLoggedIn: true,
    };
  } catch (error) {
    console.error("[API Auth Error]:", error);
    return {
      user: null,
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

// Alias for convenience across API routes
export const requireAdminAuth = requireAuth;
