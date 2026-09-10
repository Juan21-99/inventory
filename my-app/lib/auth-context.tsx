"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  role: "customer" | "admin";
  avatar_url: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithProvider: (provider: "google" | "apple") => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", uid)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          console.log("No profile found for user, will create on first edit");
        } else {
          console.error("Error fetching profile:", error);
        }
        setProfile(null);
        return;
      }
      setProfile(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error fetching profile:", errorMessage, error);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // 1. Initial Session Check (Critical for first load)
    const initSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (mounted && session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
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
      // Only react to changes, avoid conflict with initial check if possible
      if (
        event === "SIGNED_IN" ||
        event === "TOKEN_REFRESHED" ||
        event === "USER_UPDATED"
      ) {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
        setLoading(false);
      } else if (event === "SIGNED_OUT") {
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

    // Gateway Timeout
    if (errorMsg.includes("504") || errorMsg.includes("Gateway Timeout")) {
      return new Error(
        "Server sedang sibuk. Silakan coba lagi dalam beberapa saat.",
      );
    }

    // Connection Timeout
    if (errorMsg.includes("timeout") || errorMsg.includes("timed out")) {
      return new Error(
        "Koneksi terputus. Periksa internet Anda dan coba lagi.",
      );
    }

    // Network Error
    if (
      errorMsg.includes("NetworkError") ||
      errorMsg.includes("Failed to fetch")
    ) {
      return new Error(
        "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
      );
    }

    // Service Unavailable
    if (errorMsg.includes("503") || errorMsg.includes("Service Unavailable")) {
      return new Error("Layanan sedang maintenance. Coba beberapa saat lagi.");
    }

    // Bad Gateway
    if (errorMsg.includes("502") || errorMsg.includes("Bad Gateway")) {
      return new Error("Terjadi masalah pada server. Coba lagi nanti.");
    }

    return error;
  };

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw handleAuthError(error);
    } catch (error) {
      throw handleAuthError(error);
    }
  }, []);

  const signInWithProvider = useCallback(
    async (provider: "google" | "apple") => {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            queryParams: {
              access_type: "offline",
              prompt: "consent",
            },
          },
        });
        if (error) throw handleAuthError(error);
      } catch (error) {
        throw handleAuthError(error);
      }
    },
    [],
  );

  const signUp = useCallback(
    async (email: string, password: string, fullName: string) => {
      try {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        });
        if (error) throw handleAuthError(error);
      } catch (error) {
        throw handleAuthError(error);
      }
    },
    [],
  );

  const sendPasswordReset = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${globalThis.location.origin}/login/reset-password`,
      });
      if (error) throw handleAuthError(error);
    } catch (error) {
      throw handleAuthError(error);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id);
  }, [user, fetchProfile]);

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      signIn,
      signInWithProvider,
      signUp,
      sendPasswordReset,
      signOut,
      refreshProfile,
    }),
    [
      user,
      profile,
      loading,
      signIn,
      signInWithProvider,
      signUp,
      sendPasswordReset,
      signOut,
      refreshProfile,
    ],
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
