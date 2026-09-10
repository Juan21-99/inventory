import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

class MiddlewareError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public redirectTo?: string,
  ) {
    super(message);
    this.name = "MiddlewareError";
  }
}

function handleMiddlewareError(error: unknown, request: NextRequest) {
  console.error("[Middleware Error]:", {
    message: error instanceof Error ? error.message : "Unknown error",
    stack: error instanceof Error ? error.stack : undefined,
    url: request.url,
    timestamp: new Date().toISOString(),
  });

  // In production, redirect to safe page
  return NextResponse.redirect(new URL("/login", request.url));
}

export async function updateSession(request: NextRequest) {
  try {
    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new MiddlewareError("Missing NEXT_PUBLIC_SUPABASE_URL", 500);
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new MiddlewareError("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY", 500);
    }

    const response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                request.cookies.set(name, value);
                response.cookies.set(name, value, options);
              });
            } catch (error) {
              console.warn(
                "[Middleware Warning]: Failed to set cookies:",
                error,
              );
            }
          },
        },
      },
    );

    // Get user with timeout to prevent hanging
    const userPromise = supabase.auth.getUser();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new MiddlewareError("Auth timeout", 504)), 10000),
    );

    let user: { user_metadata?: { role?: string } } | null = null;
    try {
      const result = await Promise.race([userPromise, timeoutPromise]);
      const authResult = result as {
        data?: { user?: { user_metadata?: { role?: string } } | null };
      };
      user = authResult?.data?.user ?? null;
    } catch (error) {
      if (error instanceof MiddlewareError && error.statusCode === 504) {
        console.warn("[Middleware Warning]: Auth request timed out");
        user = null; // Continue without user
      } else {
        // Invalid JWT or other auth errors
        console.warn("[Middleware Warning]: Auth error: ", error);
        user = null; // Continue without user
      }
    }

    // Get the pathname
    const pathname = request.nextUrl.pathname;

    // Skip middleware for public routes and API routes
    if (
      APP_ROUTES.public.includes(pathname) ||
      pathname.startsWith("/api/") ||
      pathname.startsWith("/_next/") ||
      pathname.includes(".")
    ) {
      return response;
    }

    // Check if user is logged in
    const isLoggedIn = !!user;

    // Handle Redirects
    const redirectUrl = getRedirectPath(
      pathname,
      request.url,
      isLoggedIn,
    );

    if (redirectUrl) {
      return NextResponse.redirect(redirectUrl);
    }

    return response;
  } catch (error) {
    return handleMiddlewareError(error, request);
  }
}

// Route Configuration
const APP_ROUTES = {
  login: "/login",
  admin: "/admin",
  authCallback: "/auth/callback",
  public: ["/api/auth/callback", "/auth/callback"],
};

function getRedirectPath(
  pathname: string,
  requestUrl: string,
  isLoggedIn: boolean,
): URL | null {
  const { login, admin, authCallback } = APP_ROUTES;

  const isAuthPage = pathname === login || pathname === authCallback;
  const isAdminRoute = pathname.startsWith(admin);

  // 1. Jika user sudah login dan mengakses halaman login/callback -> redirect ke /admin
  if (isLoggedIn && isAuthPage) {
    return new URL(admin, requestUrl);
  }

  // 2. Akses Root Path ("/")
  if (pathname === "/") {
    return new URL(isLoggedIn ? admin : login, requestUrl);
  }

  // 3. Proteksi Route Admin: Belum login -> redirect ke /login
  if (!isLoggedIn && isAdminRoute) {
    return new URL(login, requestUrl);
  }

  return null;
}
