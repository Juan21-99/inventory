import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

// Server-side Supabase client
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// GET: List all registered user profiles
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ users: data || [] });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal memuat pengguna" },
      { status: 500 }
    );
  }
}

// POST: Create a new user account + profile
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, full_name, nip, phone, avatar_url } = body;

    if (!email || !password || !full_name) {
      return NextResponse.json(
        { error: "Email, kata sandi, dan nama lengkap wajib diisi." },
        { status: 400 }
      );
    }

    // 1. Create user in Supabase Auth (with email auto-confirmed)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: full_name.trim(),
        nip: nip?.trim() || null,
        phone: phone?.trim() || null,
        avatar_url: avatar_url || null,
      },
    });

    if (authError) {
      // Fallback: If service role key is not configured, try standard signup
      const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.signUp({
        email: email.trim().toLowerCase(),
        password: password,
        options: {
          data: {
            full_name: full_name.trim(),
            nip: nip?.trim() || null,
            phone: phone?.trim() || null,
            avatar_url: avatar_url || null,
          },
        },
      });

      if (signUpError) {
        return NextResponse.json({ error: signUpError.message }, { status: 400 });
      }

      const userId = signUpData.user?.id;
      if (userId) {
        // Upsert into profiles
        await supabaseAdmin.from("profiles").upsert({
          id: userId,
          full_name: full_name.trim(),
          email: email.trim().toLowerCase(),
          nip: nip?.trim() || null,
          phone: phone?.trim() || null,
          avatar_url: avatar_url || null,
        });
      }

      return NextResponse.json({
        success: true,
        user: signUpData.user,
        message: "Pengguna berhasil didaftarkan.",
      });
    }

    const newUserId = authData.user.id;

    // 2. Ensure profile exists in profiles table
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id: newUserId,
        full_name: full_name.trim(),
        email: email.trim().toLowerCase(),
        nip: nip?.trim() || null,
        phone: phone?.trim() || null,
        avatar_url: avatar_url || null,
      })
      .select()
      .single();

    if (profileError) {
      console.warn("Profile upsert notice:", profileError.message);
    }

    return NextResponse.json({
      success: true,
      user: profileData || authData.user,
      message: "Pengguna baru berhasil dibuat dan siap login.",
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal membuat pengguna." },
      { status: 500 }
    );
  }
}

// DELETE: Delete user account
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "User ID diperlukan." }, { status: 400 });
    }

    // Try deleting from auth.users via admin
    try {
      await supabaseAdmin.auth.admin.deleteUser(id);
    } catch {
      // Fallback
    }

    // Delete from public.profiles
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", id);

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Pengguna berhasil dihapus." });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal menghapus pengguna." },
      { status: 500 }
    );
  }
}
