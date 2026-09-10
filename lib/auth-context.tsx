"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export interface Profile {
  id: string;
  full_name: string | null;
  nip?: string | null;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchedUidRef = useRef<string | null>(null);

  const fetchProfile = useCallback(async (uid: string, userObj?: User | null) => {
    // Prevent duplicate concurrent fetches for the same user ID
    if (fetchedUidRef.current === uid && profile) {
      return;
    }
    fetchedUidRef.current = uid;

    const email = userObj?.email || "";
    const fallbackName =
      userObj?.user_metadata?.full_name ||
      email.split("@")[0] ||
      "Administrator Logistik";

    const fallbackProfile: Profile = {
      id: uid,
      full_name: fallbackName,
      nip: userObj?.user_metadata?.nip || null,
      email: email,
      phone: userObj?.user_metadata?.phone || null,
      avatar_url: userObj?.user_metadata?.avatar_url || null,
    };

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", uid)
        .maybeSingle();

      if (!error && data) {
        setProfile(data);
        return;
      }

      if (!data && !error) {
        try {
          const { data: insertedData } = await supabase
            .from("profiles")
            .upsert(fallbackProfile)
            .select()
            .single();

          if (insertedData) {
            setProfile(insertedData);
            return;
          }
        } catch {
          // Ignore
        }
      }

      setProfile(fallbackProfile);
    } catch {
      setProfile(fallbackProfile);
    }
  }, [profile]);

  useEffect(() => {
    let mounted = true;

    // 1. Initial Session Check (Runs once on mount)
    const initSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (mounted) {
          if (session?.user) {
            setUser(session.user);
            await fetchProfile(session.user.id, session.user);
          } else {
            setUser(null);
            setProfile(null);
          }
        }
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initSession();

    // 2. Realtime Auth Listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (
        event === "SIGNED_IN" ||
        event === "TOKEN_REFRESHED" ||
        event === "USER_UPDATED"
      ) {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id, session.user);
        }
        setLoading(false);
      } else if (event === "SIGNED_OUT") {
        fetchedUidRef.current = null;
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const handleAuthError = (error: any): Error => {
    const errorMsg = error?.message || String(error);

    if (errorMsg.includes("504") || errorMsg.includes("Gateway Timeout")) {
      return new Error("Server sedang sibuk. Silakan coba lagi dalam beberapa saat.");
    }
    if (errorMsg.includes("timeout") || errorMsg.includes("timed out")) {
      return new Error("Koneksi terputus. Periksa internet Anda dan coba lagi.");
    }
    if (errorMsg.includes("NetworkError") || errorMsg.includes("Failed to fetch")) {
      return new Error("Gagal terhubung ke server. Periksa koneksi internet Anda.");
    }
    if (errorMsg.includes("Invalid login credentials")) {
      return new Error("Email atau kata sandi yang Anda masukkan salah.");
    }
    if (errorMsg.includes("Email not confirmed")) {
      return new Error("Email belum dikonfirmasi. Silakan periksa kotak masuk Anda.");
    }

    return new Error(errorMsg);
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw handleAuthError(error);

      if (data.user) {
        setUser(data.user);
        await fetchProfile(data.user.id, data.user);
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      fetchedUidRef.current = null;
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      fetchedUidRef.current = null; // Force refresh
      await fetchProfile(user.id, user);
    }
  };

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      signIn,
      signOut,
      refreshProfile,
    }),
    [user, profile, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
