import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({
              name,
              value,
              ...options,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
            });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({
              name,
              value: "",
              ...options,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
            });
          },
        },
      },
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Supabase Auth Error:", error.message);
    } else {
      console.log("Auth successful, redirecting to home");
      return NextResponse.redirect(`${origin}/`);
    }
  } else {
    console.error("No auth code found in callback URL");
  }

  // Return the user to an error page with some instructions if login fails
  return NextResponse.redirect(`${origin}/login?error=auth-code-error`);
}
